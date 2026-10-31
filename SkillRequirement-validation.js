
const { z } = require("zod");

const skillRequirementValidation = z.object({
  title: z.string().trim().min(2, "Enter a valid title"),

  company: z.string().trim().min(2, "Enter a company name"),

  type: z.enum([
    "Job",
    "Internship",
    "Industry Requirement"
  ]),

  skills: z.array(
    z.object({
      skillName: z.string().trim().min(1, "Skill name is required"),

      level: z.enum([
        "Beginner",
        "Intermediate",
        "Advanced"
      ])
    })
  ).min(1, "Add at least one required skill"),

  description: z.string().optional().default("")
});

module.exports = skillRequirementValidation;
