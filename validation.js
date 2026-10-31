
const zod = require("zod");

const signupSchema = zod.object({
    username: zod.string().trim().min(3, "Name must contain at least 3 characters."),
    email: zod.string().trim().email("Enter a valid email address."),
    password: zod.string().min(6, "Password must contain at least 6 characters."),
    confirmPassword: zod.string(),
    role: zod.enum(["Student", "University", "Industry"]),

    institution: zod.string().optional(),
    department: zod.string().optional(),
    course: zod.string().optional(),
    company: zod.string().optional(),
    designation: zod.string().optional()
});

module.exports = {
    signupSchema
};
