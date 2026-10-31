const express = require("express");
const router = express.Router();

const CompanyProfile = require("./companyprofile");

// GET: Load company profile using email
router.get("/", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        message: "Email is required."
      });
    }

    const profile = await CompanyProfile.findOne({
      email: email.trim().toLowerCase()
    });

    if (!profile) {
      return res.status(404).json({
        message: "Company profile not found."
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load company profile.",
      error: error.message
    });
  }
});

// POST: Create or update company profile
router.post("/", async (req, res) => {
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
        companyName,
        email: normalizedEmail,
        industryType,
        companySize,
        establishedYear,
        website: website || "",
        phone,
        location,
        description,
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
      profile
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save company profile.",
      error: error.message
    });
  }
});

module.exports = router;