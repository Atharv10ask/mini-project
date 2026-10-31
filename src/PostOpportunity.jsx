
import { useState } from "react";
import "./PostOpportunity.css";

const API_URL = "http://localhost:3000/opportunities";

function PostOpportunity() {
  const [formData, setFormData] = useState({
    title: "",
    type: "Internship",
    companyEmail: "",
    location: "",
    workMode: "On-site",
    description: "",
    eligibility: "",
    openings: "1",
    compensation: "",
    deadline: ""
  });

  const [requiredSkills, setRequiredSkills] = useState([
    { skillName: "", level: "Beginner" }
  ]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function handleSkillChange(index, field, value) {
    setRequiredSkills((previous) =>
      previous.map((skill, i) =>
        i === index
          ? { ...skill, [field]: value }
          : skill
      )
    );
  }

  function addSkill() {
    setRequiredSkills((previous) => [
      ...previous,
      { skillName: "", level: "Beginner" }
    ]);
  }

  function removeSkill(index) {
    if (requiredSkills.length === 1) {
      setMessage("At least one required skill is necessary.");
      setMessageType("error");
      return;
    }

    setRequiredSkills((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const cleanedSkills = requiredSkills
      .filter((skill) => skill.skillName.trim())
      .map((skill) => ({
        skillName: skill.skillName.trim(),
        level: skill.level
      }));

    if (cleanedSkills.length === 0) {
      setMessage("Please add at least one required skill.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      companyEmail: formData.companyEmail.trim().toLowerCase(),
      openings: Number(formData.openings),
      requiredSkills: cleanedSkills
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to publish opportunity.");
        setMessageType("error");
        return;
      }

      setMessage("Opportunity published successfully!");
      setMessageType("success");

      setFormData((previous) => ({
        ...previous,
        title: "",
        type: "Internship",
        location: "",
        workMode: "On-site",
        description: "",
        eligibility: "",
        openings: "1",
        compensation: "",
        deadline: ""
      }));

      setRequiredSkills([
        { skillName: "", level: "Beginner" }
      ]);
    } catch (error) {
      setMessage(
        "Cannot connect to the backend. Please check whether your server is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="post-opportunity-page">
      <div className="post-opportunity-container">

        <header className="post-opportunity-header">
          <div>
            <span className="post-opportunity-eyebrow">
              INDUSTRY DASHBOARD
            </span>

            <h1>Post an Opportunity</h1>

            <p>
              Share internship and job opportunities with students
              and connect with emerging talent.
            </p>
          </div>
        </header>

        <form
          className="post-opportunity-form"
          onSubmit={handleSubmit}
        >

          {/* Opportunity Details */}
          <section className="opportunity-section">
            <div className="opportunity-section-heading">
              <span className="opportunity-section-number">01</span>
              <div>
                <h2>Opportunity Details</h2>
                <p>Enter the basic information about the opening.</p>
              </div>
            </div>

            <div className="opportunity-grid">

              <div className="opportunity-field full-width">
                <label>Opportunity Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. React Developer Intern"
                  required
                />
              </div>

              <div className="opportunity-field">
                <label>Opportunity Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Internship">Internship</option>
                  <option value="Job">Full-time Job</option>
                </select>
              </div>

              <div className="opportunity-field">
                <label>Company Email *</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="Enter registered company email"
                  required
                />
                <small>
                  Use the same email registered in your Company Profile.
                </small>
              </div>

              <div className="opportunity-field">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Pune, Maharashtra"
                  required
                />
              </div>

              <div className="opportunity-field">
                <label>Work Mode *</label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  required
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

            </div>
          </section>

          {/* Description */}
          <section className="opportunity-section">
            <div className="opportunity-section-heading">
              <span className="opportunity-section-number">02</span>
              <div>
                <h2>Description and Eligibility</h2>
                <p>Explain the role and who can apply.</p>
              </div>
            </div>

            <div className="opportunity-field">
              <label>Opportunity Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe responsibilities, projects, expectations and learning opportunities..."
                rows="5"
                required
              />
            </div>

            <div className="opportunity-field">
              <label>Eligibility Criteria *</label>
              <textarea
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="e.g. B.E./B.Tech students, CSE/IT branch, basic programming knowledge..."
                rows="3"
                required
              />
            </div>
          </section>

          {/* Required Skills */}
          <section className="opportunity-section">
            <div className="opportunity-section-heading">
              <span className="opportunity-section-number">03</span>
              <div>
                <h2>Required Skills</h2>
                <p>
                  Add the skills students should have for this opportunity.
                </p>
              </div>
            </div>

            <div className="opportunity-skills-list">
              {requiredSkills.map((skill, index) => (
                <div className="opportunity-skill-row" key={index}>
                  <div className="opportunity-field">
                    <label>Skill Name *</label>
                    <input
                      type="text"
                      value={skill.skillName}
                      onChange={(event) =>
                        handleSkillChange(
                          index,
                          "skillName",
                          event.target.value
                        )
                      }
                      placeholder="e.g. React.js"
                      required
                    />
                  </div>

                  <div className="opportunity-field">
                    <label>Required Level *</label>
                    <select
                      value={skill.level}
                      onChange={(event) =>
                        handleSkillChange(
                          index,
                          "level",
                          event.target.value
                        )
                      }
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="opportunity-remove-skill"
                    onClick={() => removeSkill(index)}
                    aria-label={`Remove skill ${index + 1}`}
                    title="Remove skill"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="opportunity-add-skill"
              onClick={addSkill}
            >
              + Add Another Skill
            </button>
          </section>

          {/* Additional Information */}
          <section className="opportunity-section">
            <div className="opportunity-section-heading">
              <span className="opportunity-section-number">04</span>
              <div>
                <h2>Additional Information</h2>
                <p>Provide opening details and application deadline.</p>
              </div>
            </div>

            <div className="opportunity-grid">

              <div className="opportunity-field">
                <label>Number of Openings *</label>
                <input
                  type="number"
                  name="openings"
                  value={formData.openings}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="opportunity-field">
                <label>Stipend / Salary</label>
                <input
                  type="text"
                  name="compensation"
                  value={formData.compensation}
                  onChange={handleChange}
                  placeholder="e.g. ₹15,000/month or ₹5 LPA"
                />
              </div>

              <div className="opportunity-field">
                <label>Application Deadline *</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                />
              </div>

            </div>
          </section>

          {/* Message */}
          {message && (
            <div
              className={`opportunity-message ${messageType}`}
              role="status"
            >
              {message}
            </div>
          )}

          {/* Submit */}
          <div className="opportunity-form-actions">
            <button
              type="submit"
              className="opportunity-publish-btn"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Opportunity"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PostOpportunity;
