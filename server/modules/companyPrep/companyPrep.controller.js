const companyPrepService = require("./companyPrep.service");

const getPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const plan = await companyPrepService.getActivePlan(userId);

    return res.status(200).json({
      success: true,
      message: plan ? "Active preparation plan retrieved." : "No active preparation plan found.",
      code: 200,
      data: plan
    });
  } catch (err) {
    console.error("Error in getPlan controller:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch company prep plan.",
      code: err.statusCode || 500
    });
  }
};

const createOrUpdatePlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { company, role, interviewDate } = req.body;

    const plan = await companyPrepService.buildPersonalizedPlan(userId, {
      company,
      role,
      interviewDate
    });

    return res.status(200).json({
      success: true,
      message: "Personalized company preparation plan generated successfully.",
      code: 200,
      data: plan
    });
  } catch (err) {
    console.error("Error in createOrUpdatePlan controller:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to generate company preparation plan.",
      code: err.statusCode || 500
    });
  }
};

const refreshPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const plan = await companyPrepService.refreshPlan(userId);

    return res.status(200).json({
      success: true,
      message: "Preparation plan recalculated with updated user performance data.",
      code: 200,
      data: plan
    });
  } catch (err) {
    console.error("Error in refreshPlan controller:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to refresh preparation plan.",
      code: err.statusCode || 500
    });
  }
};

module.exports = {
  getPlan,
  createOrUpdatePlan,
  refreshPlan
};
