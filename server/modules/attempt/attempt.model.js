const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        // ===========================
        // Identity
        // ===========================

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

        // ===========================
        // Time / Sessions
        // ===========================

        sessions: [
            {
                startedAt: {
                    type: Date,
                    required: true
                },

                endedAt: {
                    type: Date
                }
            }
        ],

        // ===========================
        // Outcome & Performance
        // ===========================

        outcome: {
            type: String,
            enum: [
                "Solved",
                "SolvedWithHints",
                "SolvedWithExternalHelp",
                "NeedSolution",
                "CouldNotSolve"
            ],
        },

        hintsUsed: {
            type: Number,
            default: 0,
            min: 0
        },

        confidence: {
            type: Number,
            min: 1,
            max: 5,
        },

        // ===========================
        // Thinking & Learning
        // ===========================

        approach: {
            type: String,
            trim: true
        },

        algorithm: {
            type: String,
            trim: true
        },

        keyInsight: {
            type: String,
            trim: true
        },

        mistakes: [
            {
                type: String,
                trim: true
            }
        ],

        complexity: {
            time: {
                type: String,
                trim: true
            },

            space: {
                type: String,
                trim: true
            }
        },

        language: {
            type: String,
            trim: true
        },

        // ===========================
        // Reflection
        // ===========================

      reflection: {
    type: String,
    enum: [
        "SomethingClicked",
        "LearnedSomethingNew",
        "NeedToRevisit",
        "FeelingMoreConfident",
        "Other"
    ]
        },

       reflectionNote: {
    type: String,
    trim: true
},
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Attempt", attemptSchema);