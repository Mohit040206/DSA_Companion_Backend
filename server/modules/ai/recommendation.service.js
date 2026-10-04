const Problem = require("../problem/problem.model");
const Attempt = require("../attempt/attempt.model");
const Revision = require("../revision/revision.model");
const User = require("../user/user.model");
const memoryService = require("./memory.service");

/**
 * AI Recommendation Engine — History-Driven Problem & Progression Router.
 * Uses exact user history and onboarding preferences to guide learning path.
 */
const getPersonalizedRecommendations = async (userId) => {
  if (!userId) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(userId);
  const learningProfile = user?.learningProfile || {
    experienceLevel: "Beginner",
    knownPatterns: [],
    dailyGoal: 2,
    preferredStrategy: "depth-first",
    onboardingCompleted: false
  };

  // Fetch all problems & user attempts/revisions
  const allProblems = await Problem.find({});
  const userAttempts = await Attempt.find({ userId });
  const pendingRevisions = await Revision.find({ userId, status: "Pending" }).populate("problemId");

  const attemptedProblemIds = new Set(
    userAttempts.map((a) => a.problemId.toString())
  );
  const solvedProblemIds = new Set(
    userAttempts
      .filter((a) => a.outcome === "Solved" && a.confidence >= 3)
      .map((a) => a.problemId.toString())
  );

  // 1. Build Pattern Exposure & Familiarity Map
  const patternMap = {};
  allProblems.forEach((p) => {
    (p.patterns || []).forEach((pat) => {
      const key = pat.toLowerCase().trim();
      if (!patternMap[key]) {
        patternMap[key] = {
          name: pat,
          total: 0,
          attempted: 0,
          solved: 0,
          pendingRevisions: 0,
          problems: []
        };
      }
      patternMap[key].total += 1;
      patternMap[key].problems.push(p);

      const pId = p._id.toString();
      if (attemptedProblemIds.has(pId)) {
        patternMap[key].attempted += 1;
      }
      if (solvedProblemIds.has(pId)) {
        patternMap[key].solved += 1;
      }
    });
  });

  // Count pending revisions per pattern
  pendingRevisions.forEach((rev) => {
    if (rev.problemId && rev.problemId.patterns) {
      rev.problemId.patterns.forEach((pat) => {
        const key = pat.toLowerCase().trim();
        if (patternMap[key]) {
          patternMap[key].pendingRevisions += 1;
        }
      });
    }
  });

  // Categorize Pattern Statuses
  const patternExposure = Object.values(patternMap).map((pat) => {
    const ratio = pat.attempted > 0 ? pat.solved / pat.attempted : 0;
    let status = "Unexplored"; // Default for 0 attempts

    if (pat.attempted > 0) {
      if (pat.pendingRevisions > 0 || ratio < 0.4) {
        status = "Needs Attention";
      } else if (ratio >= 0.7 && pat.solved >= 3) {
        status = "Strong";
      } else {
        status = "Developing";
      }
    }

    return {
      name: pat.name,
      total: pat.total,
      attempted: pat.attempted,
      solved: pat.solved,
      pendingRevisions: pat.pendingRevisions,
      successRatio: Math.round(ratio * 100),
      status // 'Unexplored' | 'Needs Attention' | 'Developing' | 'Strong'
    };
  });

  // 2. Select Target Pattern & Difficulty Progression
  let targetPattern = null;
  const isDepthFirst = learningProfile.preferredStrategy === "depth-first";

  if (isDepthFirst) {
    // Strategy: Depth-First — Focus on current active/weak pattern until Strong
    targetPattern =
      patternExposure.find((p) => p.status === "Needs Attention") ||
      patternExposure.find((p) => p.status === "Developing") ||
      patternExposure.find((p) => p.status === "Unexplored") ||
      patternExposure[0];
  } else {
    // Strategy: Breadth-First — Explore unattempted patterns & foundational questions
    targetPattern =
      patternExposure.find((p) => p.status === "Unexplored") ||
      patternExposure.find((p) => p.status === "Needs Attention") ||
      patternExposure.find((p) => p.status === "Developing") ||
      patternExposure[0];
  }

  // 3. Select Next Problem based on Difficulty Progression
  let recommendedProblem = null;

  if (pendingRevisions.length > 0) {
    // Top priority: Overdue / Pending Revisions
    recommendedProblem = pendingRevisions[0].problemId;
  } else if (targetPattern) {
    const targetKey = targetPattern.name.toLowerCase().trim();
    const patternProblems = patternMap[targetKey]?.problems || [];
    const unattemptedInPattern = patternProblems.filter(
      (p) => !attemptedProblemIds.has(p._id.toString())
    );

    if (unattemptedInPattern.length > 0) {
      // Determine starting difficulty
      const solvedInPatternCount = patternMap[targetKey]?.solved || 0;
      
      let targetDifficulty = "Easy";
      if (solvedInPatternCount >= 4) {
        targetDifficulty = "Hard";
      } else if (solvedInPatternCount >= 2) {
        targetDifficulty = "Medium";
      }

      // Find matching difficulty unattempted problem
      recommendedProblem =
        unattemptedInPattern.find((p) => p.difficulty === targetDifficulty) ||
        unattemptedInPattern.find((p) => p.difficulty === "Easy") ||
        unattemptedInPattern.find((p) => p.difficulty === "Medium") ||
        unattemptedInPattern[0];
    }
  }

  // Fallback: Pick any unattempted problem
  if (!recommendedProblem) {
    recommendedProblem = allProblems.find(
      (p) => !attemptedProblemIds.has(p._id.toString())
    ) || allProblems[0];
  }

  // 4. Build Daily Plan Checklist (Matching user's dailyGoal, e.g. 2)
  const dailyGoalCount = learningProfile.dailyGoal || 2;
  const dailyPlan = [];

  if (pendingRevisions.length > 0) {
    dailyPlan.push({
      type: "revision",
      title: `Complete Revision: ${pendingRevisions[0].problemId?.title}`,
      problemId: pendingRevisions[0].problemId?._id,
      completed: false
    });
  }

  if (recommendedProblem && dailyPlan.length < dailyGoalCount) {
    dailyPlan.push({
      type: "new_problem",
      title: `Solve Next Problem: ${recommendedProblem.title}`,
      problemId: recommendedProblem._id,
      difficulty: recommendedProblem.difficulty,
      pattern: targetPattern?.name || "General",
      completed: false
    });
  }

  // Pad to reach dailyGoal count if needed
  let extraIdx = 0;
  const unattemptedList = allProblems.filter(
    (p) =>
      !attemptedProblemIds.has(p._id.toString()) &&
      p._id.toString() !== recommendedProblem?._id?.toString()
  );

  while (dailyPlan.length < dailyGoalCount && extraIdx < unattemptedList.length) {
    const extraProb = unattemptedList[extraIdx];
    dailyPlan.push({
      type: "practice",
      title: `Practice: ${extraProb.title}`,
      problemId: extraProb._id,
      difficulty: extraProb.difficulty,
      pattern: extraProb.patterns?.[0] || "General",
      completed: false
    });
    extraIdx++;
  }

  // 5. Get Factual Memory Context
  const memoryTimeline = await memoryService.getFactualMemoryTimeline(userId);

  return {
    onboardingCompleted: learningProfile.onboardingCompleted,
    learningProfile,
    targetPattern: targetPattern ? targetPattern.name : "General",
    recommendedProblem,
    dailyPlan,
    patternExposure,
    memoryHighlights: memoryTimeline.timeline.slice(0, 3)
  };
};

module.exports = {
  getPersonalizedRecommendations
};
