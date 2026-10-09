const Attempt = require("../attempt/attempt.model");
const Problem = require("../problem/problem.model");
const Revision = require("../revision/revision.model");
const aiProvider = require("./aiProvider.service");

/**
 * AI Evaluation Service
 * Evaluates user attempts statically against problem specifications,
 * updates canonical learning data on Attempt, and triggers Revision retries when recommended.
 */
const evaluateAttempt = async (userId, attemptId) => {
  if (!userId || !attemptId) {
    const error = new Error("UserId and AttemptId are required.");
    error.statusCode = 400;
    throw error;
  }

  // Load Attempt populated with Problem
  const attempt = await Attempt.findOne({ _id: attemptId, userId }).populate("problemId");

  if (!attempt) {
    const error = new Error("Attempt not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  if (!attempt.problemId) {
    const error = new Error("Associated problem not found for this attempt.");
    error.statusCode = 404;
    throw error;
  }

  // Set status to PENDING
  attempt.aiEvaluation = attempt.aiEvaluation || {};
  attempt.aiEvaluation.status = "PENDING";
  attempt.aiEvaluation.error = null;
  await attempt.save();

  try {
    // 1. Gather historical pattern context from MongoDB
    const problemPatterns = Array.isArray(attempt.problemId.patterns) ? attempt.problemId.patterns : [];
    const primaryPattern = problemPatterns[0] || "General";

    let patternContext = {
      primaryPattern,
      patterns: problemPatterns,
      totalPatternSolved: 0,
      avgHints: 0,
      currentHints: attempt.hintsUsed || attempt.hints || 0,
      isHintSpike: false,
      cleanSolvesCount: 0
    };

    try {
      const searchPatterns = problemPatterns.length > 0 ? problemPatterns : [primaryPattern];
      const matchingProblems = await Problem.find({
        patterns: { $in: searchPatterns }
      }).select("_id").lean();

      const matchingProbIds = matchingProblems.map(p => p._id);

      const pastAttempts = await Attempt.find({
        userId,
        problemId: { $in: matchingProbIds },
        _id: { $ne: attempt._id }
      }).select("problemId outcome confidence hintsUsed hints").lean();

      const solvedProblemIds = new Set();
      let pastHintsSum = 0;
      let pastSolvedAttemptsCount = 0;
      let cleanSolvesCount = 0;

      const isOutcomeSolved = (out) => {
        if (!out) return false;
        const o = String(out).toLowerCase();
        return o.includes("solved") && !o.includes("couldnot") && !o.includes("need");
      };

      pastAttempts.forEach(pa => {
        if (isOutcomeSolved(pa.outcome)) {
          solvedProblemIds.add(pa.problemId.toString());
          const h = pa.hintsUsed ?? pa.hints ?? 0;
          pastHintsSum += h;
          pastSolvedAttemptsCount++;
          if (h === 0) cleanSolvesCount++;
        }
      });

      const totalPatternSolved = solvedProblemIds.size;
      const avgHints = pastSolvedAttemptsCount > 0 ? (pastHintsSum / pastSolvedAttemptsCount) : 0;
      const currentHints = attempt.hintsUsed ?? attempt.hints ?? 0;

      // Spike detection: e.g. user smoothly solved >= 2 problems on this pattern, previously averaged low hints, and now took >= 2 hints
      const isHintSpike = totalPatternSolved >= 2 && currentHints >= 2 && (currentHints >= avgHints + 1.2 || currentHints >= 3);

      patternContext = {
        primaryPattern,
        patterns: problemPatterns,
        totalPatternSolved,
        avgHints: Math.round(avgHints * 10) / 10,
        currentHints,
        isHintSpike,
        cleanSolvesCount
      };
    } catch (histErr) {
      console.warn("Failed to gather pattern history for attempt evaluation:", histErr.message);
    }

    // Request static evaluation from AI provider with pattern history
    const evalResult = await aiProvider.evaluateAttempt({
      problem: attempt.problemId,
      attempt,
      patternContext
    });

    // Update Attempt with AI evaluation results
    attempt.aiEvaluation = {
      status: "COMPLETED",
      evaluatedAt: new Date(),
      error: null,

      verdict: evalResult.verdict,
      derivedApproach: evalResult.derivedApproach,
      derivedAlgorithm: evalResult.derivedAlgorithm,
      derivedComplexity: evalResult.derivedComplexity,

      approachCorrect: evalResult.approachCorrect,
      codeCorrect: evalResult.codeCorrect,
      complexityCorrect: evalResult.complexityCorrect,
      efficiency: evalResult.efficiency,

      issues: evalResult.issues || [],
      whatWasDoneWell: evalResult.whatWasDoneWell || [],
      whatNeedsFixing: evalResult.whatNeedsFixing || [],
      keyLearning: evalResult.keyLearning || "",
      retryRecommended: evalResult.retryRecommended || patternContext.isHintSpike || false,
      retryFocus: evalResult.retryFocus || "",
      confidenceAdjustment: evalResult.confidenceAdjustment || "",

      coachFeedback: evalResult.coachFeedback || "",
      patternContext: {
        pattern: patternContext.primaryPattern,
        totalPatternSolved: patternContext.totalPatternSolved,
        avgHints: patternContext.avgHints,
        isSpike: patternContext.isHintSpike
      }
    };

    // Update canonical learning fields on Attempt using AI derivation
    if (evalResult.derivedApproach) attempt.approach = evalResult.derivedApproach;
    if (evalResult.derivedAlgorithm) attempt.algorithm = evalResult.derivedAlgorithm;
    if (evalResult.derivedComplexity) {
      attempt.complexity = {
        time: evalResult.derivedComplexity.time,
        space: evalResult.derivedComplexity.space
      };
    }

    await attempt.save();

    // Trigger Revision recommendation if retry is recommended or if hint spike occurred
    const needsRevision = evalResult.retryRecommended ||
                          evalResult.verdict === "NEEDS_ANOTHER_ATTEMPT" ||
                          patternContext.isHintSpike ||
                          patternContext.currentHints >= 3;

    if (needsRevision) {
      try {
        const existingRevision = await Revision.findOne({
          userId,
          problemId: attempt.problemId._id,
          status: "Pending"
        });

        const revisionFocus = patternContext.isHintSpike
          ? `Revise twice: Master tricky ${patternContext.primaryPattern} variation (needed ${patternContext.currentHints} hints after ${patternContext.totalPatternSolved} smooth solves). Solidify edge cases!`
          : (evalResult.retryFocus || evalResult.keyLearning || "AI-recommended retry focus");

        const revisionReason = patternContext.isHintSpike || patternContext.currentHints > 0
          ? "HintsUsed"
          : "AIEvaluationRetry";

        if (!existingRevision) {
          await Revision.create({
            userId,
            problemId: attempt.problemId._id,
            sourceAttemptId: attempt._id,
            reason: revisionReason,
            focus: revisionFocus,
            scheduledFor: new Date(),
            status: "Pending"
          });
        } else {
          existingRevision.sourceAttemptId = attempt._id;
          existingRevision.focus = revisionFocus;
          existingRevision.reason = revisionReason;
          await existingRevision.save();
        }
      } catch (revErr) {
        console.error("Failed to schedule revision for AI evaluation retry:", revErr.message);
      }
    }

    return attempt;
  } catch (err) {
    console.error("AI Evaluation error for attempt", attemptId, ":", err.message);
    attempt.aiEvaluation = attempt.aiEvaluation || {};
    attempt.aiEvaluation.status = "FAILED";
    attempt.aiEvaluation.error = err.message || "Evaluation request failed.";
    await attempt.save();
    return attempt;
  }
};

const getEvaluationByAttemptId = async (userId, attemptId) => {
  const attempt = await Attempt.findOne({ _id: attemptId, userId }).select("aiEvaluation problemId outcome confidence code");
  if (!attempt) {
    const error = new Error("Attempt not found.");
    error.statusCode = 404;
    throw error;
  }
  return attempt.aiEvaluation || { status: "NOT_REQUESTED" };
};

module.exports = {
  evaluateAttempt,
  getEvaluationByAttemptId
};
