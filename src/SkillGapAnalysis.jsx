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

  // Pre-fill student's email from localStorage
  useEffect(() => {
    let savedEmail = localStorage.getItem("email") || "";
    if (!savedEmail) {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u.email) savedEmail = u.email;
      } catch (e) {}
    }
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Load both standalone skill requirements and posted opportunities with required skills
  useEffect(() => {
    async function loadRequirements() {
      try {
        const [reqRes, oppRes] = await Promise.allSettled([
          axios.get("http://localhost:3000/skill-requirements"),
          axios.get("http://localhost:3000/opportunities")
        ]);

        const combined = [];

        if (reqRes.status === "fulfilled" && Array.isArray(reqRes.value.data)) {
          reqRes.value.data.forEach((r) => {
            combined.push({
              _id: r._id,
              title: r.title,
              company: r.company || "Industry Partner",
              type: r.type || "Industry Requirement"
            });
          });
        }

        if (oppRes.status === "fulfilled" && Array.isArray(oppRes.value.data)) {
          oppRes.value.data.forEach((o) => {
            if (o.requiredSkills && o.requiredSkills.length > 0) {
              combined.push({
                _id: o._id,
                title: o.title,
                company: o.companyName || "Industry Partner",
                type: o.type || "Opportunity"
              });
            }
          });
        }

        setRequirements(combined);
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
      setError("Enter your email and select a job or requirement.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3000/skill-gap/${encodeURIComponent(
          email.trim().toLowerCase()
        )}/${requirementId}`
      );

      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to analyse skills. Please make sure your student profile is created and has skills."
      );
    } finally {
      setLoading(false);
    }
  }

  const reqTitle = analysis?.requirement?.title || analysis?.requirementTitle || "Analysis Result";
  const reqCompany = analysis?.requirement?.company || analysis?.company || "Industry Partner";
  const reqType = analysis?.requirement?.type || "Role";

  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const improvementSkills = analysis?.improvementSkills || analysis?.proficiencyGaps || [];
  const matchPercentage = analysis?.matchPercentage ?? 0;

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
              Select a job, internship, or industry requirement
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
              <option value="">Select an opportunity or requirement</option>

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
                No requirements or opportunities found. Once industries post openings, they will appear here.
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
              <h2>{reqTitle}</h2>

              <p className="skill-gap-subtitle">
                {reqCompany} · {reqType}
              </p>

              <div className="skill-gap-summary">
                <div className="skill-gap-stat skill-gap-stat-match">
                  <span>Skill Match</span>
                  <strong>{matchPercentage}%</strong>
                </div>

                <div className="skill-gap-stat">
                  <span>Matched Skills</span>
                  <strong>{matchedSkills.length}</strong>
                </div>

                <div className="skill-gap-stat">
                  <span>Missing Skills</span>
                  <strong>{missingSkills.length}</strong>
                </div>

                <div className="skill-gap-stat">
                  <span>Need Improvement</span>
                  <strong>{improvementSkills.length}</strong>
                </div>
              </div>

              <div
                className="skill-gap-progress-track"
                role="progressbar"
                aria-label="Skill match percentage"
                aria-valuenow={matchPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="skill-gap-progress-fill"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>

              <div className="skill-gap-columns">
                <SkillList
                  title="Matched Skills"
                  skills={matchedSkills}
                />

                <SkillList
                  title="Missing Skills"
                  skills={missingSkills}
                />
              </div>

              <h3>Skills to Improve (Proficiency Gaps)</h3>

              {improvementSkills.length === 0 ? (
                <p className="skill-gap-empty">
                  No proficiency gaps found. Your skill levels meet or exceed the requirements!
                </p>
              ) : (
                <div className="skill-gap-list">
                  {improvementSkills.map((skill, index) => (
                    <article
                      key={skill.skillName || index}
                      className="skill-gap-item skill-gap-item-improvement"
                    >
                      <strong>{skill.skillName}</strong>

                      <span>
                        Current: {skill.currentLevel || skill.studentLevel || "Beginner"} → Required:{" "}
                        {skill.requiredLevel || "Advanced"}
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
          {skills.map((skill, index) => (
            <article key={skill.skillName || index} className="skill-gap-item">
              <strong>{skill.skillName}</strong>

              <span className="skill-gap-level">
                {skill.level || skill.requiredLevel || skill.studentLevel}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SkillGapAnalysis;
