const mongoose = require("mongoose");

const companyPrepPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      trim: true
    },

    interviewDate: {
      type: Date
    },

    preparationStartDate: {
      type: Date,
      default: Date.now
    },

    researchStatus: {
      type: String,
      enum: ["SUCCESS", "INSUFFICIENT_DATA", "FAILED"],
      default: "SUCCESS"
    },

    companyResearch: {
      targetPatterns: [
        {
          type: String,
          trim: true
        }
      ],
      difficultyDistribution: {
        easyPct: { type: Number, default: 20 },
        mediumPct: { type: Number, default: 60 },
        hardPct: { type: Number, default: 20 }
      },
      interviewProcessNotes: {
        type: String,
        trim: true
      },
      publiclyReportedQuestions: [
        {
          title: { type: String, trim: true },
          platform: { type: String, trim: true },
          url: { type: String, trim: true },
          frequency: { type: String, trim: true },
          sourceUrl: { type: String, trim: true }
        }
      ],
      sources: [
        {
          title: { type: String, trim: true },
          url: { type: String, trim: true },
          sourceType: {
            type: String,
            enum: ["OFFICIAL", "INTERVIEW_REPORT", "COMMUNITY", "OTHER"],
            default: "COMMUNITY"
          },
          accessedAt: { type: Date, default: Date.now }
        }
      ],
      researchedAt: {
        type: Date,
        default: Date.now
      }
    },

    weeklyPlan: [
      {
        weekNumber: {
          type: Number,
          required: true
        },
        title: {
          type: String,
          trim: true
        },
        objective: {
          type: String,
          trim: true
        },
        targetPatterns: [
          {
            type: String,
            trim: true
          }
        ],
        recommendedProblemIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem"
          }
        ],
        requiredRevisionIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Revision"
          }
        ],
        companyResearchReason: {
          type: String,
          trim: true
        },
        personalPerformanceReason: {
          type: String,
          trim: true
        },
        difficultyLevel: {
          type: String,
          enum: ["Easy", "Medium", "Hard", "Mixed"],
          default: "Mixed"
        }
      }
    ],

    planGeneratedAt: {
      type: Date,
      default: Date.now
    },

    researchUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CompanyPrepPlan", companyPrepPlanSchema);
