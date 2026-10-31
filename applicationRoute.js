
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Application = require("./Application");
const StudentProfile = require("./Studentprofile");

// STUDENT: Submit an application
router.post("/", async (req, res) => {
  try {
    const {
      opportunityId,
      opportunityTitle,
      opportunityType,
      companyName,
      location,
      stipend,
      studentEmail,
    } = req.body;

    if (
      !opportunityId ||
      !opportunityTitle ||
      !opportunityType ||
      !companyName ||
      !studentEmail
    ) {
      return res.status(400).json({
        message: "Required application details are missing.",
      });
    }

    const email = studentEmail.trim().toLowerCase();

    const student = await StudentProfile.findOne({
      email,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found. Please complete your profile.",
      });
    }

    const existingApplication = await Application.findOne({
      opportunityId: String(opportunityId),
      studentEmail: email,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied for this opportunity.",
      });
    }

    const application = await Application.create({
      opportunityId: String(opportunityId),
      opportunityTitle,
      opportunityType,
      companyName: companyName.trim(),
      location: location || "",
      stipend: stipend || "",
      studentName: student.fullName,
      studentEmail: email,
      college: student.college || "",
      degree: student.degree || "",
      branch: student.branch || "",
      skills: student.skills || [],
      status: "Applied",
    });

    return res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this opportunity.",
      });
    }

    console.error("Application submission error:", error);

    return res.status(500).json({
      message: "Unable to submit application.",
    });
  }
});

// INDUSTRY: Get applications for a company
router.get("/company", async (req, res) => {
  try {
    const companyName = req.query.companyName;

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required.",
      });
    }

    const applications = await Application.find({
      companyName: {
        $regex: `^${companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    console.error("Company applications error:", error);

    return res.status(500).json({
      message: "Unable to load applications.",
    });
  }
});

// STUDENT: Get their own applications
router.get("/student", async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Student email is required.",
      });
    }

    const applications = await Application.find({
      studentEmail: email,
    }).sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    console.error("Student applications error:", error);

    return res.status(500).json({
      message: "Unable to load student applications.",
    });
  }
});

// INDUSTRY: Update application status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, companyName } = req.body;

    const allowedStatuses = [
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid application ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status.",
      });
    }

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required.",
      });
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        companyName: {
          $regex: `^${companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found for this company.",
      });
    }

    return res.json({
      message: "Application status updated successfully.",
      application,
    });
  } catch (error) {
    console.error("Status update error:", error);

    return res.status(500).json({
      message: "Unable to update application status.",
    });
  }
});

module.exports = router;
