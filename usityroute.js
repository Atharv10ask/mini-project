const express = require("express");
const router = express.Router();
const StudentProfile = require("./Studentprofile");
const University = require("./University");
const SkillRequirement = require("./SkillRequirement");
const Opportunity = require("./Opportunity");

// GET /university/students: View student skill profiles
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

// GET /university/skill-gaps: Summary of skill gaps across students vs industry requirements
router.get("/skill-gaps", async (req, res) => {
    try {
        const [students, requirements, opportunities] = await Promise.all([
            StudentProfile.find().lean(),
            SkillRequirement.find().lean(),
            Opportunity.find().lean()
        ]);

        // Aggregate all student skills
        const studentSkillCounts = {};
        students.forEach((st) => {
            (st.skills || []).forEach((sk) => {
                const name = (sk.name || sk.skillName || "").trim().toLowerCase();
                if (name) {
                    studentSkillCounts[name] = (studentSkillCounts[name] || 0) + 1;
                }
            });
        });

        // Aggregate industry requirements
        const industrySkillDemands = {};
        const allRequirements = [...requirements, ...opportunities];
        allRequirements.forEach((item) => {
            const skills = item.skills || item.requiredSkills || [];
            skills.forEach((sk) => {
                const name = (sk.skillName || sk.name || "").trim().toLowerCase();
                if (name) {
                    industrySkillDemands[name] = (industrySkillDemands[name] || 0) + 1;
                }
            });
        });

        const gaps = [];
        for (const [skill, demandCount] of Object.entries(industrySkillDemands)) {
            const studentCount = studentSkillCounts[skill] || 0;
            gaps.push({
                skillName: skill,
                industryDemand: demandCount,
                studentCount,
                gap: Math.max(0, demandCount - studentCount)
            });
        }

        gaps.sort((a, b) => b.gap - a.gap);

        res.status(200).json({
            totalStudents: students.length,
            totalOpportunities: opportunities.length,
            totalRequirements: requirements.length,
            skillGaps: gaps
        });
    } catch (error) {
        console.error("University skill-gaps error:", error);
        res.status(500).json({ message: "Failed to compute skill gap analytics" });
    }
});

// GET /university/profile: Load university profile
router.get("/profile", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            const universities = await University.find();
            return res.status(200).json(universities);
        }

        const university = await University.findOne({
            email: email.trim().toLowerCase()
        });

        if (!university) {
            return res.status(404).json({ message: "University profile not found" });
        }

        res.status(200).json(university);
    } catch (error) {
        res.status(500).json({ message: "Failed to load university profile" });
    }
});

// POST & PUT /university/profile
async function saveUniversityProfile(req, res) {
    try {
        const { name, email, location, contactPerson, phone, website, departments, establishedYear, description } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const university = await University.findOneAndUpdate(
            { email: normalizedEmail },
            {
                name: name.trim(),
                email: normalizedEmail,
                location: location || "",
                contactPerson: contactPerson || "",
                phone: phone || "",
                website: website || "",
                departments: Array.isArray(departments) ? departments : (departments ? [departments] : []),
                establishedYear: Number(establishedYear) || undefined,
                description: description || ""
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            message: "University profile saved successfully",
            university
        });
    } catch (error) {
        console.error("University profile save error:", error);
        res.status(500).json({ message: "Failed to save university profile", error: error.message });
    }
}

router.post("/profile", saveUniversityProfile);
router.put("/profile", saveUniversityProfile);

module.exports = router;
