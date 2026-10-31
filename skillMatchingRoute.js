const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const SkillRequirement = require("./SkillRequirement");
const skillRequirementValidation = require("./SkillRequirement-validation");
const StudentProfile = require("./Studentprofile");
const Opportunity = require("./Opportunity");

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

// 1. ADD INDUSTRY SKILL REQUIREMENTS
router.post("/skill-requirements", async (req, res) => {
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
        console.error("Skill Requirement Error:", error);
        res.status(500).json({
            message: "Failed to save skill requirements",
            error: error.message
        });
    }
});

// 2. GET ALL SKILL REQUIREMENTS
router.get("/skill-requirements", async (req, res) => {
    try {
        const requirements = await SkillRequirement.find().sort({ createdAt: -1 });
        res.status(200).json(requirements);
    } catch (error) {
        console.error("Get Requirements Error:", error);
        res.status(500).json({ message: "Failed to load skill requirements" });
    }
});

// 3. SKILL GAP ANALYSIS: Student vs SkillRequirement or Opportunity
router.get("/skill-gap/:email/:requirementId", async (req, res) => {
    try {
        const { email, requirementId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(requirementId)) {
            return res.status(400).json({ message: "Invalid requirement ID" });
        }

        const normalizedEmail = decodeURIComponent(email).trim().toLowerCase();
        const student = await StudentProfile.findOne({ email: normalizedEmail });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found. Please create your profile first." });
        }

        // Check SkillRequirement collection first, then Opportunity collection
        let requirement = await SkillRequirement.findById(requirementId);
        let reqCompany = "";
        let reqType = "";

        if (requirement) {
            reqCompany = requirement.company;
            reqType = requirement.type;
        } else {
            const opp = await Opportunity.findById(requirementId);
            if (!opp) {
                return res.status(404).json({ message: "Requirement or Opportunity not found" });
            }
            requirement = {
                _id: opp._id,
                title: opp.title,
                skills: opp.requiredSkills,
                company: opp.companyName,
                type: opp.type
            };
            reqCompany = opp.companyName;
            reqType = opp.type;
        }

        const studentSkills = Array.isArray(student.skills) ? student.skills : [];
        const requiredSkills = Array.isArray(requirement.skills) ? requirement.skills : [];

        const matchedSkills = [];
        const missingSkills = [];
        const proficiencyGaps = [];
        let totalScore = 0;

        requiredSkills.forEach((reqSkill) => {
            const reqName = normalizeSkillName(reqSkill);
            if (!reqName) return;

            const stSkill = studentSkills.find((s) => normalizeSkillName(s) === reqName);

            if (!stSkill) {
                const reqLevel = getSkillLevel(reqSkill);
                missingSkills.push({
                    skillName: reqSkill.skillName || reqSkill.name,
                    level: reqLevel,
                    requiredLevel: reqLevel
                });
                return;
            }

            const stLevel = getSkillLevel(stSkill);
            const reqLevel = getSkillLevel(reqSkill);

            const stRank = levelRank[stLevel] || 1;
            const reqRank = levelRank[reqLevel] || 1;

            if (stRank < reqRank) {
                proficiencyGaps.push({
                    skillName: reqSkill.skillName || reqSkill.name,
                    studentLevel: stLevel,
                    currentLevel: stLevel,
                    requiredLevel: reqLevel
                });
                totalScore += Math.round((stRank / reqRank) * 100);
            } else {
                matchedSkills.push({
                    skillName: reqSkill.skillName || reqSkill.name,
                    level: stLevel,
                    studentLevel: stLevel,
                    requiredLevel: reqLevel
                });
                totalScore += 100;
            }
        });

        const matchPercentage = requiredSkills.length > 0 ? Math.round(totalScore / requiredSkills.length) : 0;

        const improvementSkills = proficiencyGaps.map(g => ({
            skillName: g.skillName,
            currentLevel: g.studentLevel,
            requiredLevel: g.requiredLevel,
            level: `Current: ${g.studentLevel} → Required: ${g.requiredLevel}`
        }));

        res.status(200).json({
            studentName: student.fullName,
            requirement: {
                title: requirement.title,
                company: reqCompany,
                type: reqType
            },
            requirementTitle: requirement.title,
            company: reqCompany,
            totalRequiredSkills: requiredSkills.length,
            matchPercentage,
            matchedSkills,
            missingSkills,
            improvementSkills,
            proficiencyGaps
        });
    } catch (error) {
        console.error("Skill Gap Error:", error);
        res.status(500).json({ message: "Failed to analyse skills", error: error.message });
    }
});

// 4. SKILL GAP ANALYSIS: Student vs Opportunity
router.get("/skill-gap-opportunity/:email/:opportunityId", async (req, res) => {
    try {
        const { email, opportunityId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
            return res.status(400).json({ message: "Invalid opportunity ID" });
        }

        const normalizedEmail = decodeURIComponent(email).trim().toLowerCase();
        const student = await StudentProfile.findOne({ email: normalizedEmail });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        const studentSkills = Array.isArray(student.skills) ? student.skills : [];
        const requiredSkills = Array.isArray(opportunity.requiredSkills) ? opportunity.requiredSkills : [];

        const matchedSkills = [];
        const missingSkills = [];
        const proficiencyGaps = [];
        let totalScore = 0;

        requiredSkills.forEach((reqSkill) => {
            const reqName = normalizeSkillName(reqSkill);
            if (!reqName) return;

            const stSkill = studentSkills.find((s) => normalizeSkillName(s) === reqName);

            if (!stSkill) {
                missingSkills.push({
                    skillName: reqSkill.skillName || reqSkill.name,
                    requiredLevel: getSkillLevel(reqSkill)
                });
                return;
            }

            const stLevel = getSkillLevel(stSkill);
            const reqLevel = getSkillLevel(reqSkill);

            const stRank = levelRank[stLevel] || 1;
            const reqRank = levelRank[reqLevel] || 1;

            if (stRank < reqRank) {
                proficiencyGaps.push({
                    skillName: reqSkill.skillName || reqSkill.name,
                    studentLevel: stLevel,
                    requiredLevel: reqLevel
                });
                totalScore += Math.round((stRank / reqRank) * 100);
            } else {
                matchedSkills.push({
                    skillName: reqSkill.skillName || reqSkill.name,
                    studentLevel: stLevel,
                    requiredLevel: reqLevel
                });
                totalScore += 100;
            }
        });

        const matchPercentage = requiredSkills.length > 0 ? Math.round(totalScore / requiredSkills.length) : 0;

        res.status(200).json({
            studentName: student.fullName,
            opportunityTitle: opportunity.title,
            companyName: opportunity.companyName,
            totalRequiredSkills: requiredSkills.length,
            matchPercentage,
            matchedSkills,
            missingSkills,
            proficiencyGaps
        });
    } catch (error) {
        console.error("Opportunity Skill Gap Error:", error);
        res.status(500).json({ message: "Failed to analyse opportunity skill gap", error: error.message });
    }
});

module.exports = router;

