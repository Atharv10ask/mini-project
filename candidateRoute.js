
const express = require("express");
const mongoose = require("mongoose");
const StudentProfile = require("./Studentprofile");

const router = express.Router();

// Convert skill names into a common format for comparison.
function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

// Convert different skill formats into one consistent format.
function normalizeSkillList(skills) {
  if (!Array.isArray(skills)) return [];

  return skills
    .map((skill) => {
      if (typeof skill === "string") {
        return {
          skillName: skill.trim(),
          level: "Beginner",
        };
      }

      return {
        skillName: String(
          skill?.skillName || skill?.name || skill?.skill || ""
        ).trim(),
        level: String(
          skill?.level || skill?.proficiency || "Beginner"
        ).trim(),
      };
    })
    .filter((skill) => skill.skillName);
}

// Convert proficiency levels into numbers.
function getLevelValue(level) {
  const normalized = normalizeName(level);

  if (normalized.includes("advanced")) return 3;
  if (normalized.includes("intermediate")) return 2;
  if (normalized.includes("beginner")) return 1;

  return 1;
}

// Calculate how well one student's skill matches a requirement.
function calculateSkillScore(studentLevel, requiredLevel) {
  const studentValue = getLevelValue(studentLevel);
  const requiredValue = getLevelValue(requiredLevel);

  if (studentValue >= requiredValue) return 100;

  return Math.round((studentValue / requiredValue) * 100);
}

// GET /candidate-matches?opportunityId=...&companyName=...&companyEmail=...
router.get("/candidate-matches", async (req, res) => {
  try {
    const { opportunityId, companyName, companyEmail } = req.query;

    if (!opportunityId || !mongoose.Types.ObjectId.isValid(opportunityId)) {
      return res.status(400).json({
        message: "A valid opportunity ID is required.",
      });
    }

    if (!companyName && !companyEmail) {
      return res.status(400).json({
        message: "Company information is required.",
      });
    }

    // Read the opportunity from the existing MongoDB collection.
    const opportunitiesCollection =
      mongoose.connection.collection("opportunities");

    const opportunity = await opportunitiesCollection.findOne({
      _id: new mongoose.Types.ObjectId(opportunityId),
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found.",
      });
    }

    // Check that this opportunity belongs to the requesting company.
    const requestedEmail = normalizeName(companyEmail);
    const requestedCompany = normalizeName(companyName);

    const opportunityEmail = normalizeName(opportunity.companyEmail);
    const opportunityCompany = normalizeName(
      opportunity.companyName || opportunity.company
    );

    if (opportunityEmail) {
      if (!requestedEmail || requestedEmail !== opportunityEmail) {
        return res.status(403).json({
          message: "You cannot view candidates for this opportunity.",
        });
      }
    } else if (
      !requestedCompany ||
      requestedCompany !== opportunityCompany
    ) {
      return res.status(403).json({
        message: "You cannot view candidates for this opportunity.",
      });
    }

    // Read the required skills from the selected opportunity.
    const requiredSkills = normalizeSkillList(
      opportunity.requiredSkills || opportunity.skills
    );

    if (requiredSkills.length === 0) {
      return res.status(400).json({
        message:
          "This opportunity has no required skills. Add required skills before finding candidates.",
      });
    }

    // Fetch student profiles from the existing StudentProfile collection.
    const students = await StudentProfile.find({})
      .select(
        "fullName email phone college degree branch graduationYear careerGoal github linkedin skills"
      )
      .lean();

    const candidates = students.map((student) => {
      const studentSkills = normalizeSkillList(student.skills);

      const matchedSkills = [];
      const improvementSkills = [];
      const missingSkills = [];

      let totalScore = 0;

      requiredSkills.forEach((requiredSkill) => {
        const studentSkill = studentSkills.find(
          (skill) =>
            normalizeName(skill.skillName) ===
            normalizeName(requiredSkill.skillName)
        );

        if (!studentSkill) {
          missingSkills.push(requiredSkill.skillName);
          return;
        }

        const score = calculateSkillScore(
          studentSkill.level,
          requiredSkill.level
        );

        totalScore += score;

        const skillResult = {
          skillName: requiredSkill.skillName,
          studentLevel: studentSkill.level,
          requiredLevel: requiredSkill.level || "Beginner",
          score,
        };

        if (score === 100) {
          matchedSkills.push(skillResult);
        } else {
          improvementSkills.push(skillResult);
        }
      });

      const matchPercentage = Math.round(
        totalScore / requiredSkills.length
      );

      return {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        college: student.college,
        degree: student.degree,
        branch: student.branch,
        graduationYear: student.graduationYear,
        careerGoal: student.careerGoal,
        github: student.github,
        linkedin: student.linkedin,
        skills: studentSkills,
        matchPercentage,
        matchedSkills,
        improvementSkills,
        missingSkills,
      };
    });

    // Show the best matching students first.
    candidates.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );

    return res.status(200).json({
      opportunity: {
        id: opportunity._id,
        title: opportunity.title,
        companyName:
          opportunity.companyName || opportunity.company,
        requiredSkills,
      },
      totalCandidates: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("Find candidates error:", error);

    return res.status(500).json({
      message: "Unable to find suitable candidates.",
      error: error.message,
    });
  }
});

module.exports = router;
