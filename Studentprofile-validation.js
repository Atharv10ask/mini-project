
const { z } = require("zod");

const skillSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Skill name is required")
    .max(50, "Skill name is too long"),

  level: z.enum(["Beginner", "Intermediate", "Advanced"])
});

const optionalUrl = z.union([
  z.string().trim().url("Enter a valid URL"),
  z.literal("")
]).optional().default("");

const studentProfileSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100),

  email: z.string()
    .trim()
    .email("Enter a valid email address")
    .transform((email) => email.toLowerCase()),

  phone: z.string()
    .trim()
    .regex(/^$|^\+?[0-9]{10,15}$/, "Enter a valid phone number")
    .optional()
    .default(""),

  college: z.string()
    .trim()
    .min(2, "College name is required")
    .max(150),

  degree: z.enum([
    "B.Tech", "B.E.", "BCA", "B.Sc",
    "M.Tech", "MCA", "Other"
  ]),

  branch: z.string()
    .trim()
    .min(2, "Branch is required")
    .max(100),

graduationYear: z.number()
  .int("Graduation year must be a whole number")
  .min(2000, "Graduation year must be 2000 or later")
  .max(
    new Date().getFullYear() + 8,
    "Graduation year is outside the allowed range"
  ),

  careerGoal: z.string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  skills: z.array(skillSchema)
    .min(1, "Add at least one skill")
    .max(30, "You can add up to 30 skills")
    .refine(
      (skills) =>
        new Set(skills.map((s) => s.name.toLowerCase())).size === skills.length,
      "Duplicate skills are not allowed"
    ),

  github: optionalUrl,
  linkedin: optionalUrl
});

module.exports = studentProfileSchema;
