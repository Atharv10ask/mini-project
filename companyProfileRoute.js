const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CompanyProfile = require("./companyprofile");

// GET: All company profiles (for Admin / University)
router.get("/all", async (req, res) => {
    try {
        const companies = await CompanyProfile.find().sort({ companyName: 1 });
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({
            message: "Failed to load company profiles.",
            error: error.message
        });
    }
});

// GET: Load company profile using query ?email=...
router.get("/", async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            // If no email query, return all companies
            const companies = await CompanyProfile.find().sort({ companyName: 1 });
            return res.status(200).json(companies);
        }

        const profile = await CompanyProfile.findOne({
            email: email.trim().toLowerCase()
        });

        if (!profile) {
            return res.status(404).json({
                message: "Company profile not found."
            });
        }

        // Return profile directly and wrapped for compatibility
        res.status(200).json({
            ...profile.toObject(),
            profile: profile.toObject(),
            company: profile.toObject()
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to load company profile.",
            error: error.message
        });
    }
});

// GET: Load company profile using route param /:email
router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).trim().toLowerCase();
        const profile = await CompanyProfile.findOne({ email });

        if (!profile) {
            return res.status(404).json({
                message: "Company profile not found."
            });
        }

        res.status(200).json({
            ...profile.toObject(),
            profile: profile.toObject(),
            company: profile.toObject()
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to load company profile.",
            error: error.message
        });
    }
});

// POST & PUT: Create or update company profile
async function saveCompanyProfile(req, res) {
    try {
        const {
            companyName,
            email,
            industryType,
            companySize,
            establishedYear,
            website,
            phone,
            location,
            description,
            technologies,
            expertise
        } = req.body;

        if (
            !companyName ||
            !email ||
            !industryType ||
            !companySize ||
            !establishedYear ||
            !phone ||
            !location ||
            !description
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const profile = await CompanyProfile.findOneAndUpdate(
            { email: normalizedEmail },
            {
                companyName: companyName.trim(),
                email: normalizedEmail,
                industryType,
                companySize,
                establishedYear: Number(establishedYear),
                website: website || "",
                phone: phone.trim(),
                location: location.trim(),
                description: description.trim(),
                technologies: Array.isArray(technologies) ? technologies : [],
                expertise: Array.isArray(expertise) ? expertise : []
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            message: "Company profile saved successfully!",
            profile: profile.toObject(),
            company: profile.toObject()
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to save company profile.",
            error: error.message
        });
    }
}

router.post("/", saveCompanyProfile);
router.put("/", saveCompanyProfile);

// DELETE: Remove company profile
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID." });
        }
        await CompanyProfile.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Company profile deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete company profile." });
    }
});

module.exports = router;
