
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/Registration")
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log("MongoDB connection error:", error));

const create = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Student", "University", "Industry"],
        required: true
    },
    institution: String,
    department: String,
    course: String,
    company: String,
    designation: String
});

const data = mongoose.model("signups", create);

module.exports = {
    data
};
