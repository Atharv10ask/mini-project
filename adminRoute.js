const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { User } = require("./data");
const StudentProfile = require("./Studentprofile");
const CompanyProfile = require("./companyprofile");
const Opportunity = require("./Opportunity");
const Application = require("./Application");
const SkillRequirement = require("./SkillRequirement");
const University = require("./University");

// GET: Full admin dashboard data
router.get("/dashboard", async (req, res) => {
    try {
        const [
            students,
            companies,
            opportunities,
            applications,
            requirements,
            users,
            universities
        ] = await Promise.all([
            StudentProfile.find().sort({ createdAt: -1 }).lean(),
            CompanyProfile.find().sort({ createdAt: -1 }).lean(),
            Opportunity.find().sort({ createdAt: -1 }).lean(),
            Application.find().sort({ createdAt: -1 }).lean(),
            SkillRequirement.find().sort({ createdAt: -1 }).lean(),
            User.find().select("-password").sort({ createdAt: -1 }).lean(),
            University.find().sort({ createdAt: -1 }).lean()
        ]);

        const counts = {
            students: students.length,
            companies: companies.length,
            opportunities: opportunities.length,
            applications: applications.length,
            requirements: requirements.length,
            users: users.length,
            universities: universities.length
        };

        res.status(200).json({
            counts,
            students,
            companies,
            opportunities,
            applications,
            requirements,
            users,
            universities
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).json({
            message: "Failed to load admin dashboard data",
            error: error.message
        });
    }
});

// GET: Platform analytics and activity report
router.get("/analytics", async (req, res) => {
    try {
        const [usersByRole, applicationsByStatus, opportunitiesByType] = await Promise.all([
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),
            Application.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Opportunity.aggregate([
                { $group: { _id: "$type", count: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json({
            usersByRole,
            applicationsByStatus,
            opportunitiesByType,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Admin analytics error:", error);
        res.status(500).json({ message: "Failed to load analytics", error: error.message });
    }
});

// DELETE User
router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
});

// DELETE Company
router.delete("/companies/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid company ID" });
        }
        await CompanyProfile.findByIdAndDelete(id);
        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete company", error: error.message });
    }
});

// DELETE Opportunity
router.delete("/opportunities/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid opportunity ID" });
        }
        await Opportunity.findByIdAndDelete(id);
        res.status(200).json({ message: "Opportunity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete opportunity", error: error.message });
    }
});

// DELETE Application
router.delete("/applications/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }
        await Application.findByIdAndDelete(id);
        res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete application", error: error.message });
    }
});

// DELETE Skill Requirement
router.delete("/requirements/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid requirement ID" });
        }
        await SkillRequirement.findByIdAndDelete(id);
        res.status(200).json({ message: "Skill requirement deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete skill requirement", error: error.message });
    }
});

module.exports = router;

