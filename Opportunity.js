
const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
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

    type: {
        type: String,
        default: "Internship"
    },

    location: {
        type: String,
        default: "Not specified"
    },

    workMode: {
        type: String,
        default: "Not specified"
    },

    description: {
        type: String,
        default: ""
    },

    requiredSkills: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
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

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Opportunity", opportunitySchema);
