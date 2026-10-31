
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Notification Schema
const notificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);

// GET notifications
router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email)
            .toLowerCase()
            .trim();

        const notifications = await Notification.find({ email })
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);

    } catch (error) {
        console.log("Notification Fetch Error:", error);

        res.status(500).json({
            message: "Failed to load notifications"
        });
    }
});

// CREATE notification
router.post("/", async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({
                message: "Email and message are required"
            });
        }

        const notification = await Notification.create({
            email,
            message
        });

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.log("Notification Create Error:", error);

        res.status(500).json({
            message: "Failed to create notification"
        });
    }
});

// MARK AS READ
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json(notification);

    } catch (error) {
        console.log("Notification Update Error:", error);

        res.status(500).json({
            message: "Failed to update notification"
        });
    }
});

module.exports = router;
