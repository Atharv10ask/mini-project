const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        location: {
            type: String,
            default: ""
        },
        contactPerson: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        departments: {
            type: [String],
            default: []
        },
        establishedYear: {
            type: Number
        },
        description: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.University || mongoose.model("University", universitySchema);

