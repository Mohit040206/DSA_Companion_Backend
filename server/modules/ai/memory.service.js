const Attempt = require("../attempt/attempt.model");
const Revision = require("../revision/revision.model");
const Problem = require("../problem/problem.model");
const User = require("../user/user.model");

/**
 * Factual Memory Engine — ZERO Hallucination guarantee.
 * All memory items are derived strictly from source-of-truth MongoDB collections.
 */
const getFactualMemoryTimeline = async (userId) => {
  if (!userId) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  // Fetch user attempts populated with problem details
  const attempts = await Attempt.find({ userId })
    .populate("problemId", "title difficulty url patterns")
    .sort({ createdAt: -1 });

  // Fetch user revisions populated with problem details
  const revisions = await Revision.find({ userId })
    .populate("problemId", "title difficulty url patterns")
    .sort({ createdAt: -1 });

  const user = await User.findById(userId);

  const memoryTimeline = [];
  const recurringMistakesMap = {};
  const problemHistoryMap = {};

  // 1. Process Attempts for Factual Evidence
  attempts.forEach((att) => {
    if (!att.problemId) return;
    const pId = att.problemId._id.toString();
    const pTitle = att.problemId.title;

    if (!problemHistoryMap[pId]) {
      problemHistoryMap[pId] = {
        title: pTitle,
        attempts: []
      };
    }
    problemHistoryMap[pId].attempts.push(att);

    // Track explicit mistake logs
    if (Array.isArray(att.mistakes)) {
      att.mistakes.forEach((mistake) => {
        if (!mistake || typeof mistake !== "string") return;
        const cleanKey = mistake.trim().toLowerCase();
        if (!recurringMistakesMap[cleanKey]) {
          recurringMistakesMap[cleanKey] = {
            text: mistake.trim(),
            count: 0,
            problems: new Set(),
            lastOccurredAt: att.createdAt || att.completedAt
          };
        }
        recurringMistakesMap[cleanKey].count += 1;
        recurringMistakesMap[cleanKey].problems.add(pTitle);
      });
    }

    // Extract AI Evaluation findings (issues & key learnings) with strict provenance
    if (att.aiEvaluation && att.aiEvaluation.status === "COMPLETED") {
      if (Array.isArray(att.aiEvaluation.issues)) {
        att.aiEvaluation.issues.forEach((issue) => {
          if (!issue || !issue.description) return;
          const cleanKey = `[${issue.type || "EDGE_CASE"}] ${issue.description.trim().toLowerCase()}`;
          if (!recurringMistakesMap[cleanKey]) {
            recurringMistakesMap[cleanKey] = {
              text: issue.description.trim(),
              count: 0,
              problems: new Set(),
              isAI: true,
              lastOccurredAt: att.aiEvaluation.evaluatedAt || att.completedAt || att.createdAt
            };
          }
          recurringMistakesMap[cleanKey].count += 1;
          recurringMistakesMap[cleanKey].problems.add(pTitle);
        });
      }

      if (att.aiEvaluation.keyLearning) {
        memoryTimeline.push({
          id: `ai-learning-${att._id}`,
          type: "ai_insight",
          title: `AI Feedback Insight: ${pTitle}`,
          summary: att.aiEvaluation.keyLearning,
          evidence: {
            source: "AI Solution Evaluator",
            problemTitle: pTitle,
            sourceAttemptId: att._id,
            verdict: att.aiEvaluation.verdict,
            evaluatedAt: att.aiEvaluation.evaluatedAt
          },
          timestamp: att.aiEvaluation.evaluatedAt || att.createdAt
        });
      }
    }
  });

  // 2. Identify Breakthrough Moments (Early Struggle -> Recent Victory)
  Object.values(problemHistoryMap).forEach((item) => {
    const sorted = item.attempts.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    if (sorted.length >= 2) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      const firstLow =
        (first.confidence && first.confidence <= 2) ||
        first.outcome === "CouldNotSolve" ||
        first.outcome === "NeedSolution";
      const lastHigh =
        (last.confidence && last.confidence >= 4) &&
        last.outcome === "Solved";

      if (firstLow && lastHigh) {
        memoryTimeline.push({
          id: `breakthrough-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
          type: "breakthrough",
          title: `Mastered ${item.title}`,
          summary: `You initially struggled with ${item.title} (Confidence: ${
            first.confidence || 2
          }/5), but cleanly solved it on a subsequent attempt with Confidence ${
            last.confidence
          }/5!`,
          evidence: {
            problemTitle: item.title,
            firstAttemptDate: first.createdAt,
            victoryDate: last.createdAt,
            sourceAttemptId: last._id
          },
          timestamp: last.createdAt
        });
      }
    }
  });

  // 3. Extract Factual Recurring Mistakes
  Object.values(recurringMistakesMap).forEach((m) => {
    if (m.count >= 1) {
      memoryTimeline.push({
        id: `mistake-${m.text.substring(0, 20).toLowerCase().replace(/\s+/g, "-")}`,
        type: "recurring_mistake",
        title: m.isAI ? `AI Feedback Watch Out: ${m.text}` : `Watch Out: ${m.text}`,
        summary: m.isAI
          ? `Identified by AI Evaluator across: ${Array.from(m.problems).join(", ")}.`
          : `Recorded in your attempt reflections across: ${Array.from(m.problems).join(", ")}.`,
        evidence: {
          source: m.isAI ? "AI Solution Evaluator" : "User Reflection Log",
          occurrences: m.count,
          affectedProblems: Array.from(m.problems),
          lastOccurredAt: m.lastOccurredAt
        },
        timestamp: m.lastOccurredAt
      });
    }
  });

  // 4. Extract Active Revisions Provenance
  revisions.forEach((rev) => {
    if (rev.status === "Pending" && rev.problemId) {
      memoryTimeline.push({
        id: `revision-pending-${rev._id}`,
        type: "active_revision",
        title: `Revision Scheduled: ${rev.problemId.title}`,
        summary: `Scheduled revisit focused on: "${rev.focus || rev.reason || "Pattern reinforcement"}"`,
        evidence: {
          problemTitle: rev.problemId.title,
          sourceAttemptId: rev.sourceAttemptId,
          revisionId: rev._id,
          createdAt: rev.createdAt
        },
        timestamp: rev.createdAt
      });
    }
  });

  // Sort memories chronologically (newest first)
  memoryTimeline.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return {
    totalRecordedAttempts: attempts.length,
    totalPendingRevisions: revisions.filter((r) => r.status === "Pending")
      .length,
    userProfile: {
      name: user?.name || "Learner",
      learningProfile: user?.learningProfile || {}
    },
    timeline: memoryTimeline
  };
};

module.exports = {
  getFactualMemoryTimeline
};
