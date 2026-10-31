
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      "Technical Training",
      "Soft Skills",
      "Project Development",
      "Resume Preparation",
      "Interview Preparation",
      "Certification"
    ],
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
});

const careerPlanSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    studentName: {
      type: String,
      required: true
    },
    careerGoal: {
      type: String,
      required: true
    },
    targetRole: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    activities: [activitySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerPlan", careerPlanSchema);
