const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
{
    // ===========================
    // Basic Information
    // ===========================

    title: {
        type: String,
        required: true,
        trim: true
    },

    externalId: {
        type: String,
        required: true,
        trim: true
    },

    platform: {
        type: String,
        enum: [
            "LeetCode",
            "GeeksForGeeks",
            "Codeforces",
            "HackerRank",
            "Custom"
        ],
        default: "LeetCode"
    },

    url: {
        type: String,
        required: true
    },

    // ===========================
    // Classification
    // ===========================

    difficulty: {
        type: String,
        enum: [
            "Easy",
            "Medium",
            "Hard"
        ],
        required: true
    },

    patterns: [{
        type: String,
        trim: true
    }],

    concepts: [{
        type: String,
        trim: true
    }],

    tags: [{
        type: String,
        trim: true
    }],

    companies: [{
        type: String,
        trim: true
    }],

    // ===========================
    // Meta Information
    // ===========================

    estimatedTime: {
        type: Number,
        default: 30
    },

    isPremium: {
        type: Boolean,
        default: false
    },

    isCoreProblem: {
        type: Boolean,
        default: true
    },
   prerequisites: [{
    type: String,
    trim: true
}],

learningObjectives: [{
    type: String,
    trim: true
}],

order: {
    type: Number
},
createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
}

},

{
    timestamps: true
});

module.exports = mongoose.model("Problem", problemSchema);