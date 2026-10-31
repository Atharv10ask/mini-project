
const express = require("express");
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
      location,
      workMode,
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

    const company = await CompanyProfile.findOne({
      email: companyEmail.trim().toLowerCase()
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found. Please create your company profile first."
      });
    }

    const parsedDeadline = new Date(deadline);
    const parsedOpenings = Number(openings);

    if (Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid deadline."
      });
    }

    if (!Number.isInteger(parsedOpenings) || parsedOpenings < 1) {
      return res.status(400).json({
        message: "Number of openings must be at least 1."
      });
    }

    const cleanedSkills = requiredSkills
      .filter((skill) => skill && skill.skillName)
      .map((skill) => ({
        skillName: String(skill.skillName).trim(),
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
      companyName: company.companyName,
      companyEmail: company.email,
      location: location.trim(),
      workMode,
      description: description.trim(),
      requiredSkills: cleanedSkills,
      eligibility: eligibility.trim(),
      openings: parsedOpenings,
      compensation: compensation || "",
      deadline: parsedDeadline
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

// GET: Retrieve all open opportunities for students
router.get("/", async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      status: "Open",
      deadline: { $gte: new Date() }
    }).sort({ createdAt: -1 });

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

module.exports = router;
