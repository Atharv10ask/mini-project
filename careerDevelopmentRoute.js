
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const StudentProfile = require("./Studentprofile");
const CareerPlan = require("./CareerPlan");

const {
  careerPlanValidation,
  activityUpdateValidation
} = require("./careerDevelopmentValidation");

// 1. Get all registered students
router.get("/students", async (req, res) => {
  const students = await StudentProfile.find()
    .select("fullName email college degree branch graduationYear careerGoal skills")
    .sort({ fullName: 1 });

  res.status(200).json(students);
});

// 2. Create a career development plan
router.post("/plans", async (req, res) => {
  const result = careerPlanValidation.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid career plan information",
      errors: result.error.issues
    });
  }

  const student = await StudentProfile.findOne({
    email: result.data.studentEmail.toLowerCase()
  });

  if (!student) {
    return res.status(404).json({
      message: "Student profile not found"
    });
  }

  const careerPlan = await CareerPlan.create({
    ...result.data,
    studentEmail: student.email.toLowerCase(),
    studentName: student.fullName,
    activities: result.data.activities.map(activity => ({
      ...activity,
      dueDate: new Date(activity.dueDate)
    }))
  });

  res.status(201).json({
    message: "Career development plan created successfully",
    careerPlan
  });
});

// 3. Get all career development plans
router.get("/plans", async (req, res) => {
  const filter = {};

  if (req.query.studentEmail) {
    filter.studentEmail = req.query.studentEmail.toLowerCase();
  }

  const plans = await CareerPlan.find(filter)
    .sort({ createdAt: -1 });

  res.status(200).json(plans);
});

// 4. Update activity progress
router.patch(
  "/plans/:planId/activities/:activityId",
  async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.planId)) {
      return res.status(400).json({
        message: "Invalid career plan ID"
      });
    }

    const result = activityUpdateValidation.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid activity information",
        errors: result.error.issues
      });
    }

    const plan = await CareerPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({
        message: "Career plan not found"
      });
    }

    const activity = plan.activities.id(req.params.activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found"
      });
    }

    activity.status = result.data.status;
    activity.progress =
      result.data.status === "Completed"
        ? 100
        : result.data.progress;

    await plan.save();

    res.status(200).json({
      message: "Student progress updated successfully",
      careerPlan: plan
    });
  }
);

module.exports = router;
