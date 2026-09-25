const revisionService = require("./revision.service");


// =====================================================
// CREATE REVISION
// =====================================================

const createRevision = async (req, res) => {

  try {

    const userId = req.userId;

    const {
      problemId,
      sourceAttemptId,
      reason,
      focus
    } = req.body;


    if (!problemId || !sourceAttemptId || !reason) {

      return res.status(400).json({
        success: false,
        message: "problemId, sourceAttemptId and reason are required.",
        code: 400
      });

    }


    const revision = await revisionService.createRevision(
      userId,
      problemId,
      sourceAttemptId,
      reason,
      focus
    );


    return res.status(201).json({

      success: true,

      message: "Revision created successfully.",

      code: 201,

      data: revision

    });


  } catch (err) {

    console.error(err.message);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

      success: false,

      message:
        statusCode === 500
          ? "Something went wrong."
          : err.message,

      code: statusCode

    });

  }
};


// =====================================================
// GET REVISION BY ID
// =====================================================

const getRevisionById = async (req, res) => {

  try {

    const userId = req.userId;

    const { revisionId } = req.params;


    const revision =
      await revisionService.getRevisionById(
        userId,
        revisionId
      );


    return res.status(200).json({

      success: true,

      message: "Revision fetched successfully.",

      code: 200,

      data: revision

    });


  } catch (err) {

    console.error(err.message);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

      success: false,

      message:
        statusCode === 500
          ? "Something went wrong."
          : err.message,

      code: statusCode

    });

  }
};


// =====================================================
// GET USER REVISIONS
// =====================================================

const getUserRevisions = async (req, res) => {

  try {

    const userId = req.userId;

    const { status } = req.query;


    const revisions =
      await revisionService.getUserRevisions(
        userId,
        status
      );


    return res.status(200).json({

      success: true,

      message: "Revisions fetched successfully.",

      code: 200,

      data: {

        total: revisions.length,

        revisions

      }

    });


  } catch (err) {

    console.error(err.message);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

      success: false,

      message:
        statusCode === 500
          ? "Something went wrong."
          : err.message,

      code: statusCode

    });

  }
};


// =====================================================
// START REVISION
// =====================================================

const startRevision = async (req, res) => {

  try {

    const userId = req.userId;

    const { revisionId } = req.params;


    const result =
      await revisionService.startRevision(
        userId,
        revisionId
      );


    return res.status(201).json({

      success: true,

      message: "Revision started successfully.",

      code: 201,

      data: result

    });


  } catch (err) {

    console.error(err.message);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

      success: false,

      message:
        statusCode === 500
          ? "Something went wrong."
          : err.message,

      code: statusCode

    });

  }
};


// =====================================================
// SKIP REVISION
// =====================================================

const skipRevision = async (req, res) => {

  try {

    const userId = req.userId;

    const { revisionId } = req.params;


    const revision =
      await revisionService.skipRevision(
        userId,
        revisionId
      );


    return res.status(200).json({

      success: true,

      message: "Revision skipped successfully.",

      code: 200,

      data: revision

    });


  } catch (err) {

    console.error(err.message);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

      success: false,

      message:
        statusCode === 500
          ? "Something went wrong."
          : err.message,

      code: statusCode

    });

  }
};


module.exports = {
  createRevision,
  getRevisionById,
  getUserRevisions,
  startRevision,
  skipRevision
};