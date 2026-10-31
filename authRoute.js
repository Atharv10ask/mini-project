const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { signupSchema } = require("./validation");
const { User } = require("./data");
const StudentProfile = require("./Studentprofile");
const CompanyProfile = require("./companyprofile");
const University = require("./University");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_sih26044_2026";

function generateToken(user) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// POST /signup
router.post("/signup", async function (req, res) {
    try {
        const parsedPayload = signupSchema.safeParse(req.body);

        if (!parsedPayload.success) {
            const firstIssue = parsedPayload.error.issues?.[0];
            const errorMessage = firstIssue ? firstIssue.message : "Invalid registration details.";
            return res.status(400).json({
                message: errorMessage,
                errors: parsedPayload.error.issues
            });
        }

        const {
            username,
            email,
            password,
            confirmPassword,
            role,
            institution,
            department,
            course,
            company,
            designation
        } = parsedPayload.data;

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        const user = await User.create({
            username: username.trim(),
            email: normalizedEmail,
            password,
            role,
            institution: institution || "",
            department: department || "",
            course: course || "",
            company: company || "",
            designation: designation || ""
        });

        // Initialize related profile records based on role
        if (role === "Industry") {
            const companyName = company || username.trim();
            const existingCompany = await CompanyProfile.findOne({ email: normalizedEmail });
            if (!existingCompany) {
                await CompanyProfile.create({
                    companyName,
                    email: normalizedEmail,
                    industryType: "Technology",
                    companySize: "10-50",
                    establishedYear: new Date().getFullYear(),
                    phone: "N/A",
                    location: "Not specified",
                    description: `Profile for ${companyName}`
                }).catch(err => console.error("Auto company profile create error:", err));
            }
        } else if (role === "University") {
            const universityName = institution || username.trim();
            const existingUniv = await University.findOne({ email: normalizedEmail });
            if (!existingUniv) {
                await University.create({
                    name: universityName,
                    email: normalizedEmail,
                    location: "Not specified",
                    contactPerson: username.trim(),
                    departments: department ? [department] : []
                }).catch(err => console.error("Auto university profile create error:", err));
            }
        }

        const token = generateToken(user);

        return res.status(201).json({
            message: "Registration successful!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                company: user.company,
                institution: user.institution,
                department: user.department
            }
        });
    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        return res.status(500).json({
            message: "Registration failed. Please try again.",
            error: error.message
        });
    }
});

// POST /login
router.post("/login", async function (req, res) {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Please enter all login details."
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "No account found with this email."
            });
        }

        // Verify role
        if (user.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(401).json({
                message: `Account role is ${user.role}, but tried to sign in as ${role}.`
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password."
            });
        }

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                company: user.company,
                institution: user.institution,
                department: user.department
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Server error during login. Please try again.",
            error: error.message
        });
    }
});

// GET /me (Verify token)
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No authentication token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;

