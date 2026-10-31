
const { z } = require("zod");

const careerPlanValidation = z.object({
  studentEmail: z.string().email(),
  careerGoal: z.string().trim().min(3),
  targetRole: z.string().trim().min(2),
  duration: z.string().min(1),

  activities: z.array(
    z.object({
      title: z.string().trim().min(2),
      category: z.enum([
        "Technical Training",
        "Soft Skills",
        "Project Development",
        "Resume Preparation",
        "Interview Preparation",
        "Certification"
      ]),
      description: z.string().optional().default(""),
      dueDate: z.string().min(1)
        .refine(value => !isNaN(Date.parse(value)), {
          message: "Invalid due date"
        })
    })
  ).min(1)
});

const activityUpdateValidation = z.object({
  status: z.enum(["Pending", "In Progress", "Completed"]),
  progress: z.number().min(0).max(100)
});

module.exports = {
  careerPlanValidation,
  activityUpdateValidation
};
