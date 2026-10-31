
import { useEffect, useState } from "react";
import "./CareerDevelopment.css";

const API = "http://localhost:3000/career-development";

const categories = [
  "Technical Training",
  "Soft Skills",
  "Project Development",
  "Resume Preparation",
  "Interview Preparation",
  "Certification"
];

function CareerDevelopment() {
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [duration, setDuration] = useState("3 Months");

  const [activities, setActivities] = useState([
    {
      title: "",
      category: "Technical Training",
      description: "",
      dueDate: ""
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch students and career plans
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentResponse, planResponse] = await Promise.all([
        fetch(`${API}/students`),
        fetch(`${API}/plans`)
      ]);

      if (!studentResponse.ok || !planResponse.ok) {
        throw new Error("Unable to load career development data.");
      }

      const studentData = await studentResponse.json();
      const planData = await planResponse.json();

      setStudents(studentData);
      setPlans(planData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Select a student
  const handleStudentChange = (email) => {
    setSelectedStudent(email);

    const student = students.find(
      (item) => item.email === email
    );

    if (student) {
      setCareerGoal(student.careerGoal || "");
      setTargetRole("");
    }
  };

  // Add activity
  const addActivity = () => {
    setActivities([
      ...activities,
      {
        title: "",
        category: "Technical Training",
        description: "",
        dueDate: ""
      }
    ]);
  };

  // Remove activity
  const removeActivity = (index) => {
    setActivities(
      activities.filter((_, i) => i !== index)
    );
  };

  // Update activity field
  const updateActivity = (index, field, value) => {
    setActivities((previous) =>
      previous.map((activity, i) =>
        i === index
          ? { ...activity, [field]: value }
          : activity
      )
    );
  };

  // Create career plan
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }

    if (!targetRole.trim()) {
      setError("Please enter a target career role.");
      return;
    }

    if (activities.some(
      (activity) =>
        !activity.title.trim() || !activity.dueDate
    )) {
      setError("Please complete all activity titles and deadlines.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API}/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentEmail: selectedStudent,
          careerGoal,
          targetRole,
          duration,
          activities
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create career plan."
        );
      }

      setMessage("Career development plan created successfully!");

      setSelectedStudent("");
      setCareerGoal("");
      setTargetRole("");
      setDuration("3 Months");

      setActivities([
        {
          title: "",
          category: "Technical Training",
          description: "",
          dueDate: ""
        }
      ]);

      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update activity progress
  const updateProgress = async (
    planId,
    activityId,
    status,
    progress
  ) => {
    try {
      const response = await fetch(
        `${API}/plans/${planId}/activities/${activityId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status,
            progress
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update progress."
        );
      }

      setMessage("Student progress updated successfully!");
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate average progress
  const getProgress = (plan) => {
    if (!plan.activities?.length) return 0;

    const total = plan.activities.reduce(
      (sum, activity) => sum + activity.progress,
      0
    );

    return Math.round(total / plan.activities.length);
  };

  const totalActivities = plans.reduce(
    (sum, plan) => sum + plan.activities.length,
    0
  );

  const completedActivities = plans.reduce(
    (sum, plan) =>
      sum + plan.activities.filter(
        (activity) => activity.status === "Completed"
      ).length,
    0
  );

  const averageProgress = plans.length
    ? Math.round(
        plans.reduce((sum, plan) => sum + getProgress(plan), 0) /
        plans.length
      )
    : 0;

  if (loading) {
    return (
      <div className="career-loading">
        Loading career development data...
      </div>
    );
  }

  return (
    <div className="career-development">

      {/* Header */}
      <div className="career-header">
        <div>
          <h1>Student Career Development</h1>
          <p>
            Guide students towards their career goals through
            personalized learning plans and progress tracking.
          </p>
        </div>

        <button
          className="career-refresh"
          onClick={fetchData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="career-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="career-alert success">
          {message}
        </div>
      )}

      {/* Statistics */}
      <div className="career-stats">

        <div className="career-stat-card">
          <span className="stat-icon blue">♙</span>
          <div>
            <h2>{students.length}</h2>
            <p>Registered Students</p>
          </div>
        </div>

        <div className="career-stat-card">
          <span className="stat-icon purple">▤</span>
          <div>
            <h2>{plans.length}</h2>
            <p>Career Plans</p>
          </div>
        </div>

        <div className="career-stat-card">
          <span className="stat-icon green">✓</span>
          <div>
            <h2>{completedActivities}/{totalActivities}</h2>
            <p>Completed Activities</p>
          </div>
        </div>

        <div className="career-stat-card">
          <span className="stat-icon orange">◷</span>
          <div>
            <h2>{averageProgress}%</h2>
            <p>Average Progress</p>
          </div>
        </div>

      </div>

      {/* Create Career Plan */}
      <div className="career-form-card">

        <div className="career-section-heading">
          <div>
            <h2>Create Career Development Plan</h2>
            <p>
              Assign personalized development activities to students.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="career-form-grid">

            <div className="career-field">
              <label>Select Student *</label>

              <select
                value={selectedStudent}
                onChange={(e) =>
                  handleStudentChange(e.target.value)
                }
                required
              >
                <option value="">Choose a student</option>

                {students.map((student) => (
                  <option
                    key={student._id}
                    value={student.email}
                  >
                    {student.fullName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="career-field">
              <label>Target Career Role *</label>

              <input
                type="text"
                placeholder="e.g. Full Stack Developer"
                value={targetRole}
                onChange={(e) =>
                  setTargetRole(e.target.value)
                }
                required
              />
            </div>

            <div className="career-field">
              <label>Career Goal</label>

              <input
                type="text"
                value={careerGoal}
                onChange={(e) =>
                  setCareerGoal(e.target.value)
                }
                placeholder="Student's career goal"
              />
            </div>

            <div className="career-field">
              <label>Development Duration *</label>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
              >
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
                <option>12 Months</option>
              </select>
            </div>

          </div>

          {/* Activities */}
          <div className="career-activities-heading">
            <div>
              <h3>Development Activities</h3>
              <p>Add learning activities for this student.</p>
            </div>

            <button
              type="button"
              className="career-add-button"
              onClick={addActivity}
            >
              + Add Activity
            </button>
          </div>

          {activities.map((activity, index) => (
            <div className="career-activity-box" key={index}>

              <div className="career-activity-top">
                <h4>Activity {index + 1}</h4>

                {activities.length > 1 && (
                  <button
                    type="button"
                    className="career-remove-button"
                    onClick={() => removeActivity(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="career-form-grid">

                <div className="career-field">
                  <label>Activity Title *</label>

                  <input
                    type="text"
                    placeholder="e.g. Complete React.js training"
                    value={activity.title}
                    onChange={(e) =>
                      updateActivity(index, "title", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="career-field">
                  <label>Category *</label>

                  <select
                    value={activity.category}
                    onChange={(e) =>
                      updateActivity(index, "category", e.target.value)
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="career-field">
                  <label>Description</label>

                  <input
                    type="text"
                    placeholder="Activity details"
                    value={activity.description}
                    onChange={(e) =>
                      updateActivity(index, "description", e.target.value)
                    }
                  />
                </div>

                <div className="career-field">
                  <label>Deadline *</label>

                  <input
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={activity.dueDate}
                    onChange={(e) =>
                      updateActivity(index, "dueDate", e.target.value)
                    }
                    required
                  />
                </div>

              </div>
            </div>
          ))}

          <div className="career-form-footer">
            <button
              type="submit"
              className="career-submit-button"
              disabled={saving || students.length === 0}
            >
              {saving ? "Saving..." : "Create Career Plan"}
            </button>
          </div>

        </form>
      </div>

      {/* Saved Career Plans */}
      <div className="career-plans-section">

        <div className="career-section-heading">
          <div>
            <h2>Student Career Plans</h2>
            <p>Monitor development activities and student progress.</p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="career-empty">
            <h3>No career plans yet</h3>
            <p>Create a career development plan to get started.</p>
          </div>
        ) : (
          <div className="career-plans-grid">

            {plans.map((plan) => (
              <div className="career-plan-card" key={plan._id}>

                <div className="career-plan-header">
                  <div>
                    <h3>{plan.studentName}</h3>
                    <p>{plan.studentEmail}</p>
                  </div>

                  <span className="career-plan-duration">
                    {plan.duration}
                  </span>
                </div>

                <div className="career-plan-info">
                  <p>
                    <strong>Career Goal:</strong>{" "}
                    {plan.careerGoal}
                  </p>

                  <p>
                    <strong>Target Role:</strong>{" "}
                    {plan.targetRole}
                  </p>
                </div>

                <div className="career-progress-info">
                  <span>Overall Progress</span>
                  <strong>{getProgress(plan)}%</strong>
                </div>

                <div className="career-progress-track">
                  <div
                    className="career-progress-fill"
                    style={{
                      width: `${getProgress(plan)}%`
                    }}
                  />
                </div>

                <h4 className="career-activity-list-title">
                  Development Activities
                </h4>

                {plan.activities.map((activity) => (
                  <div
                    className="career-saved-activity"
                    key={activity._id}
                  >

                    <div className="saved-activity-info">
                      <h4>{activity.title}</h4>
                      <p>{activity.category}</p>
                      <small>
                        Deadline:{" "}
                        {new Date(activity.dueDate).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="saved-activity-controls">
                      <select
                        value={activity.status}
                        onChange={(e) => {
                          const status = e.target.value;

                          updateProgress(
                            plan._id,
                            activity._id,
                            status,
                            status === "Completed"
                              ? 100
                              : status === "Pending"
                                ? 0
                                : activity.progress
                          );
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <span>{activity.progress}%</span>
                    </div>

                  </div>
                ))}

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default CareerDevelopment;
