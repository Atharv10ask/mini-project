import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  college: String,
  degree: String,
  branch: String,
  graduationYear: Number,
  careerGoal: String,
  github: String,
  linkedin: String,
  skills: [
    {
      name: String,
      level: String
    }
  ]
});

export default mongoose.model(
  "StudentProfile",
  studentProfileSchema
);