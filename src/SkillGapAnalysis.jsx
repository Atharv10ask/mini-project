
import { useEffect, useState } from "react";
import axios from "axios";
import "./SkillGapAnalysis.css";

function SkillGapAnalysis() {
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [requirementId, setRequirementId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequirements() {
      try {
        const response = await axios.get(
          "http://localhost:3000/skill-requirements"
        );

        setRequirements(response.data);
      } catch {
        setError("Unable to load requirements. Check the backend.");
      }
    }

    loadRequirements();
  }, []);

  async function analyseSkills(event) {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!email.trim() || !requirementId) {
      setError("Enter your email and select a requirement.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3000/skill-gap/${encodeURIComponent(
          email.trim()
        )}/${requirementId}`
      );

      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to analyse skills. Check your student profile."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="skill-gap-page">
      <div className="skill-gap-container">
        <header className="skill-gap-heading">
          <h1>Skill Gap Analysis</h1>
          <p>
            Compare your skills with industry requirements and discover
            what you need to improve for your career.
          </p>
        </header>

        <section className="skill-gap-card">
          <form className="skill-gap-form" onSubmit={analyseSkills}>
            <label htmlFor="student-email">Student profile email</label>

            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />

            <label htmlFor="requirement">
              Select a job or internship
            </label>

            <select
              id="requirement"
              value={requirementId}
              onChange={(e) => {
                setRequirementId(e.target.value);
                setAnalysis(null);
              }}
              required
            >
              <option value="">Select a requirement</option>

              {requirements.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title} — {item.company} ({item.type})
                </option>
              ))}
            </select>

            <button
              className="skill-gap-button"
              type="submit"
              disabled={loading || requirements.length === 0}
            >
              {loading ? "Analysing..." : "Analyse My Skills"}
            </button>

            {requirements.length === 0 && !error && (
              <p className="skill-gap-empty">
                No requirements found. Add one on the Industry Requirements
                page first.
              </p>
            )}
          </form>

          {error && (
            <p className="skill-gap-message" role="alert">
              {error}
            </p>
          )}

          {analysis && (
            <section className="skill-gap-results">
              <h2>{analysis.requirement.title}</h2>

              <p className="skill-gap-subtitle">
                {analysis.requirement.company} · {analysis.requirement.type}
              </p>

              <div className="skill-gap-summary">
                <div className="skill-gap-stat skill-gap-stat-match">
                  <span>Skill Match</span>
                  <strong>{analysis.matchPercentage}%</strong>
                </div>

                <div className="skill-gap-stat">
                  <span>Matched Skills</span>
                  <strong>{analysis.matchedSkills.length}</strong>
                </div>

                <div className="skill-gap-stat">
                  <span>Missing Skills</span>
                  <strong>{analysis.missingSkills.length}</strong>
                </div>

                <div className="skill-gap-stat">
                  <span>Need Improvement</span>
                  <strong>{analysis.improvementSkills.length}</strong>
                </div>
              </div>

              <div
                className="skill-gap-progress-track"
                role="progressbar"
                aria-label="Skill match percentage"
                aria-valuenow={analysis.matchPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="skill-gap-progress-fill"
                  style={{ width: `${analysis.matchPercentage}%` }}
                />
              </div>

              <div className="skill-gap-columns">
                <SkillList
                  title="Matched Skills"
                  skills={analysis.matchedSkills}
                />

                <SkillList
                  title="Missing Skills"
                  skills={analysis.missingSkills}
                />
              </div>

              <h3>Skills to Improve</h3>

              {analysis.improvementSkills.length === 0 ? (
                <p className="skill-gap-empty">
                  No proficiency gaps found.
                </p>
              ) : (
                <div className="skill-gap-list">
                  {analysis.improvementSkills.map((skill) => (
                    <article
                      key={skill.skillName}
                      className="skill-gap-item skill-gap-item-improvement"
                    >
                      <strong>{skill.skillName}</strong>

                      <span>
                        Current: {skill.currentLevel} → Required:{" "}
                        {skill.requiredLevel}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function SkillList({ title, skills }) {
  return (
    <section className="skill-gap-list-section">
      <h3>
        {title} ({skills.length})
      </h3>

      {skills.length === 0 ? (
        <p className="skill-gap-empty">No skills in this category.</p>
      ) : (
        <div className="skill-gap-list">
          {skills.map((skill) => (
            <article key={skill.skillName} className="skill-gap-item">
              <strong>{skill.skillName}</strong>

              <span className="skill-gap-level">
                {skill.level}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SkillGapAnalysis;
