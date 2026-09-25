const mongoose=require("mongoose")

const revisionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true
    },

    // The attempt that caused this revision to be needed
    sourceAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true
    },

    reason: {
      type: String,
      enum: [
        "LowConfidence",
        "HintsUsed",
        "SolvedWithExternalHelp",
        "CouldNotSolve",
        "NeedToRevisit",
        "RepeatedMistakes"
      ],
      required: true
    },

    // What the user should focus on during revision
    focus: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Skipped"],
      default: "Pending"
    },

    scheduledFor: {
      type: Date
    },

    completedAt: {
      type: Date
    },

    // The new attempt created when the user actually revises
    completedByAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Revision", revisionSchema);