const User = require("../user/user.model");
const Problem = require("../problem/problem.model");
const recommendationService = require("./recommendation.service");
const memoryService = require("./memory.service");
const evaluationService = require("./evaluation.service");
const aiProvider = require("./aiProvider.service");

const saveOnboarding = async (req, res) => {
  try {
    const userId = req.userId;
    const { experienceLevel, knownPatterns, dailyGoal, preferredStrategy } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.learningProfile = {
      experienceLevel: experienceLevel || "Beginner",
      knownPatterns: Array.isArray(knownPatterns) ? knownPatterns : [],
      dailyGoal: parseInt(dailyGoal, 10) || 2,
      preferredStrategy: preferredStrategy === "breadth-first" ? "breadth-first" : "depth-first",
      onboardingCompleted: true
    };

    user.isOnboarded = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Learning profile saved successfully.",
      code: 200,
      data: user.learningProfile
    });
  } catch (err) {
    console.error("Error in saveOnboarding:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save onboarding preferences.",
      code: 500
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await recommendationService.getPersonalizedRecommendations(userId);
    return res.status(200).json({
      success: true,
      message: "Recommendations generated successfully.",
      code: 200,
      data: result
    });
  } catch (err) {
    console.error("Error in getRecommendations:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch recommendations.",
      code: 500
    });
  }
};

const getMemory = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await memoryService.getFactualMemoryTimeline(userId);
    return res.status(200).json({
      success: true,
      message: "Factual memory timeline retrieved.",
      code: 200,
      data: result
    });
  } catch (err) {
    console.error("Error in getMemory:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch memory timeline.",
      code: 500
    });
  }
};

const evaluateAttempt = async (req, res) => {
  try {
    const userId = req.userId;
    const { attemptId } = req.params;

    const updatedAttempt = await evaluationService.evaluateAttempt(userId, attemptId);

    return res.status(200).json({
      success: true,
      message: "AI evaluation completed.",
      code: 200,
      data: updatedAttempt.aiEvaluation,
      attempt: updatedAttempt
    });
  } catch (err) {
    console.error("Error in evaluateAttempt controller:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to evaluate attempt with AI.",
      code: err.statusCode || 500
    });
  }
};

const getEvaluation = async (req, res) => {
  try {
    const userId = req.userId;
    const { attemptId } = req.params;

    const evaluation = await evaluationService.getEvaluationByAttemptId(userId, attemptId);

    return res.status(200).json({
      success: true,
      message: "Evaluation retrieved.",
      code: 200,
      data: evaluation
    });
  } catch (err) {
    console.error("Error in getEvaluation controller:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch evaluation.",
      code: err.statusCode || 500
    });
  }
};

const generateHint = async (req, res) => {
  try {
    const { problemId, code, language, hintLevel } = req.body;
    if (!problemId) {
      return res.status(400).json({ success: false, message: "problemId is required." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    const hintData = await aiProvider.generateAIHint({
      problem,
      code,
      language,
      hintLevel: parseInt(hintLevel, 10) || 1
    });

    return res.status(200).json({
      success: true,
      message: "AI Hint generated.",
      code: 200,
      data: hintData
    });
  } catch (err) {
    console.error("Error in generateHint controller:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate hint.",
      code: 500
    });
  }
};

module.exports = {
  saveOnboarding,
  getRecommendations,
  getMemory,
  evaluateAttempt,
  getEvaluation,
  generateHint
};