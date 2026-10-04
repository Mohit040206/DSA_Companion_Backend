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
    // Request static evaluation from AI provider
    const evalResult = await aiProvider.evaluateAttempt({
      problem: attempt.problemId,
      attempt
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
      retryRecommended: evalResult.retryRecommended || false,
      retryFocus: evalResult.retryFocus || "",
      confidenceAdjustment: evalResult.confidenceAdjustment || ""
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

    // Trigger Revision recommendation if retry is recommended
    if (evalResult.retryRecommended || evalResult.verdict === "NEEDS_ANOTHER_ATTEMPT") {
      try {
        const existingRevision = await Revision.findOne({
          userId,
          sourceAttemptId: attempt._id,
          status: "Pending"
        });

        if (!existingRevision) {
          await Revision.create({
            userId,
            problemId: attempt.problemId._id,
            sourceAttemptId: attempt._id,
            reason: "AIEvaluationRetry",
            focus: evalResult.retryFocus || evalResult.keyLearning || "AI-recommended retry focus",
            scheduledFor: new Date(),
            status: "Pending"
          });
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
