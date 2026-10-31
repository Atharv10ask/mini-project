
import { useState } from "react";
import axios from "axios";
import "./IndustryRequirements.css";

function IndustryRequirements() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("Industry Requirement");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([
    { skillName: "", level: "Beginner" }
  ]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateSkill(index, field, value) {
    setSkills((current) =>
      current.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    );
  }

  function addSkill() {
    setSkills((current) => [
      ...current,
      { skillName: "", level: "Beginner" }
    ]);
  }

  function removeSkill(index) {
    setSkills((current) => current.filter((_, i) => i !== index));
  }

  async function submitRequirement(event) {
    event.preventDefault();
    setMessage("");

    const cleanedSkills = skills.map((skill) => ({
      skillName: skill.skillName.trim(),
      level: skill.level
    }));

    if (cleanedSkills.some((skill) => !skill.skillName)) {
      setMessage("Please enter a name for every skill.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/skill-requirements",
        {
          title: title.trim(),
          company: company.trim(),
          type,
          description: description.trim(),
          skills: cleanedSkills
        }
      );

      setMessage(response.data.message || "Requirements saved successfully!");
      setTitle("");
      setCompany("");
      setType("Industry Requirement");
      setDescription("");
      setSkills([{ skillName: "", level: "Beginner" }]);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to save. Check whether the backend is running."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="industry-page">
      <div className="industry-container">
        <header className="industry-heading">
          <h1>Add Industry Requirements</h1>
          <p>
            Define the skills required for jobs, internships, and industry
            roles to help students identify skill gaps.
          </p>
        </header>

        <section className="industry-card">
          <form onSubmit={submitRequirement} className="industry-form">
            <label htmlFor="job-title">Job or internship title</label>
            <input
              id="job-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Full Stack Developer"
              minLength={2}
              required
            />

            <label htmlFor="company-name">Company name</label>
            <input
              id="company-name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="ABC Technologies"
              minLength={2}
              required
            />

            <label htmlFor="requirement-type">Requirement type</label>
            <select
              id="requirement-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Job">Job</option>
              <option value="Internship">Internship</option>
              <option value="Industry Requirement">
                Industry Requirement
              </option>
            </select>

            <label htmlFor="requirement-description">Description</label>
            <textarea
              id="requirement-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role or required experience"
              rows={3}
            />

            <h3 className="industry-section-title">Required Skills</h3>

            {skills.map((skill, index) => (
              <div key={index} className="industry-skill-row">
                <input
                  value={skill.skillName}
                  onChange={(e) =>
                    updateSkill(index, "skillName", e.target.value)
                  }
                  placeholder="e.g. React"
                  aria-label={`Skill name ${index + 1}`}
                  required
                />

                <select
                  value={skill.level}
                  onChange={(e) =>
                    updateSkill(index, "level", e.target.value)
                  }
                  aria-label={`Skill level ${index + 1}`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                {skills.length > 1 && (
                  <button
                    className="industry-button industry-button-remove"
                    type="button"
                    onClick={() => removeSkill(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              className="industry-button industry-button-secondary"
              type="button"
              onClick={addSkill}
            >
              + Add another skill
            </button>

            <button
              className="industry-button industry-button-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Requirements"}
            </button>

            {message && (
              <p
                className={`industry-message ${
                  /unable|please|error|failed/i.test(message)
                    ? "industry-message-error"
                    : ""
                }`}
                role="status"
              >
                {message}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

export default IndustryRequirements;
