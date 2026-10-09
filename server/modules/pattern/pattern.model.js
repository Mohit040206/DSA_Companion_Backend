const mongoose = require("mongoose");

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  badge: { type: String, default: "Step" },
  color: { type: String, default: "#6366f1" },
  role: { type: String, required: true },
  desc: { type: String, required: true },
  invariant: { type: String, required: true },
  pitfall: { type: String, required: true }
}, { _id: false });

const PatternSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  family: {
    type: String,
    default: "Algorithmic Technique"
  },
  subtitle: {
    type: String,
    default: "Core algorithmic mental model and operational invariants"
  },
  beginnerIntuition: {
    type: String,
    default: ""
  },
  nodes: {
    type: [NodeSchema],
    default: []
  },
  invariants: {
    core: { type: String, default: "" },
    initialization: { type: String, default: "" },
    maintenance: { type: String, default: "" },
    termination: { type: String, default: "" },
    timeComplexity: { type: String, default: "O(N)" },
    spaceComplexity: { type: String, default: "O(1)" }
  },
  blueprint: {
    type: String,
    default: ""
  },
  createdBy: {
    type: String,
    default: "system"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Pattern", PatternSchema);
