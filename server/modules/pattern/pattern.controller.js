const PatternService = require("./pattern.service");
const Problem = require("../problem/problem.model");

const getPatternDetail = async (req, res) => {
  try {
    const { nameOrSlug } = req.params;
    if (!nameOrSlug) {
      return res.status(400).json({ success: false, message: "Pattern name or slug required" });
    }

    const pattern = await PatternService.getPatternBySlugOrName(nameOrSlug);
    if (!pattern) {
      return res.status(404).json({ success: false, message: "Pattern not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Pattern details fetched successfully",
      data: pattern
    });
  } catch (err) {
    console.error("Error in getPatternDetail:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch pattern details"
    });
  }
};

const listPatterns = async (req, res) => {
  try {
    const patterns = await PatternService.getAllPatterns();
    return res.status(200).json({
      success: true,
      data: patterns
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to list patterns"
    });
  }
};

const createPattern = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Pattern name is required" });
    }

    const pattern = await PatternService.getPatternBySlugOrName(name);
    return res.status(201).json({
      success: true,
      message: "Pattern registered successfully",
      data: pattern
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create pattern"
    });
  }
};

module.exports = {
  getPatternDetail,
  listPatterns,
  createPattern
};
