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
                "SolvedClean",
                "SolvedWithHints",
                "Solved with hints",
                "Solved With Hints",
                "SolvedWithExternalHelp",
                "Solved with external help",
                "Solved With External Help",
                "NeedSolution",
                "Need solution",
                "Need Solution",
                "CouldNotSolve",
                "Could not solve",
                "Could Not Solve",
                "Paused",
                "In Progress"
            ],
            default: "Solved"
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

        durationMin: {
            type: Number,
            default: 0
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
        code: {
            type: String,
            trim: true
        },

        retryOfAttemptId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attempt"
        },

        notes: {
            type: String,
            trim: true
        },
        completedAt: {
            type: Date
        },

        // ===========================
        // AI Static Evaluation Schema
        // ===========================
        aiEvaluation: {
            status: {
                type: String,
                enum: ["NOT_REQUESTED", "PENDING", "COMPLETED", "FAILED"],
                default: "NOT_REQUESTED"
            },
            evaluatedAt: {
                type: Date
            },
            error: {
                type: String
            },
            verdict: {
                type: String,
                enum: [
                    "CORRECT",
                    "MOSTLY_CORRECT",
                    "CORRECT_BUT_INEFFICIENT",
                    "NEEDS_ANOTHER_ATTEMPT",
                    "INCORRECT",
                    "INCONCLUSIVE"
                ]
            },
            derivedApproach: {
                type: String,
                trim: true
            },
            derivedAlgorithm: {
                type: String,
                trim: true
            },
            derivedComplexity: {
                time: { type: String, trim: true },
                space: { type: String, trim: true }
            },
            approachCorrect: {
                type: Boolean
            },
            codeCorrect: {
                type: Boolean
            },
            complexityCorrect: {
                type: Boolean
            },
            efficiency: {
                type: String,
                enum: ["EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT", "POOR", "INCONCLUSIVE"]
            },
            issues: [
                {
                    type: {
                        type: String,
                        enum: [
                            "EDGE_CASE",
                            "SYNTAX_ERROR",
                            "LOGIC_ERROR",
                            "COMPLEXITY",
                            "MISSING_BOUNDARY",
                            "MISUNDERSTOOD_PROBLEM",
                            "OTHER"
                        ]
                    },
                    description: { type: String, trim: true },
                    severity: {
                        type: String,
                        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
                    }
                }
            ],
            whatWasDoneWell: [
                { type: String, trim: true }
            ],
            whatNeedsFixing: [
                { type: String, trim: true }
            ],
            keyLearning: {
                type: String,
                trim: true
            },
            retryRecommended: {
                type: Boolean,
                default: false
            },
            retryFocus: {
                type: String,
                trim: true
            },
            confidenceAdjustment: {
                type: String,
                trim: true
            }
        }
    },
    {
        timestamps: true
    }
);

attemptSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
attemptSchema.index({ userId: 1, completedAt: 1 });

module.exports = mongoose.model("Attempt", attemptSchema);