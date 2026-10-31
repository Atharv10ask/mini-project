
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "application",
        "opportunity",
        "skill",
        "university",
        "system",
      ],
      default: "system",
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
