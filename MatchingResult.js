const mongoose = require("mongoose");

const matchingResultSchema = new mongoose.Schema(
    {
        studentEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        opportunityId: {
            type: String,
            required: true,
            index: true
        },
        opportunityTitle: {
            type: String,
            default: ""
        },
        companyName: {
            type: String,
            default: ""
        },
        matchPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        matchedSkills: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        missingSkills: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        proficiencyGaps: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        calculatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

matchingResultSchema.index({ studentEmail: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.models.MatchingResult || mongoose.model("MatchingResult", matchingResultSchema);

