const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================================
// MIDDLEWARE
// ======================================
app.use(cors());
app.use(express.json());

// ======================================
// ROUTE IMPORTS
// ======================================
const authRoute = require("./authRoute");
const studentProfileRoute = require("./studentProfileRoute");
const opportunityRoute = require("./opportunityRoute");
const applicationRoute = require("./applicationRoute");
const companyProfileRoute = require("./companyProfileRoute");
const universityRoute = require("./usityroute");
const candidateRoute = require("./candidateRoute");
const skillMatchingRoute = require("./skillMatchingRoute");
const careerDevelopmentRoute = require("./careerDevelopmentRoute");
const notificationRoute = require("./Notificationroutr");
const adminRoute = require("./adminRoute");
const { User } = require("./data");

// ======================================
// MOUNT ROUTES
// ======================================

// 1. Authentication & Role-Based Access
app.use("/", authRoute);

// 2. Profile Management
app.use("/student-profile", studentProfileRoute);
app.use("/student-profiles", studentProfileRoute);
app.use("/company-profile", companyProfileRoute);
app.use("/company-profiles", companyProfileRoute);

// 3. Opportunity Management
app.use("/opportunities", opportunityRoute);
app.use("/applications", applicationRoute);

// 4. University & Career Development
app.use("/university", universityRoute);
app.use("/career-development", careerDevelopmentRoute);

// 5. Skill Matching & Requirements
app.use("/", skillMatchingRoute);
app.use("/", candidateRoute);

// 6. Notifications
app.use("/notifications", notificationRoute);

// 7. Administrator
app.use("/admin", adminRoute);

// Health check route
app.get("/", (req, res) => {
    res.json({
        message: "Academia-Industry Collaboration Portal Backend is Running",
        version: "1.0.0",
        database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        endpoints: [
            "/signup",
            "/login",
            "/student-profile",
            "/company-profile",
            "/opportunities",
            "/applications",
            "/university/students",
            "/career-development/plans",
            "/candidate-matches",
            "/skill-requirements",
            "/skill-gap/:email/:requirementId",
            "/notifications",
            "/admin/dashboard"
        ]
    });
});

// Central Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        message: err.message || "An unexpected internal server error occurred."
    });
});

// ======================================
// SEED DEFAULT ADMIN IF MISSING
// ======================================
async function seedDefaultAdmin() {
    try {
        const adminEmail = "admin@academia.edu";
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                username: "System Administrator",
                email: adminEmail,
                password: "admin123", // hashed via pre-save hook in User model
                role: "Admin",
                institution: "Platform Administration",
                department: "Headquarters"
            });
            console.log(`Default administrator seeded: ${adminEmail} / admin123`);
        }
    } catch (err) {
        console.error("Error checking/seeding default admin:", err.message);
    }
}

// ======================================
// SERVER & DATABASE STARTUP
// ======================================
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/academia_industry_portal";

mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected Successfully to:", MONGO_URI);
        await seedDefaultAdmin();

        app.listen(PORT, () => {
            console.log(`Academia-Industry Portal Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

module.exports = app;

