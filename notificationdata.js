const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        studentEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        title: {
            type: String,
            default: "Notification",
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: [
                "application",
                "opportunity",
                "skill",
                "university",
                "system"
            ],
            default: "system"
        },
        link: {
            type: String,
            default: "",
            trim: true
        },
        read: {
            type: Boolean,
            default: false
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Pre-save to sync read and isRead, and email and studentEmail
notificationSchema.pre("save", function () {
    if (this.read !== undefined && this.isRead === undefined) {
        this.isRead = this.read;
    } else if (this.isRead !== undefined && this.read === undefined) {
        this.read = this.isRead;
    }
    if (this.email && !this.studentEmail) {
        this.studentEmail = this.email;
    } else if (this.studentEmail && !this.email) {
        this.email = this.studentEmail;
    }
});

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
