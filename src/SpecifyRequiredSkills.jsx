
import { useEffect, useState } from "react";
import "./SpecifyRequiredSkills.css";

const API = "http://localhost:3000";

function SpecifyRequiredSkills() {
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState("Beginner");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const email = localStorage.getItem("email");

    if (!email) {
      setError("Company email not found. Please log in again.");
      setLoading(false);
      return;
    }

    setCompanyEmail(email);

    try {
      const profileResponse = await fetch(
        `${API}/company-profile?email=${encodeURIComponent(email)}`
      );

      if (!profileResponse.ok) {
        throw new Error("Could not load company profile.");
      }

      const profileData = await profileResponse.json();
      const profile = profileData.company || profileData.profile || profileData;

      const name =
        profile.companyName ||
        profile.company ||
        profile.name ||
        "";

      setCompanyName(name);

      const opportunityResponse = await fetch(`${API}/opportunities`);

      if (!opportunityResponse.ok) {
        throw new Error("Could not load opportunities.");
      }

      const opportunityData = await opportunityResponse.json();

      const allOpportunities = Array.isArray(opportunityData)
        ? opportunityData
        : opportunityData.opportunities || opportunityData.data || [];

      const myOpportunities = allOpportunities.filter((item) => {
        if (item.companyEmail) {
          return item.companyEmail.toLowerCase() === email.toLowerCase();
        }

        return (
          name &&
          (item.companyName || item.company || "").toLowerCase() ===
            name.toLowerCase()
        );
      });

      setOpportunities(myOpportunities);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpportunityChange(event) {
    const opportunityId = event.target.value;
    setSelectedOpportunity(opportunityId);
    setMessage("");
    setError("");

    const opportunity = opportunities.find(
      (item) => String(item._id || item.id) === opportunityId
    );

    const existingSkills =
      opportunity?.requiredSkills || opportunity?.skills || [];

    setSkills(
      existingSkills.map((skill) => ({
        skillName: skill.skillName || skill.name || "",
        level: skill.level || "Beginner",
      }))
    );
  }

  function addSkill() {
    const skillName = newSkill.trim();

    if (!skillName) {
      setError("Please enter a skill name.");
      return;
    }

    const alreadyExists = skills.some(
      (skill) =>
        skill.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (alreadyExists) {
      setError("This skill has already been added.");
      return;
    }

    setSkills([
      ...skills,
      {
        skillName,
        level: newLevel,
      },
    ]);

    setNewSkill("");
    setNewLevel("Beginner");
    setError("");
    setMessage("");
  }

  function updateSkillLevel(index, level) {
    setSkills((previousSkills) =>
      previousSkills.map((skill, i) =>
        i === index ? { ...skill, level } : skill
      )
    );
  }

  function removeSkill(index) {
    setSkills((previousSkills) =>
      previousSkills.filter((_, i) => i !== index)
    );
  }

  async function saveSkills() {
    setError("");
    setMessage("");

    if (!selectedOpportunity) {
      setError("Please select an opportunity.");
      return;
    }

    if (skills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API}/opportunities/${selectedOpportunity}/required-skills`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyEmail,
            requiredSkills: skills,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to save skills.");
      }

      setMessage("Required skills saved successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="required-skills-page">
        <div className="required-skills-card">
          <p>Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="required-skills-page">
      <div className="required-skills-container">
        <div className="required-skills-header">
          <div>
            <h1>Specify Required Skills</h1>
            <p>
              Add the skills and proficiency levels required for your
              opportunities.
            </p>
          </div>
        </div>

        <div className="required-skills-card">
          <h2>Company Information</h2>

          <div className="required-skills-company">
            <div>
              <span>Company</span>
              <strong>{companyName || "Company profile"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{companyEmail}</strong>
            </div>
          </div>

          <div className="required-skills-field">
            <label htmlFor="opportunity">Select Opportunity</label>

            <select
              id="opportunity"
              value={selectedOpportunity}
              onChange={handleOpportunityChange}
            >
              <option value="">-- Select an opportunity --</option>

              {opportunities.map((opportunity) => (
                <option
                  key={opportunity._id || opportunity.id}
                  value={opportunity._id || opportunity.id}
                >
                  {opportunity.title}
                </option>
              ))}
            </select>

            {opportunities.length === 0 && (
              <p className="required-skills-hint">
                No opportunities found for this company. Create an
                opportunity first.
              </p>
            )}
          </div>
        </div>

        <div className="required-skills-card">
          <h2>Add Required Skills</h2>
          <p className="required-skills-description">
            Specify the skills candidates should have for the selected
            opportunity.
          </p>

          <div className="required-skills-add-row">
            <input
              type="text"
              placeholder="Enter skill name (e.g. React.js)"
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
            />

            <select
              value={newLevel}
              onChange={(event) => setNewLevel(event.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button type="button" onClick={addSkill}>
              Add Skill
            </button>
          </div>

          <div className="required-skills-list">
            {skills.length === 0 ? (
              <p className="required-skills-empty">
                No skills added yet.
              </p>
            ) : (
              skills.map((skill, index) => (
                <div className="required-skill-item" key={`${skill.skillName}-${index}`}>
                  <strong>{skill.skillName}</strong>

                  <select
                    value={skill.level}
                    onChange={(event) =>
                      updateSkillLevel(index, event.target.value)
                    }
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <button
                    type="button"
                    className="required-skill-remove"
                    onClick={() => removeSkill(index)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          {error && <p className="required-skills-error">{error}</p>}
          {message && <p className="required-skills-success">{message}</p>}

          <button
            type="button"
            className="required-skills-save"
            onClick={saveSkills}
            disabled={saving || !selectedOpportunity}
          >
            {saving ? "Saving..." : "Save Required Skills"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpecifyRequiredSkills;
