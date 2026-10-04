const express = require("express");
const { authMiddleware } = require("../../middleware/auth.middileware");
const {
  saveOnboarding,
  getRecommendations,
  getMemory,
  evaluateAttempt,
  getEvaluation,
  generateHint
} = require("./ai.controller");

const router = express.Router();

router.post("/onboarding", authMiddleware, saveOnboarding);
router.get("/recommendations", authMiddleware, getRecommendations);
router.get("/memory", authMiddleware, getMemory);

router.post("/evaluate-attempt/:attemptId", authMiddleware, evaluateAttempt);
router.get("/evaluation/:attemptId", authMiddleware, getEvaluation);
router.post("/generate-hint", authMiddleware, generateHint);

module.exports = router;
