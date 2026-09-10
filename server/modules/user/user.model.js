const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    // ===========================
    // Basic Information
    // ===========================
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    avatar: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: "",
        maxlength:150
    },
    role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
},

    // ===========================
    // Authentication
    // ===========================
    password: {
    type: String,
    select: false
     },  
    provider: {
        type: String,
        enum: ["email", "google", "github"],
        default: "email"
    },

    githubId: {
        type: String,
        default: null
    },

    // ===========================
    // Career
    // ===========================
    currentCompany: {
    name: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: ""
    },
    joiningDate: Date
},

    experienceInYears: {
        type: Number,
        default: 0
    },

    techStack: [{
        type: String,
        trim: true
    }],

    // ===========================
    // Goals
    // ===========================
    goals: [{
        type: String,
        trim: true
    }],

    targetCompanies: [{
        type: String,
        trim: true
    }],

    targetRole: {
        type: String,
        default: ""
    },

    // ===========================
    // Study Preferences
    // ===========================
    preferredLanguage: {
        type: String,
        default: "Java"
    },

    studyStyle: {
        type: String,
        enum: [
            "Morning",
            "Evening",
            "Night",
            "Flexible"
        ],
        default: "Night"
    },
    careerStage:{
        type: String,
       enum: [
    "Student",
    "Intern",
    "Working Professional",
    "Career Switcher"
],
        default:"Working Professional"
    },

    motivationStyle: {
        type: String,
        enum: [
            "Gentle",
            "Strict",
            "Competitive"
        ],
        default: "Gentle"
    },

    dailyGoal: {
        type: Number,
        default: 1
    },

    weeklyGoal: {
        type: Number,
        default: 7
    },
    interviewDate:{
        type:Date,
    },

    // Platform Info

    timezone: {
        type: String,
        default: "Asia/Kolkata"
    },
    
    joinedFrom:{
    type:String,
    enum:[
        "GitHub",
        "LinkedIn",
        "Friend",
        "Direct",
        "Google"
    ],
    default:"Direct"
},
settings:{
    theme:{
        type:String,
        enum:["Light","Dark","System"],
        default:"System"
    },

    emailNotification:{
        type:Boolean,
        default:true
    },

    reminderNotification:{
        type:Boolean,
        default:true
    },

    reminderTime:{
        type:String,
        default:"21:00"
    }
},
isProfileComplete:{
    type:Boolean,
    default:false
},
isOnboarded:{
    type:Boolean,
    default:false
},
lastLogin:{
    type:Date,
    default: Date.now
},
status:{
    type:String,
    enum:[
        "Active",
        "Inactive",
        "Suspended"
    ],
    default:"Active"
},

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);