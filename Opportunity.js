const mongoose = require("mongoose");

const requiredSkillSchema = new mongoose.Schema(
    {
        skillName: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        }
    },
    { _id: false }
);

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        companyName: {
            type: String,
            required: true,
            trim: true
        },
        companyEmail: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
            index: true
        },
        type: {
            type: String,
            enum: ["Internship", "Job"],
            default: "Internship"
        },
        domain: {
            type: String,
            default: "Technology"
        },
        location: {
            type: String,
            default: "Not specified"
        },
        workMode: {
            type: String,
            enum: ["On-site", "Remote", "Hybrid"],
            default: "On-site"
        },
        description: {
            type: String,
            default: ""
        },
        requiredSkills: {
            type: [requiredSkillSchema],
            default: []
        },
        eligibility: {
            type: String,
            default: "All eligible students"
        },
        compensation: {
            type: String,
            default: "Not specified"
        },
        openings: {
            type: Number,
            default: 1
        },
        deadline: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["Open", "Closed"],
            default: "Open"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.Opportunity || mongoose.model("Opportunity", opportunitySchema);
