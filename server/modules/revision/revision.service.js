const Revision = require("./revision.model");
const Problem = require("../problem/problem.model");
const Attempt = require("../attempt/attempt.model");


// =====================================================
// CREATE REVISION
// =====================================================

const createRevision = async (
  userId,
  problemId,
  sourceAttemptId,
  reason,
  focus
) => {

  // 1. Check problem exists
  const problem = await Problem.findById(problemId);

  if (!problem) {
    const error = new Error("Question not found.");
    error.statusCode = 404;
    throw error;
  }


  // 2. Check source attempt exists and belongs to user
  const attempt = await Attempt.findOne({
    _id: sourceAttemptId,
    userId
  });

  if (!attempt) {
    const error = new Error("Source attempt not found.");
    error.statusCode = 404;
    throw error;
  }


  // 3. Make sure attempt belongs to same problem
  if (attempt.problemId.toString() !== problemId.toString()) {
    const error = new Error(
      "Source attempt does not belong to this problem."
    );

    error.statusCode = 400;
    throw error;
  }


  // 4. Prevent duplicate pending revisions
  const existingRevision = await Revision.findOne({
    userId,
    problemId,
    status: "Pending"
  });

  if (existingRevision) {
    const error = new Error(
      "A pending revision already exists for this problem."
    );

    error.statusCode = 409;
    throw error;
  }


  // 5. Create revision
  const revision = await Revision.create({
    userId,
    problemId,
    sourceAttemptId,
    reason,
    focus
  });


  return revision;
};


// =====================================================
// GET REVISION BY ID
// =====================================================

const getRevisionById = async (userId, revisionId) => {

  const revision = await Revision.findOne({
    _id: revisionId,
    userId
  });

  if (!revision) {
    const error = new Error("Revision not found.");
    error.statusCode = 404;
    throw error;
  }

  return revision;
};


// =====================================================
// GET USER REVISIONS
// =====================================================

const getUserRevisions = async (userId, status) => {

  const filter = {
    userId
  };

  // Optional filter
  if (status) {
    filter.status = status;
  }

  const revisions = await Revision
    .find(filter)
    .sort({ createdAt: -1 });

  return revisions;
};


// =====================================================
// START REVISION
// =====================================================

const startRevision = async (userId, revisionId) => {

  // 1. Find revision belonging to user
  const revision = await Revision.findOne({
    _id: revisionId,
    userId
  });

  if (!revision) {
    const error = new Error("Revision not found.");
    error.statusCode = 404;
    throw error;
  }


  // 2. Revision must be pending
  if (revision.status !== "Pending") {
    const error = new Error(
      `Revision cannot be started because it is already ${revision.status}.`
    );

    error.statusCode = 409;
    throw error;
  }


  // 3. Make sure problem still exists
  const problem = await Problem.findById(revision.problemId);

  if (!problem) {
    const error = new Error("Question not found.");
    error.statusCode = 404;
    throw error;
  }


  // 4. Make sure user doesn't already have an active attempt
  const activeAttempt = await Attempt.findOne({
    userId,
    completedAt: { $exists: false }
  });

  if (activeAttempt) {
    const error = new Error(
      "You already have an active attempt."
    );

    error.statusCode = 409;
    throw error;
  }


  // 5. Make sure this revision hasn't already created an attempt
  if (revision.completedByAttemptId) {
    const error = new Error(
      "This revision has already been started."
    );

    error.statusCode = 409;
    throw error;
  }


  // 6. Create new Attempt
  const attempt = await Attempt.create({
    userId,
    problemId: revision.problemId,
    sessions: [
      {
        startedAt: new Date()
      }
    ]
  });


  // 7. Link attempt to revision
  revision.completedByAttemptId = attempt._id;

  await revision.save();


  return {
    revision,
    attempt
  };
};


// =====================================================
// SKIP REVISION
// =====================================================

const skipRevision = async (userId, revisionId) => {

  const revision = await Revision.findOne({
    _id: revisionId,
    userId
  });

  if (!revision) {
    const error = new Error("Revision not found.");
    error.statusCode = 404;
    throw error;
  }


  if (revision.status !== "Pending") {
    const error = new Error(
      `Revision cannot be skipped because it is already ${revision.status}.`
    );

    error.statusCode = 409;
    throw error;
  }


  revision.status = "Skipped";

  await revision.save();

  return revision;
};


// =====================================================
// COMPLETE REVISION
// =====================================================

const completeRevision = async (userId, attemptId) => {

  const revision = await Revision.findOne({
    userId,
    completedByAttemptId: attemptId,
    status: "Pending"
  });

  if (!revision) {
    return null;
  }


  revision.status = "Completed";
  revision.completedAt = new Date();

  await revision.save();

  return revision;
};


module.exports = {
  createRevision,
  getRevisionById,
  getUserRevisions,
  startRevision,
  skipRevision,
  completeRevision
};