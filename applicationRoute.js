const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Application = require("./Application");
const StudentProfile = require("./Studentprofile");
const Notification = require("./notificationdata");
const Opportunity = require("./Opportunity");

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
            !companyName ||
            !studentEmail
        ) {
            return res.status(400).json({
                message: "Required application details are missing.",
            });
        }

        const email = studentEmail.trim().toLowerCase();

        // Check if student profile exists
        let student = await StudentProfile.findOne({ email });

        // If no explicit profile yet, fetch from signups/User to allow basic submission or prompt
        if (!student) {
            return res.status(404).json({
                message: "Student profile not found. Please complete your profile first before applying.",
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

        // Fetch opportunity details to get companyEmail if not provided
        let companyEmail = "";
        try {
            if (mongoose.Types.ObjectId.isValid(opportunityId)) {
                const opp = await Opportunity.findById(opportunityId);
                if (opp && opp.companyEmail) {
                    companyEmail = opp.companyEmail;
                }
            }
        } catch (e) {
            // ignore
        }

        const application = await Application.create({
            opportunityId: String(opportunityId),
            opportunityTitle: opportunityTitle.trim(),
            opportunityType: opportunityType || "Internship",
            companyName: companyName.trim(),
            companyEmail: companyEmail.toLowerCase().trim(),
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

        // Create notification for student
        await Notification.create({
            email,
            studentEmail: email,
            title: "Application Submitted",
            message: `You applied for ${opportunityTitle} at ${companyName}. Status: Applied.`,
            type: "application",
            read: false,
            isRead: false
        }).catch(err => console.error("Notification creation error:", err));

        // Create notification for company if companyEmail is available
        if (companyEmail) {
            await Notification.create({
                email: companyEmail,
                title: "New Application Received",
                message: `${student.fullName} has applied for "${opportunityTitle}".`,
                type: "application",
                read: false,
                isRead: false
            }).catch(err => console.error("Company notification error:", err));
        }

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
            error: error.message
        });
    }
});

// GET: All applications (Admin / Overview)
router.get("/all", async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        return res.json(applications);
    } catch (error) {
        console.error("All applications error:", error);
        return res.status(500).json({ message: "Unable to load applications." });
    }
});

// INDUSTRY: Get applications for a company
router.get("/company", async (req, res) => {
    try {
        const companyName = req.query.companyName;
        const companyEmail = req.query.companyEmail;

        let query = {};
        if (companyEmail) {
            query.companyEmail = companyEmail.trim().toLowerCase();
        } else if (companyName) {
            query.companyName = {
                $regex: `^${companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            };
        } else {
            return res.status(400).json({
                message: "Company name or company email is required.",
            });
        }

        if (req.query.opportunityId) {
            query.opportunityId = String(req.query.opportunityId);
        }

        const applications = await Application.find(query).sort({ createdAt: -1 });
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
            "Applied",
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

        const query = { _id: req.params.id };
        if (companyName) {
            query.companyName = {
                $regex: `^${companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            };
        }

        const application = await Application.findOneAndUpdate(
            query,
            { status },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
            });
        }

        // Notify student of status update
        await Notification.create({
            email: application.studentEmail,
            studentEmail: application.studentEmail,
            title: `Application Status: ${status}`,
            message: `Your application for "${application.opportunityTitle}" at ${application.companyName} is now: ${status}.`,
            type: "application",
            read: false,
            isRead: false
        }).catch(err => console.error("Notification creation error on status change:", err));

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

// DELETE: Delete an application
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid application ID." });
        }

        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        return res.json({ message: "Application deleted successfully." });
    } catch (error) {
        console.error("Delete application error:", error);
        return res.status(500).json({ message: "Unable to delete application." });
    }
});

module.exports = router;
