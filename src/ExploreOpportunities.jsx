
import { useEffect, useState } from "react";
import "./ExploreOpportunities.css";

const API = "http://localhost:3000/opportunities";

function ExploreOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(API);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid opportunity data received");
        }

        setOpportunities(data);
      } catch (err) {
        console.error("Opportunity fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) {
    return <h3>Loading opportunities...</h3>;
  }

  if (error) {
    return (
      <div>
        <h2>Unable to load opportunities</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="opportunities-content">

      <h1>Explore Opportunities</h1>
      <p>Discover jobs and internships posted by industries.</p>

      {opportunities.length === 0 ? (
        <p>No opportunities have been posted yet.</p>
      ) : (
        <div className="opportunity-list">

          {opportunities.map((item) => (
            <div className="opportunity-card" key={item._id}>

              <h3>{item.title}</h3>

              <p>
                <strong>Company:</strong> {item.companyName}
              </p>

              <p>
                <strong>Type:</strong> {item.type}
              </p>

              <p>
                <strong>Location:</strong> {item.location}
              </p>

              <p>
                <strong>Work Mode:</strong> {item.workMode}
              </p>

              <p>{item.description}</p>

              <p>
                <strong>Required Skills:</strong>{" "}
                {Array.isArray(item.requiredSkills)
                  ? item.requiredSkills.map(skill =>
                      typeof skill === "string"
                        ? skill
                        : skill.skillName
                    ).join(", ")
                  : item.requiredSkills}
              </p>

              <p>
                <strong>Compensation:</strong> {item.compensation}
              </p>

              <p>
                <strong>Openings:</strong> {item.openings}
              </p>

              <p>
                <strong>Deadline:</strong>{" "}
                {item.deadline
                  ? new Date(item.deadline).toLocaleDateString()
                  : "Not specified"}
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default ExploreOpportunities;
