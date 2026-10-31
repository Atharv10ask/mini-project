const zod = require("zod");

const signupSchema = zod.object({
    username: zod.string().trim().min(2, "Name must contain at least 2 characters."),
    email: zod.string().trim().email("Enter a valid email address."),
    password: zod.string().min(4, "Password must contain at least 4 characters."),
    confirmPassword: zod.string().min(1, "Please re-enter your password in Confirm Password."),
    role: zod.preprocess(
        (val) => {
            if (typeof val === "string") {
                const lower = val.trim().toLowerCase();
                if (lower === "student") return "Student";
                if (lower === "university") return "University";
                if (lower === "industry") return "Industry";
                if (lower === "admin") return "Admin";
            }
            return val;
        },
        zod.enum(["Student", "University", "Industry", "Admin"])
    ),

    institution: zod.string().optional().default(""),
    department: zod.string().optional().default(""),
    course: zod.string().optional().default(""),
    company: zod.string().optional().default(""),
    designation: zod.string().optional().default("")
});

module.exports = {
    signupSchema
};
