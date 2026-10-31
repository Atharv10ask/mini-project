
const mongoose = require("mongoose");


const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"]
    }
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    college: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      enum: ["B.Tech", "B.E.", "BCA", "B.Sc", "M.Tech", "MCA", "Other"]
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    graduationYear: {
      type: Number,
      required: true
    },
    careerGoal: {
      type: String,
      trim: true,
      default: ""
    },
    skills: {
      type: [skillSchema],
      required: true,
      validate: {
        validator: (skills) => skills.length > 0,
        message: "At least one skill is required"
      }
    },
    github: {
      type: String,
      trim: true,
      default: ""
    },
    linkedin: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);
