const express = require("express");

const {
  authMiddleware,
  authorize
} = require("../../middleware/auth.middileware");

const {
  createRevision,
  getRevisionById,
  getUserRevisions,
  startRevision,
  skipRevision
} = require("./revision.controller");


const router = express.Router();


const allowedRoles = ["user", "admin"];


// Create revision
router.post(
  "/",
  authMiddleware,
  authorize(allowedRoles),
  createRevision
);


// Get all my revisions
router.get(
  "/",
  authMiddleware,
  authorize(allowedRoles),
  getUserRevisions
);


// Get one revision
router.get(
  "/:revisionId",
  authMiddleware,
  authorize(allowedRoles),
  getRevisionById
);


// Start revision
router.post(
  "/:revisionId/start",
  authMiddleware,
  authorize(allowedRoles),
  startRevision
);


// Skip revision
router.post(
  "/:revisionId/skip",
  authMiddleware,
  authorize(allowedRoles),
  skipRevision
);


module.exports = router;