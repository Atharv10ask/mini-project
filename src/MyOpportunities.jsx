
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOpportunities.css";

const API_URL = "http://localhost:3000";

function MyOpportunities() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const email = savedUser.email;

  useEffect(() => {
    if (!email || String(savedUser.role || "").toLowerCase() !== "industry") {
      navigate("/login", { replace: true });
      return;
    }

    fetchMyOpportunities();
  }, []);

  async function fetchMyOpportunities() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/opportunities/company/${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load opportunities.");
      }

      const records = Array.isArray(data)
        ? data
        : data.opportunities || data.data || [];

      setOpportunities(records);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="my-opportunities-page">

      <header className="my-opportunities-header">
        <div>
          <p>INDUSTRY WORKSPACE</p>
          <h1>My Opportunities</h1>
          <span>
            View all jobs, internships and projects posted by your company.
          </span>
        </div>

        <button
          className="my-post-button"
          onClick={() => navigate("/opportunities")}
        >
          + Post New Opportunity
        </button>
      </header>

      <section className="my-opportunities-summary">
        <div>
          <span>Total Published Opportunities</span>
          <h2>{opportunities.length}</h2>
        </div>

        <div>
          <span>Open Opportunities</span>
          <h2>
            {opportunities.filter(
              (item) => String(item.status || "Open").toLowerCase() === "open"
            ).length}
          </h2>
        </div>

        <div>
          <span>Closed Opportunities</span>
          <h2>
            {opportunities.filter(
              (item) => String(item.status || "").toLowerCase() === "closed"
            ).length}
          </h2>
        </div>
      </section>

      <section className="my-opportunities-content">

        <div className="my-opportunities-title">
          <div>
            <h2>Published Opportunities</h2>
            <p>Manage the opportunities created by your company.</p>
          </div>

          <button
            className="my-refresh-button"
            onClick={fetchMyOpportunities}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="my-opportunities-message">
            Loading your opportunities...
          </div>
        )}

        {!loading && error && (
          <div className="my-opportunities-error">
            {error}
            <button onClick={fetchMyOpportunities}>Try Again</button>
          </div>
        )}

        {!loading && !error && opportunities.length === 0 && (
          <div className="my-opportunities-empty">
            <div>📋</div>
            <h3>No Opportunities Posted Yet</h3>
            <p>
              You have not published any jobs or internships.
              Start by posting your first opportunity.
            </p>

            <button
              onClick={() => navigate("/opportunities")}
            >
              Post Your First Opportunity
            </button>
          </div>
        )}

        {!loading && !error && opportunities.length > 0 && (
          <div className="my-opportunities-grid">

            {opportunities.map((item) => (
              <article
                className="my-opportunity-card"
                key={item._id || item.id}
              >
                <div className="my-opportunity-top">
                  <span className="my-opportunity-type">
                    {item.type || "Opportunity"}
                  </span>

                  <span
                    className={
                      String(item.status || "Open").toLowerCase() === "closed"
                        ? "my-status closed"
                        : "my-status open"
                    }
                  >
                    {item.status || "Open"}
                  </span>
                </div>

                <h3>{item.title || "Untitled Opportunity"}</h3>

                <p className="my-opportunity-company">
                  {item.companyName || item.company || "Your Company"}
                </p>

                <div className="my-opportunity-details">
                  <p>
                    <strong>Location:</strong>{" "}
                    {item.location || "Not specified"}
                  </p>

                  <p>
                    <strong>Work Mode:</strong>{" "}
                    {item.workMode || "Not specified"}
                  </p>

                  <p>
                    <strong>Openings:</strong>{" "}
                    {item.openings ?? "Not specified"}
                  </p>

                  <p>
                    <strong>Compensation:</strong>{" "}
                    {item.compensation || item.stipend || "Not specified"}
                  </p>

                  <p>
                    <strong>Deadline:</strong>{" "}
                    {formatDate(item.deadline)}
                  </p>
                </div>

                {item.description && (
                  <p className="my-opportunity-description">
                    {item.description}
                  </p>
                )}

                {Array.isArray(item.requiredSkills) &&
                  item.requiredSkills.length > 0 && (
                    <div className="my-opportunity-skills">
                      <strong>Required Skills</strong>

                      <div>
                        {item.requiredSkills.map((skill, index) => (
                          <span key={index}>
                            {typeof skill === "string"
                              ? skill
                              : skill.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="my-opportunity-footer">
                  <span>
                    Posted: {formatDate(item.createdAt)}
                  </span>
                </div>
              </article>
            ))}

          </div>
        )}

      </section>

      <button
        className="my-back-button"
        onClick={() => navigate("/industry-dashboard")}
      >
        ← Back to Dashboard
      </button>

    </div>
  );
}

export default MyOpportunities;
