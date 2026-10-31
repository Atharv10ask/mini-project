const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const StudentProfile = require("./Studentprofile");
const studentProfileValidation = require("./Studentprofile-validation");
const Opportunity = require("./Opportunity");
const MatchingResult = require("./MatchingResult");

function normalizeSkillName(skill) {
    if (typeof skill === "string") {
        return skill.trim().toLowerCase();
    }
    if (!skill || typeof skill !== "object") {
        return "";
    }
    return String(skill.skillName || skill.name || skill.skill || "").trim().toLowerCase();
}

function getSkillLevel(skill) {
    if (!skill || typeof skill !== "object") {
        return "Beginner";
    }
    return skill.level || skill.proficiency || "Beginner";
}

const levelRank = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4
};

// POST & PUT /student-profile: Save or update student profile
async function saveOrUpdateProfile(req, res) {
    try {
        const result = studentProfileValidation.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid student profile data",
                errors: result.error.errors
            });
        }

        const data = result.data;
        const normalizedEmail = data.email.trim().toLowerCase();

        const student = await StudentProfile.findOneAndUpdate(
            { email: normalizedEmail },
            {
                fullName: data.fullName.trim(),
                email: normalizedEmail,
                phone: data.phone || "",
                college: data.college.trim(),
                degree: data.degree,
                branch: data.branch.trim(),
                graduationYear: Number(data.graduationYear),
                careerGoal: data.careerGoal || "",
                skills: data.skills,
                github: data.github || "",
                linkedin: data.linkedin || ""
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            message: "Student profile saved successfully",
            student
        });
    } catch (error) {
        console.error("Student Profile Save Error:", error);
        return res.status(500).json({
            message: "Failed to save student profile",
            error: error.message
        });
    }
}

router.post("/", saveOrUpdateProfile);
router.put("/", saveOrUpdateProfile);

// GET /student-profile (supports ?email=)
router.get("/", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            const students = await StudentProfile.find().sort({ fullName: 1 });
            return res.status(200).json(students);
        }

        const normalizedEmail = decodeURIComponent(email).trim().toLowerCase();
        const student = await StudentProfile.findOne({ email: normalizedEmail });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        return res.status(200).json(student);
    } catch (error) {
        console.error("Get Student Query Error:", error);
        return res.status(500).json({ message: "Failed to load student profile" });
    }
});

// GET /student-profile/all
router.get("/all", async (req, res) => {
    try {
        const students = await StudentProfile.find().sort({ fullName: 1 });
        return res.status(200).json(students);
    } catch (error) {
        return res.status(500).json({ message: "Failed to load student profiles" });
    }
});

// GET /student-profile/recommendations/:email
// Compare student skills against ALL open opportunities and rank them
router.get("/recommendations/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).trim().toLowerCase();
        const student = await StudentProfile.findOne({ email });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const studentSkills = Array.isArray(student.skills) ? student.skills : [];
        const opportunities = await Opportunity.find({ status: "Open" }).sort({ createdAt: -1 });

        const recommendations = [];

        for (const opp of opportunities) {
            const requiredSkills = Array.isArray(opp.requiredSkills) ? opp.requiredSkills : [];
            if (requiredSkills.length === 0) continue;

            const matchedSkills = [];
            const missingSkills = [];
            const proficiencyGaps = [];
            let totalScore = 0;

            requiredSkills.forEach((reqSkill) => {
                const reqName = normalizeSkillName(reqSkill);
                const reqLevel = getSkillLevel(reqSkill);
                const reqRank = levelRank[reqLevel] || 1;

                const stSkill = studentSkills.find((s) => normalizeSkillName(s) === reqName);

                if (!stSkill) {
                    missingSkills.push({
                        skillName: reqSkill.skillName || reqSkill.name,
                        requiredLevel: reqLevel
                    });
                } else {
                    const stLevel = getSkillLevel(stSkill);
                    const stRank = levelRank[stLevel] || 1;

                    if (stRank >= reqRank) {
                        matchedSkills.push({
                            skillName: reqSkill.skillName || reqSkill.name,
                            studentLevel: stLevel,
                            requiredLevel: reqLevel
                        });
                        totalScore += 100;
                    } else {
                        proficiencyGaps.push({
                            skillName: reqSkill.skillName || reqSkill.name,
                            studentLevel: stLevel,
                            requiredLevel: reqLevel
                        });
                        totalScore += Math.round((stRank / reqRank) * 100);
                    }
                }
            });

            const matchPercentage = Math.round(totalScore / requiredSkills.length);

            // Persist or update matching result in database
            await MatchingResult.findOneAndUpdate(
                { studentEmail: email, opportunityId: String(opp._id) },
                {
                    studentEmail: email,
                    opportunityId: String(opp._id),
                    opportunityTitle: opp.title,
                    companyName: opp.companyName,
                    matchPercentage,
                    matchedSkills,
                    missingSkills,
                    proficiencyGaps,
                    calculatedAt: new Date()
                },
                { upsert: true, new: true }
            ).catch(err => console.error("MatchingResult cache error:", err));

            recommendations.push({
                opportunity: opp,
                matchPercentage,
                matchedSkills,
                missingSkills,
                proficiencyGaps
            });
        }

        recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

        return res.status(200).json({
            studentName: student.fullName,
            studentEmail: student.email,
            recommendations
        });
    } catch (error) {
        console.error("Recommendations error:", error);
        return res.status(500).json({ message: "Failed to generate recommendations", error: error.message });
    }
});

// GET /student-profile/:email
router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).trim().toLowerCase();
        const student = await StudentProfile.findOne({ email });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        return res.status(200).json(student);
    } catch (error) {
        console.error("Get Student Param Error:", error);
        return res.status(500).json({ message: "Failed to load student profile" });
    }
});

module.exports = router;

