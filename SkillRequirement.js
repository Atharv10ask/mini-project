
const mongoose = require("mongoose");

const skillRequirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["Job", "Internship", "Industry Requirement"],
      required: true
    },

    skills: [
      {
        skillName: {
          type: String,
          required: true,
          trim: true
        },

        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Beginner"
        }
      }
    ],

    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SkillRequirement",
  skillRequirementSchema
);
