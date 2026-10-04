const CompanyPrepPlan = require("./companyPrep.model");
const { searchCompanyInterviewData } = require("./companySearch.service");
const recommendationService = require("../ai/recommendation.service");
const memoryService = require("../ai/memory.service");
const Problem = require("../problem/problem.model");
const Attempt = require("../attempt/attempt.model");
const Revision = require("../revision/revision.model");

/**
 * Company Preparation Engine Service.
 * Personalizes interview preparation plans by synthesizing:
 * 1. Web research (provenance sources)
 * 2. User Learning Profile & Pattern Mastery
 * 3. Attempt History & AI Evaluations
 * 4. Memory Engine insights
 * 5. Pending Revision Queue
 * 6. Target interview date/timeline
 */

const getActivePlan = async (userId) => {
  if (!userId) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  const plan = await CompanyPrepPlan.findOne({ userId })
    .populate("weeklyPlan.recommendedProblemIds")
    .populate({
      path: "weeklyPlan.requiredRevisionIds",
      populate: { path: "problemId" }
    })
    .sort({ updatedAt: -1 });

  return plan;
};

const buildPersonalizedPlan = async (userId, { company, role, interviewDate }) => {
  if (!userId) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  const targetCompany = String(company || "").trim();
  const targetRole = String(role || "Software Engineer").trim();

  if (!targetCompany) {
    const error = new Error("Target company is required.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Conduct Real Web Research with Provenance Metadata
  const research = await searchCompanyInterviewData(targetCompany, targetRole);

  // 2. Fetch User Performance & AI Evaluation Data
  const recommendationsData = await recommendationService.getPersonalizedRecommendations(userId);
  const memoryData = await memoryService.getFactualMemoryTimeline(userId);
  const attempts = await Attempt.find({ userId }).populate("problemId");
  const pendingRevisions = await Revision.find({ userId, status: "Pending" }).populate("problemId");
  const allProblems = await Problem.find({});

  // Extract AI Evaluation Observations
  const aiEvalMistakes = [];
  attempts.forEach((att) => {
    if (att.aiEvaluation && att.aiEvaluation.keyTakeaway) {
      aiEvalMistakes.push(att.aiEvaluation.keyTakeaway);
    }
  });

  // Calculate Weeks until Interview & Timeline Context
  let totalWeeks = 4;
  let monthsUntilInterview = null;
  if (interviewDate) {
    const targetDate = new Date(interviewDate);
    const now = new Date();
    const diffTime = Math.max(0, targetDate.getTime() - now.getTime());
    const calculatedWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    monthsUntilInterview = Math.round((diffTime / (1000 * 60 * 60 * 24 * 30.44)) * 10) / 10;
    
    // Cap active sprint roadmap to 12 weeks for manageable milestone focus
    totalWeeks = Math.min(Math.max(calculatedWeeks, 1), 12);
  }

  // 3. Generate Weekly Adaptive Roadmap
  const weeklyPlan = generateWeeklyRoadmap({
    totalWeeks,
    targetCompany,
    targetRole,
    companyPatterns: research.targetPatterns,
    patternExposure: recommendationsData.patternExposure || [],
    allProblems,
    pendingRevisions,
    aiEvalMistakes,
    memoryHighlights: memoryData.timeline || []
  });

  // 4. Update or Create User's Active Plan
  let plan = await CompanyPrepPlan.findOne({ userId });

  if (plan) {
    plan.company = targetCompany;
    plan.role = targetRole;
    plan.interviewDate = interviewDate ? new Date(interviewDate) : null;
    plan.researchStatus = research.researchStatus;
    plan.companyResearch = research;
    plan.weeklyPlan = weeklyPlan;
    plan.planGeneratedAt = new Date();
    plan.researchUpdatedAt = new Date();
  } else {
    plan = new CompanyPrepPlan({
      userId,
      company: targetCompany,
      role: targetRole,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      researchStatus: research.researchStatus,
      companyResearch: research,
      weeklyPlan,
      planGeneratedAt: new Date(),
      researchUpdatedAt: new Date()
    });
  }

  await plan.save();

  return getActivePlan(userId);
};

const refreshPlan = async (userId) => {
  const existingPlan = await CompanyPrepPlan.findOne({ userId });
  if (!existingPlan) {
    const error = new Error("No active company prep plan found to recalculate.");
    error.statusCode = 404;
    throw error;
  }

  return buildPersonalizedPlan(userId, {
    company: existingPlan.company,
    role: existingPlan.role,
    interviewDate: existingPlan.interviewDate
  });
};

/**
 * Weekly Plan Generator based on combined context.
 */
function generateWeeklyRoadmap({
  totalWeeks,
  targetCompany,
  targetRole,
  companyPatterns,
  patternExposure,
  allProblems,
  pendingRevisions,
  aiEvalMistakes,
  memoryHighlights
}) {
  const weeklyPlan = [];

  // Identify Weak and Developing Patterns
  const weakPatterns = patternExposure
    .filter((p) => p.status === "Needs Attention" || p.status === "Developing")
    .map((p) => p.name);

  // Match company patterns with user status
  const prioritizedPatterns = companyPatterns.length > 0
    ? companyPatterns
    : ["HashMap", "Sliding Window", "Two Pointers", "Trees", "Dynamic Programming"];

  // Select problem helper with multi-tier fallback to ensure NO week has 0 problems
  const attemptedSet = new Set();
  const selectProblems = (patternsList, count, diffLevel) => {
    let matches = allProblems.filter((p) => {
      if (attemptedSet.has(p._id.toString())) return false;
      const hasPattern = (p.patterns || []).some((pat) =>
        patternsList.some((tp) => tp.toLowerCase() === pat.toLowerCase())
      );
      if (!hasPattern) return false;
      if (diffLevel !== "Mixed" && p.difficulty !== diffLevel) return false;
      return true;
    });

    // Fallback 1: If exact difficulty yielded insufficient problems, relax difficulty filter for target patterns
    if (matches.length < count && diffLevel !== "Mixed") {
      const patternFallback = allProblems.filter((p) => {
        if (attemptedSet.has(p._id.toString())) return false;
        return (p.patterns || []).some((pat) =>
          patternsList.some((tp) => tp.toLowerCase() === pat.toLowerCase())
        );
      });
      matches = [...matches, ...patternFallback.filter((p) => !matches.includes(p))];
    }

    // Fallback 2: Take any available core unattempted problems in DB
    if (matches.length < count) {
      const globalFallback = allProblems.filter((p) => !attemptedSet.has(p._id.toString()));
      matches = [...matches, ...globalFallback.filter((p) => !matches.includes(p))];
    }

    const chosen = matches.slice(0, count);
    chosen.forEach((p) => attemptedSet.add(p._id.toString()));
    return chosen.map((p) => p._id);
  };

  // Helper for revisions
  const revisionIds = pendingRevisions.map((r) => r._id);

  for (let week = 1; week <= totalWeeks; week++) {
    let title = "";
    let objective = "";
    let targetPats = [];
    let companyReason = "";
    let personalReason = "";
    let diffLevel = "Mixed";
    let weekProblemIds = [];
    let weekRevisionIds = [];

    if (week === 1) {
      title = `Week 1: Foundation & High-Frequency Company Patterns`;
      targetPats = prioritizedPatterns.slice(0, 2);
      
      const weakMatch = targetPats.filter((p) => weakPatterns.includes(p));
      objective = weakMatch.length > 0
        ? `Focus on weak pattern repair (${weakMatch.join(", ")}) combined with reported ${targetCompany} interview patterns.`
        : `Strengthen core ${targetCompany} interview patterns starting from comfortable fundamentals.`;

      companyReason = `🌐 Public reports for ${targetCompany} (${targetRole}) highlight heavy emphasis on ${targetPats.join(" & ")}.`;
      personalReason = weakMatch.length > 0
        ? `🧠 AI evaluations & attempt history identified weakness in ${weakMatch.join(", ")}; starting with targeted easy-to-medium problem repairs.`
        : `🧠 User shows solid foundation; starting with medium-difficulty company practice.`;

      diffLevel = weakMatch.length > 0 ? "Easy" : "Medium";
      weekProblemIds = selectProblems(targetPats, 3, diffLevel);
      weekRevisionIds = revisionIds.slice(0, 2);
    } else if (week === 2) {
      title = `Week 2: Pattern Deep-Dive & Complexity Optimization`;
      targetPats = prioritizedPatterns.slice(1, 3);
      if (targetPats.length === 0) targetPats = ["Sliding Window", "Two Pointers"];

      objective = `Master multi-pointer strategies and optimize time/space complexity for ${targetCompany} interviews.`;
      companyReason = `🌐 ${targetCompany} candidate reports frequently test optimization and edge case handling.`;
      
      const evalNote = aiEvalMistakes.length > 0
        ? `🧠 Address past AI evaluation feedback: "${aiEvalMistakes[0].slice(0, 80)}..."`
        : `🧠 Building upon positive revision performance and pattern progression.`;

      personalReason = evalNote;
      diffLevel = "Medium";
      weekProblemIds = selectProblems(targetPats, 4, "Medium");
      weekRevisionIds = revisionIds.slice(2, 4);
    } else if (week === 3) {
      title = `Week 3: Company-Specific Problem Sets & Hard Concepts`;
      targetPats = prioritizedPatterns.slice(2, 4);
      if (targetPats.length === 0) targetPats = ["Dynamic Programming", "Graphs"];

      objective = `Solve high-impact company-relevant medium and hard problems under timed conditions.`;
      companyReason = `🌐 Reported ${targetCompany} technical rounds require clean code delivery within 35-45 minutes.`;
      personalReason = `🧠 Pushing difficulty boundary based on high pattern confidence and memory engine progress.`;
      diffLevel = "Hard";
      weekProblemIds = selectProblems(targetPats, 3, "Hard");
    } else {
      title = `Week ${week}: Comprehensive Revisions & Timed Mock Prep`;
      targetPats = prioritizedPatterns;
      objective = `Review all flagged revisions, solidify pattern memory, and complete full interview simulation.`;
      companyReason = `🌐 Final preparation phase aligned with ${targetCompany} ${targetRole} interview expectations.`;
      personalReason = `🧠 Eliminating recurring mistakes found in AI memory timeline before real interview.`;
      diffLevel = "Mixed";
      weekProblemIds = selectProblems(targetPats, 3, "Mixed");
      weekRevisionIds = revisionIds.slice(0, 3);
    }

    weeklyPlan.push({
      weekNumber: week,
      title,
      objective,
      targetPatterns: targetPats,
      recommendedProblemIds: weekProblemIds,
      requiredRevisionIds: weekRevisionIds,
      companyResearchReason: companyReason,
      personalPerformanceReason: personalReason,
      difficultyLevel: diffLevel
    });
  }

  return weeklyPlan;
}

module.exports = {
  getActivePlan,
  buildPersonalizedPlan,
  refreshPlan
};
