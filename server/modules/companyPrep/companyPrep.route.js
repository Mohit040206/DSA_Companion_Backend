const express = require("express");
const { authMiddleware } = require("../../middleware/auth.middileware");
const {
  getPlan,
  createOrUpdatePlan,
  refreshPlan
} = require("./companyPrep.controller");

const router = express.Router();

router.get("/plan", authMiddleware, getPlan);
router.post("/plan", authMiddleware, createOrUpdatePlan);
router.post("/refresh", authMiddleware, refreshPlan);

module.exports = router;
