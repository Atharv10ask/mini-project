const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
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
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["Student", "University", "Industry", "Admin"],
            required: true
        },
        institution: {
            type: String,
            default: ""
        },
        department: {
            type: String,
            default: ""
        },
        course: {
            type: String,
            default: ""
        },
        company: {
            type: String,
            default: ""
        },
        designation: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    // Support bcrypt comparison
    if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$") || this.password.startsWith("$2y$")) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
    // Fallback if plain text
    return this.password === candidatePassword;
};

const User = mongoose.models.User || mongoose.models.signups || mongoose.model("signups", userSchema);

module.exports = {
    data: User,
    User
};
