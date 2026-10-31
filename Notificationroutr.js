const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Notification = require("./notificationdata");

// GET notifications by query parameter ?email=...
router.get("/", async (req, res) => {
    try {
        const email = String(req.query.email || req.query.studentEmail || "").toLowerCase().trim();
        if (!email) {
            return res.status(400).json({ message: "Email query parameter is required" });
        }

        const notifications = await Notification.find({
            $or: [{ email }, { studentEmail: email }]
        }).sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Notification query fetch error:", error);
        res.status(500).json({ message: "Failed to load notifications" });
    }
});

// GET notifications by route parameter /:email
router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase().trim();

        const notifications = await Notification.find({
            $or: [{ email }, { studentEmail: email }]
        }).sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Notification route fetch error:", error);
        res.status(500).json({ message: "Failed to load notifications" });
    }
});

// CREATE notification
router.post("/", async (req, res) => {
    try {
        const { email, studentEmail, title, message, type, link } = req.body;
        const targetEmail = (email || studentEmail || "").trim().toLowerCase();

        if (!targetEmail || !message) {
            return res.status(400).json({ message: "Target email and message are required" });
        }

        const notification = await Notification.create({
            email: targetEmail,
            studentEmail: targetEmail,
            title: title || "Notification",
            message: message.trim(),
            type: type || "system",
            link: link || "",
            read: false,
            isRead: false
        });

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });
    } catch (error) {
        console.error("Notification create error:", error);
        res.status(500).json({ message: "Failed to create notification" });
    }
});

// MARK AS READ (PUT & PATCH)
async function markNotificationAsRead(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true, isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Notification update error:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
}

router.put("/:id", markNotificationAsRead);
router.patch("/:id", markNotificationAsRead);
router.patch("/:id/read", markNotificationAsRead);

// MARK ALL AS READ
router.put("/read-all/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase().trim();
        await Notification.updateMany(
            { $or: [{ email }, { studentEmail: email }] },
            { read: true, isRead: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Notification mark-all error:", error);
        res.status(500).json({ message: "Failed to mark notifications as read" });
    }
});

module.exports = router;
