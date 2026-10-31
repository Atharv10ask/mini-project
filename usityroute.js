
const express = require("express");
const router = express.Router();
const StudentProfile = require("./Studentprofile");

router.get("/students", async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .select(
        "fullName email phone college degree branch graduationYear careerGoal github linkedin skills"
      )
      .sort({ fullName: 1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("University students error:", error);

    res.status(500).json({
      message: "Failed to fetch student profiles"
    });
  }
});

module.exports = router;
