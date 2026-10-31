const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        opportunityId: {
            type: String,
            required: true,
            index: true
        },
        opportunityTitle: {
            type: String,
            required: true,
            trim: true
        },
        opportunityType: {
            type: String,
            default: "Internship"
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        companyEmail: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },
        location: {
            type: String,
            default: ""
        },
        stipend: {
            type: String,
            default: ""
        },
        studentName: {
            type: String,
            required: true,
            trim: true
        },
        studentEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        college: {
            type: String,
            default: ""
        },
        degree: {
            type: String,
            default: ""
        },
        branch: {
            type: String,
            default: ""
        },
        skills: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        status: {
            type: String,
            enum: ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"],
            default: "Applied"
        },
        notes: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

// Compound index to avoid duplicate applications
applicationSchema.index({ opportunityId: 1, studentEmail: 1 }, { unique: true });

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);

