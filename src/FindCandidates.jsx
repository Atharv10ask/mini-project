
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindCandidates.css";

const API_URL = "http://localhost:3000";

function FindCandidates() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [error, setError] = useState("");
  const [candidateError, setCandidateError] = useState("");

  // Load company profile and its posted opportunities.
  useEffect(() => {
    async function loadCompanyData() {
      try {
        setLoading(true);
        setError("");

        const email = localStorage.getItem("email");

        if (!email) {
          throw new Error(
            "Company email not found. Please log in again."
          );
        }

        setCompanyEmail(email);

        const profileResponse = await fetch(
          `${API_URL}/company-profile?email=${encodeURIComponent(email)}`
        );

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message || "Unable to load company profile."
          );
        }

        const profile =
          profileData.profile || profileData;

        const name = profile.companyName || profile.name;

        if (!name) {
          throw new Error(
            "Company name not found. Please complete your company profile."
          );
        }

        setCompanyName(name);

        const opportunityResponse = await fetch(
          `${API_URL}/opportunities`
        );

        const opportunityData = await opportunityResponse.json();

        if (!opportunityResponse.ok) {
          throw new Error(
            opportunityData.message ||
              "Unable to load posted opportunities."
          );
        }

        const allOpportunities = Array.isArray(opportunityData)
          ? opportunityData
          : Array.isArray(opportunityData.opportunities)
            ? opportunityData.opportunities
            : [];

        // Only show opportunities belonging to this company.
        const companyOpportunities = allOpportunities.filter((item) => {
          if (item.companyEmail && email && item.companyEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
            return true;
          }
          const postedCompany = String(item.companyName || item.company || "").trim().toLowerCase();
          return name && postedCompany === String(name).trim().toLowerCase();
        });

        setOpportunities(companyOpportunities);

        if (companyOpportunities.length > 0) {
          setSelectedOpportunity(
            String(
              companyOpportunities[0]._id ||
              companyOpportunities[0].id
            )
          );
        }
      } catch (error) {
        console.error("Company data error:", error);
        setError(error.message || "Unable to load company data.");
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
  }, []);

  // Find suitable students for the selected opportunity.
  useEffect(() => {
    if (!selectedOpportunity || !companyName) {
      setCandidates([]);
      setCandidateError("");
      return;
    }

    const controller = new AbortController();

    async function loadCandidates() {
      try {
        setCandidateLoading(true);
        setCandidateError("");
        setCandidates([]);

        const params = new URLSearchParams({
          opportunityId: selectedOpportunity,
          companyName,
          companyEmail,
        });

        const response = await fetch(
          `${API_URL}/candidate-matches?${params.toString()}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to find candidates."
          );
        }

        setCandidates(
          Array.isArray(data.candidates) ? data.candidates : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Candidate matching error:", error);
          setCandidateError(
            error.message || "Unable to find suitable candidates."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCandidateLoading(false);
        }
      }
    }

    loadCandidates();

    return () => controller.abort();
  }, [selectedOpportunity, companyName, companyEmail]);

  const filteredCandidates = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      return (
        String(candidate.fullName || "")
          .toLowerCase()
          .includes(searchText) ||
        String(candidate.email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(candidate.college || "")
          .toLowerCase()
          .includes(searchText) ||
        String(candidate.branch || "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [candidates, search]);

  const selectedOpportunityData = opportunities.find(
    (item) =>
      String(item._id || item.id) === String(selectedOpportunity)
  );

  if (loading) {
    return (
      <div className="candidate-page">
        <div className="candidate-loading">
          Loading company opportunities...
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-page">
      <aside className="candidate-sidebar">
        <div className="candidate-brand">
          <div className="candidate-brand-icon">🎓</div>
          <div>
            <h2>Academia–Industry</h2>
            <p>Collaboration Portal</p>
          </div>
        </div>

        <nav className="candidate-nav">
          <button
            type="button"
            onClick={() => navigate("/industry-dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/company-profile")}
          >
            <span>▤</span>
            Company Profile
          </button>

          <button
            type="button"
            onClick={() => navigate("/opportunities")}
          >
            <span>＋</span>
            Manage Opportunities
          </button>

          <button
            type="button"
            onClick={() => navigate("/review-applications")}
          >
            <span>▣</span>
            Review Applications
          </button>

          <button
            type="button"
            className="active"
          >
            <span>♙</span>
            Find Candidates
          </button>
        </nav>
      </aside>

      <main className="candidate-main">
        <header className="candidate-header">
          <div>
            <span className="candidate-eyebrow">
              INDUSTRY PORTAL
            </span>
            <h1>Find Suitable Candidates</h1>
            <p>
              Discover students whose skills match your opportunity
              requirements.
            </p>
          </div>

          <div className="candidate-company">
            <div className="candidate-company-avatar">
              {companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{companyName}</strong>
              <span>Industry Partner</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="candidate-error">
            {error}
          </div>
        )}

        {!error && opportunities.length === 0 && (
          <section className="candidate-empty">
            <div>▤</div>
            <h2>No opportunities found</h2>
            <p>
              You need to post an internship or job before finding
              suitable candidates.
            </p>
            <button
              type="button"
              onClick={() => navigate("/opportunities")}
            >
              Post an opportunity
            </button>
          </section>
        )}

        {opportunities.length > 0 && (
          <>
            <section className="candidate-selector">
              <div>
                <span className="candidate-section-label">
                  SELECT OPPORTUNITY
                </span>
                <h2>Choose a job or internship</h2>
                <p>
                  Candidate matching will be calculated using the
                  required skills of this opportunity.
                </p>
              </div>

              <select
                value={selectedOpportunity}
                onChange={(event) =>
                  setSelectedOpportunity(event.target.value)
                }
              >
                {opportunities.map((item) => (
                  <option
                    key={item._id || item.id}
                    value={String(item._id || item.id)}
                  >
                    {item.title} ({item.type || "Opportunity"})
                  </option>
                ))}
              </select>

              {selectedOpportunityData && (
                <div className="candidate-requirements">
                  <strong>Required skills</strong>
                  <div className="candidate-skill-list">
                    {(selectedOpportunityData.requiredSkills || []).map(
                      (skill, index) => {
                        const skillName =
                          typeof skill === "string"
                            ? skill
                            : skill?.skillName;

                        const skillLevel =
                          typeof skill === "string"
                            ? "Beginner"
                            : skill?.level || "Beginner";

                        return (
                          <span key={`${skillName}-${index}`}>
                            {skillName} · {skillLevel}
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="candidate-stats">
              <div className="candidate-stat-card">
                <span>Total candidates</span>
                <strong>{candidates.length}</strong>
              </div>

              <div className="candidate-stat-card">
                <span>Strong matches (80%+)</span>
                <strong>
                  {
                    candidates.filter(
                      (candidate) =>
                        candidate.matchPercentage >= 80
                    ).length
                  }
                </strong>
              </div>

              <div className="candidate-stat-card">
                <span>Good matches (50–79%)</span>
                <strong>
                  {
                    candidates.filter(
                      (candidate) =>
                        candidate.matchPercentage >= 50 &&
                        candidate.matchPercentage < 80
                    ).length
                  }
                </strong>
              </div>
            </section>

            <section className="candidate-results">
              <div className="candidate-results-heading">
                <div>
                  <h2>Recommended candidates</h2>
                  <p>
                    Students are ranked by their skill-match percentage.
                  </p>
                </div>

                <input
                  type="search"
                  placeholder="Search name, college or branch..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {candidateLoading ? (
                <div className="candidate-empty">
                  <h3>Analysing student skills...</h3>
                  <p>
                    Comparing student profiles with opportunity
                    requirements.
                  </p>
                </div>
              ) : candidateError ? (
                <div className="candidate-error">
                  {candidateError}
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="candidate-empty">
                  <h3>No matching students found</h3>
                  <p>
                    No student profiles matched your search. Try
                    another search or check the saved student skills.
                  </p>
                </div>
              ) : (
                <div className="candidate-list">
                  {filteredCandidates.map((candidate, index) => (
                    <article
                      className="candidate-card"
                      key={candidate._id}
                    >
                      <div className="candidate-card-top">
                        <div className="candidate-avatar">
                          {(
                            candidate.fullName || "S"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="candidate-identity">
                          <h3>{candidate.fullName || "Student"}</h3>
                          <p>{candidate.email}</p>
                          <span>
                            {candidate.college || "College not provided"}
                          </span>
                        </div>

                        <div className="candidate-match">
                          <strong>
                            {candidate.matchPercentage}%
                          </strong>
                          <span>Skill match</span>
                        </div>
                      </div>

                      <div className="candidate-education">
                        <div>
                          <span>Degree</span>
                          <strong>
                            {candidate.degree || "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>Branch</span>
                          <strong>
                            {candidate.branch || "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>Graduation year</span>
                          <strong>
                            {candidate.graduationYear || "Not provided"}
                          </strong>
                        </div>
                      </div>

                      <div className="candidate-skill-section">
                        <strong>Matched skills</strong>

                        <div className="candidate-skill-list">
                          {candidate.matchedSkills.length > 0 ? (
                            candidate.matchedSkills.map((skill) => (
                              <span
                                className="candidate-skill-good"
                                key={skill.skillName}
                              >
                                ✓ {skill.skillName} ({skill.studentLevel})
                              </span>
                            ))
                          ) : (
                            <span>No fully matched skills</span>
                          )}
                        </div>
                      </div>

                      {candidate.improvementSkills.length > 0 && (
                        <div className="candidate-skill-section">
                          <strong>Skills to improve</strong>

                          <div className="candidate-skill-list">
                            {candidate.improvementSkills.map((skill) => (
                              <span
                                className="candidate-skill-warning"
                                key={skill.skillName}
                              >
                                {skill.skillName}: {skill.studentLevel}
                                {" → "}
                                {skill.requiredLevel}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {candidate.missingSkills.length > 0 && (
                        <div className="candidate-skill-section">
                          <strong>Missing skills</strong>

                          <div className="candidate-skill-list">
                            {candidate.missingSkills.map((skill) => (
                              <span
                                className="candidate-skill-missing"
                                key={skill}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="candidate-card-actions">
                        {candidate.github && (
                          <a
                            href={candidate.github}
                            target="_blank"
                            rel="noreferrer"
                          >
                            GitHub profile ↗
                          </a>
                        )}

                        {candidate.linkedin && (
                          <a
                            href={candidate.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            LinkedIn profile ↗
                          </a>
                        )}

                        <a href={`mailto:${candidate.email}`}>
                          Contact student ↗
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default FindCandidates;
