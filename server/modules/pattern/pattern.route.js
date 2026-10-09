const express = require("express");
const router = express.Router();
const patternController = require("./pattern.controller");

router.get("/", patternController.listPatterns);
router.post("/", patternController.createPattern);
router.get("/:nameOrSlug", patternController.getPatternDetail);

module.exports = router;
