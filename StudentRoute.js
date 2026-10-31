
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());
app.use(express.json());

// ======================================
// MODELS AND VALIDATION
// ======================================

const StudentProfile = require("./Studentprofile");
const studentProfileValidation = require("./Studentprofile-validation");

const SkillRequirement = require("./SkillRequirement");
const skillRequirementValidation = require("./SkillRequirement-validation");

const Opportunity = require("./Opportunity");

// ======================================
// IMPORT ROUTES
// ======================================

const universityRoute = require("./usityroute");
const notificationRoute = require("./Notificationroutr");

// ======================================
// CONNECT ROUTES
// ======================================

app.use("/university", universityRoute);
app.use("/notifications", notificationRoute);

// ======================================
// HELPER FUNCTIONS
// ======================================

function normalizeSkillName(skill) {
    if (typeof skill === "string") {
        return skill.trim().toLowerCase();
    }

    if (!skill || typeof skill !== "object") {
        return "";
    }

    return String(skill.skillName || skill.name || "")
        .trim()
        .toLowerCase();
}

function getSkillLevel(skill) {
    if (!skill || typeof skill !== "object") {
        return "Beginner";
    }

    return skill.level || "Beginner";
}

const levelRank = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4
};

// ======================================
// STUDENT PROFILE - SAVE
// ======================================

app.post("/student-profile", async (req, res) => {
    try {
        const result = studentProfileValidation.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid student profile data",
                errors: result.error.errors
            });
        }

        const existingStudent = await StudentProfile.findOne({
            email: result.data.email
        });

        if (existingStudent) {
            return res.status(409).json({
                message: "Student profile already exists"
            });
        }

        const student = await StudentProfile.create(result.data);

        res.status(201).json({
            message: "Student profile saved successfully",
            student
        });

    } catch (error) {
        console.log("Student Profile Error:", error);

        res.status(500).json({
            message: "Failed to save student profile"
        });
    }
});

// ======================================
// GET STUDENT PROFILE
// ======================================

app.get("/student-profile/:email", async (req, res) => {
    try {
        const student = await StudentProfile.findOne({
            email: req.params.email
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        console.log("Get Student Error:", error);

        res.status(500).json({
            message: "Failed to get student profile"
        });
    }
});

// ======================================
// ADD INDUSTRY SKILL REQUIREMENTS
// ======================================

app.post("/skill-requirements", async (req, res) => {
    try {
        const result = skillRequirementValidation.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid skill requirement data",
                errors: result.error.errors
            });
        }

        const requirement = await SkillRequirement.create(result.data);

        res.status(201).json({
            message: "Skill requirements saved successfully",
            requirement
        });

    } catch (error) {
        console.log("Skill Requirement Error:", error);

        res.status(500).json({
            message: "Failed to save skill requirements"
        });
    }
});

// ======================================
// GET ALL SKILL REQUIREMENTS
// ======================================

app.get("/skill-requirements", async (req, res) => {
    try {
        const requirements = await SkillRequirement.find()
            .sort({ _id: -1 });

        res.status(200).json(requirements);

    } catch (error) {
        console.log("Get Requirements Error:", error);

        res.status(500).json({
            message: "Failed to load skill requirements"
        });
    }
});

// ======================================
// SKILL GAP ANALYSIS
// ======================================

app.get("/skill-gap/:email/:requirementId", async (req, res) => {
    try {
        const { email, requirementId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(requirementId)) {
            return res.status(400).json({
                message: "Invalid requirement ID"
            });
        }

        const student = await StudentProfile.findOne({ email });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const requirement = await SkillRequirement.findById(
            requirementId
        );

        if (!requirement) {
            return res.status(404).json({
                message: "Skill requirement not found"
            });
        }

        const studentSkills = Array.isArray(student.skills)
            ? student.skills
            : [];

        const requiredSkills = Array.isArray(requirement.skills)
            ? requirement.skills
            : [];

        const matchedSkills = [];
        const missingSkills = [];
        const proficiencyGaps = [];

        requiredSkills.forEach(requiredSkill => {
            const requiredName = normalizeSkillName(requiredSkill);

            if (!requiredName) return;

            const studentSkill = studentSkills.find(skill => {
                return normalizeSkillName(skill) === requiredName;
            });

            if (!studentSkill) {
                missingSkills.push({
                    skillName: requiredSkill.skillName || requiredSkill.name,
                    requiredLevel: getSkillLevel(requiredSkill)
                });

                return;
            }

            const studentLevel = getSkillLevel(studentSkill);
            const requiredLevel = getSkillLevel(requiredSkill);

            const studentRank = levelRank[studentLevel] || 1;
            const requiredRank = levelRank[requiredLevel] || 1;

            if (studentRank < requiredRank) {
                proficiencyGaps.push({
                    skillName: requiredSkill.skillName || requiredSkill.name,
                    studentLevel,
                    requiredLevel
                });
            } else {
                matchedSkills.push({
                    skillName: requiredSkill.skillName || requiredSkill.name,
                    studentLevel,
                    requiredLevel
                });
            }
        });

        res.status(200).json({
            studentName: student.fullName,
            requirementTitle: requirement.title,
            totalRequiredSkills: requiredSkills.length,
            matchedSkills,
            missingSkills,
            proficiencyGaps
        });

    } catch (error) {
        console.log("Skill Gap Error:", error);

        res.status(500).json({
            message: "Failed to analyse skills"
        });
    }
});

// ======================================
// POST OPPORTUNITY - INDUSTRY
// ======================================

app.post("/opportunities", async (req, res) => {
    try {
        const {
            title,
            companyName,
            type,
            location,
            workMode,
            description,
            requiredSkills,
            compensation,
            openings,
            deadline
        } = req.body;

        if (!title || !companyName) {
            return res.status(400).json({
                message: "Title and company name are required"
            });
        }

        const opportunity = await Opportunity.create({
            title,
            companyName,
            type,
            location,
            workMode,
            description,
            requiredSkills,
            compensation,
            openings,
            deadline: deadline || null
        });

        res.status(201).json({
            message: "Opportunity posted successfully",
            opportunity
        });

    } catch (error) {
        console.log("Post Opportunity Error:", error);

        res.status(500).json({
            message: "Failed to post opportunity"
        });
    }
});

// ======================================
// GET ALL OPPORTUNITIES - STUDENT
// ======================================

app.get("/opportunities", async (req, res) => {
    try {
        const opportunities = await Opportunity.find()
            .sort({ createdAt: -1 });

        res.status(200).json(opportunities);

    } catch (error) {
        console.log("Get Opportunities Error:", error);

        res.status(500).json({
            message: "Failed to load opportunities"
        });
    }
});

// ======================================
// HOME ROUTE
// ======================================

app.get("/", (req, res) => {
    res.send("Academia-Industry Collaboration Portal Backend is Running");
});

// ======================================
// MONGODB CONNECTION
// ======================================

const PORT = process.env.PORT || 3000;

const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/academia_industry_portal";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log("MongoDB Connection Error:", error);
    });
