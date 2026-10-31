
const express = require("express");
const cors = require("cors");
const app = express();

const { signupSchema } = require("./validation");
const { data } = require("./data");

app.use(cors());
app.use(express.json());

app.post("/signup", async function (req, res) {
    console.log(req.body);

    const parsedpayload = signupSchema.safeParse(req.body);

    if (!parsedpayload.success) {
        return res.status(400).json({
            message: "Invalid registration details.",
            errors: parsedpayload.error.issues
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
    } = parsedpayload.data;

    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Passwords do not match."
        });
    }

    try {
        const user = await data.create({
            username,
            email,
            password,
            role,
            institution,
            department,
            course,
            company,
            designation
        });

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});

app.post("/login", async function (req, res) {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Please enter all login details."
        });
    }

    if (!["Student", "University", "Industry"].includes(role)) {
        return res.status(400).json({
            message: "Invalid account type."
        });
    }

    try {
        const user = await data.findOne({
            email,
            password,
            role
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email, password, or account type."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error. Please try again."
        });
    }
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
