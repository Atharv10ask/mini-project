const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Opportunity = require("./Opportunity");
const CompanyProfile = require("./companyprofile");

// POST: Create a new internship or job
router.post("/", async (req, res) => {
    try {
        const {
            title,
            type,
            companyEmail,
            companyName: providedCompanyName,
            location,
            workMode,
            domain,
            description,
            requiredSkills,
            eligibility,
            openings,
            compensation,
            deadline
        } = req.body;

        if (
            !title ||
            !type ||
            !companyEmail ||
            !location ||
            !workMode ||
            !description ||
            !eligibility ||
            !deadline
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        if (!["Internship", "Job"].includes(type)) {
            return res.status(400).json({
                message: "Type must be Internship or Job."
            });
        }

        if (!["On-site", "Remote", "Hybrid"].includes(workMode)) {
            return res.status(400).json({
                message: "Please select a valid work mode."
            });
        }

        if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
            return res.status(400).json({
                message: "Add at least one required skill."
            });
        }

        const normalizedEmail = companyEmail.trim().toLowerCase();
        let company = await CompanyProfile.findOne({ email: normalizedEmail });

        let companyName = providedCompanyName || (company ? company.companyName : "Industry Partner");

        // If company profile didn't exist yet, we can create a placeholder profile
        if (!company) {
            try {
                company = await CompanyProfile.create({
                    companyName,
                    email: normalizedEmail,
                    industryType: "Technology",
                    companySize: "10-50",
                    establishedYear: new Date().getFullYear(),
                    phone: "N/A",
                    location: location.trim(),
                    description: `Profile for ${companyName}`
                });
            } catch (profileErr) {
                // Ignore if race condition
            }
        }

        const parsedDeadline = new Date(deadline);
        const parsedOpenings = Number(openings) || 1;

        if (Number.isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({
                message: "Please provide a valid deadline."
            });
        }

        const cleanedSkills = requiredSkills
            .filter((skill) => skill && (skill.skillName || skill.name))
            .map((skill) => ({
                skillName: String(skill.skillName || skill.name).trim(),
                level: skill.level || "Beginner"
            }));

        if (cleanedSkills.length === 0) {
            return res.status(400).json({
                message: "Add at least one valid skill."
            });
        }

        const opportunity = await Opportunity.create({
            title: title.trim(),
            type,
            domain: domain || "Technology",
            companyName: company ? company.companyName : companyName,
            companyEmail: normalizedEmail,
            location: location.trim(),
            workMode,
            description: description.trim(),
            requiredSkills: cleanedSkills,
            eligibility: eligibility.trim(),
            openings: parsedOpenings,
            compensation: compensation || "Not specified",
            deadline: parsedDeadline,
            status: "Open"
        });

        return res.status(201).json({
            message: "Opportunity published successfully!",
            opportunity
        });
    } catch (error) {
        console.error("Publish opportunity error:", error);
        return res.status(500).json({
            message: "Failed to publish opportunity.",
            error: error.message
        });
    }
});

// GET: Retrieve all opportunities with optional filters
router.get("/", async (req, res) => {
    try {
        const query = {};

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.type) {
            query.type = req.query.type;
        }

        if (req.query.companyEmail) {
            query.companyEmail = req.query.companyEmail.trim().toLowerCase();
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search.trim(), "i");
            query.$or = [
                { title: searchRegex },
                { companyName: searchRegex },
                { description: searchRegex },
                { "requiredSkills.skillName": searchRegex }
            ];
        }

        const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
        return res.status(200).json(opportunities);
    } catch (error) {
        console.error("Fetch opportunities error:", error);
        return res.status(500).json({
            message: "Failed to fetch opportunities."
        });
    }
});

// GET: Retrieve opportunities posted by one company
router.get("/company/:email", async (req, res) => {
    try {
        const email = req.params.email.trim().toLowerCase();
        const opportunities = await Opportunity.find({
            companyEmail: email
        }).sort({ createdAt: -1 });

        return res.status(200).json(opportunities);
    } catch (error) {
        console.error("Fetch company opportunities error:", error);
        return res.status(500).json({
            message: "Failed to fetch company opportunities."
        });
    }
});

// GET: Single opportunity by ID
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid opportunity ID." });
        }

        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found." });
        }

        return res.status(200).json(opportunity);
    } catch (error) {
        console.error("Fetch single opportunity error:", error);
        return res.status(500).json({ message: "Failed to fetch opportunity." });
    }
});

// PATCH: Update required skills for an opportunity (called by SpecifyRequiredSkills)
router.patch("/:id/required-skills", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid opportunity ID." });
        }

        const { requiredSkills, companyEmail } = req.body;

        if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
            return res.status(400).json({ message: "Please provide at least one required skill." });
        }

        const cleanedSkills = requiredSkills
            .filter((s) => s && (s.skillName || s.name))
            .map((s) => ({
                skillName: String(s.skillName || s.name).trim(),
                level: s.level || "Beginner"
            }));

        const query = { _id: req.params.id };
        if (companyEmail) {
            query.companyEmail = companyEmail.trim().toLowerCase();
        }

        const opportunity = await Opportunity.findOneAndUpdate(
            query,
            { requiredSkills: cleanedSkills },
            { new: true, runValidators: true }
        );

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found or not owned by company." });
        }

        return res.status(200).json({
            message: "Required skills updated successfully.",
            opportunity
        });
    } catch (error) {
        console.error("Update required skills error:", error);
        return res.status(500).json({ message: "Failed to update required skills." });
    }
});

// PATCH: Update status (Open / Closed)
router.patch("/:id/status", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid opportunity ID." });
        }

        const { status } = req.body;
        if (!["Open", "Closed"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'Open' or 'Closed'." });
        }

        const opportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found." });
        }

        return res.status(200).json({
            message: `Opportunity status updated to ${status}.`,
            opportunity
        });
    } catch (error) {
        console.error("Update status error:", error);
        return res.status(500).json({ message: "Failed to update opportunity status." });
    }
});

// DELETE: Remove an opportunity
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid opportunity ID." });
        }

        const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found." });
        }

        return res.status(200).json({ message: "Opportunity deleted successfully." });
    } catch (error) {
        console.error("Delete opportunity error:", error);
        return res.status(500).json({ message: "Failed to delete opportunity." });
    }
});

module.exports = router;
