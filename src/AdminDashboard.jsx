
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API = "http://localhost:3000";

function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    counts: {},
    students: [],
    companies: [],
    opportunities: [],
    applications: [],
    requirements: []
  });

  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/admin/dashboard`);

      if (!response.ok) {
        throw new Error("Could not load dashboard data");
      }

      const result = await response.json();

      setData({
        counts: result.counts || {},
        students: result.students || [],
        companies: result.companies || [],
        opportunities: result.opportunities || [],
        applications: result.applications || [],
        requirements: result.requirements || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentRecords = useMemo(() => {
    const records = {
      Students: data.students,
      Companies: data.companies,
      Opportunities: data.opportunities,
      Applications: data.applications,
      "Skill Requirements": data.requirements
    };

    const selected = records[activeTab] || [];
    const term = search.toLowerCase().trim();

    if (!term) return selected;

    return selected.filter((item) =>
      Object.values(item).some((value) => {
        if (typeof value === "string" || typeof value === "number") {
          return String(value).toLowerCase().includes(term);
        }

        if (Array.isArray(value)) {
          return JSON.stringify(value).toLowerCase().includes(term);
        }

        return false;
      })
    );
  }, [activeTab, search, data]);

  const cards = [
    {
      title: "Total Students",
      value: data.counts.students || 0,
      icon: "🎓",
      tab: "Students"
    },
    {
      title: "Total Companies",
      value: data.counts.companies || 0,
      icon: "🏢",
      tab: "Companies"
    },
    {
      title: "Opportunities",
      value: data.counts.opportunities || 0,
      icon: "💼",
      tab: "Opportunities"
    },
    {
      title: "Applications",
      value: data.counts.applications || 0,
      icon: "📄",
      tab: "Applications"
    },
    {
      title: "Skill Requirements",
      value: data.counts.requirements || 0,
      icon: "🧠",
      tab: "Skill Requirements"
    }
  ];

  async function handleDeleteRecord(record) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      let endpoint = "";
      if (activeTab === "Students") endpoint = `${API}/admin/users/${record._id}`;
      else if (activeTab === "Companies") endpoint = `${API}/admin/companies/${record._id}`;
      else if (activeTab === "Opportunities") endpoint = `${API}/admin/opportunities/${record._id}`;
      else if (activeTab === "Applications") endpoint = `${API}/admin/applications/${record._id}`;
      else if (activeTab === "Skill Requirements") endpoint = `${API}/admin/requirements/${record._id}`;

      if (endpoint) {
        const res = await fetch(endpoint, { method: "DELETE" });
        if (res.ok) {
          alert("Record deleted successfully.");
          loadDashboard();
        } else {
          alert("Failed to delete record.");
        }
      }
    } catch (e) {
      alert("Error deleting record: " + e.message);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login", { replace: true });
  }

  function displayValue(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.skillName || item.name || JSON.stringify(item);
        }
        return String(item);
      }).join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  function getColumns() {
    const columns = {
      Students: [
        ["Name", "fullName"],
        ["Email", "email"],
        ["Phone", "phone"],
        ["College", "college"],
        ["Degree", "degree"],
        ["Branch", "branch"],
        ["Graduation", "graduationYear"],
        ["Career Goal", "careerGoal"],
        ["Skills", "skills"],
        ["GitHub", "github"],
        ["LinkedIn", "linkedin"]
      ],
      Companies: [
        ["Company", "companyName"],
        ["Email", "email"],
        ["Phone", "phone"],
        ["Website", "website"],
        ["Industry", "industry"],
        ["Location", "location"]
      ],
      Opportunities: [
        ["Title", "title"],
        ["Company", "companyName"],
        ["Type", "type"],
        ["Location", "location"],
        ["Work Mode", "workMode"],
        ["Compensation", "compensation"],
        ["Required Skills", "requiredSkills"],
        ["Eligibility", "eligibility"],
        ["Openings", "openings"],
        ["Deadline", "deadline"]
      ],
      Applications: [
        ["Student", "studentName"],
        ["Student Email", "studentEmail"],
        ["Opportunity", "opportunityTitle"],
        ["Company", "companyName"],
        ["Location", "location"],
        ["Status", "status"]
      ],
      "Skill Requirements": [
        ["Title", "title"],
        ["Company", "company"],
        ["Type", "type"],
        ["Description", "description"],
        ["Skills", "skills"]
      ]
    };

    return columns[activeTab] || [];
  }

  const tabs = [
    "Overview",
    "Students",
    "Companies",
    "Opportunities",
    "Applications",
    "Skill Requirements"
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">A</div>
          <div>
            <h2>Admin Panel</h2>
            <span>Academia–Industry Portal</span>
          </div>
        </div>

        <div className="admin-menu-label">MAIN MENU</div>

        {tabs.map((tab) => (
          <button
            key={tab}
            className={`admin-menu-item ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab(tab);
              setSearch("");
            }}
          >
            {tab === "Overview" && "▦"}
            {tab === "Students" && "♙"}
            {tab === "Companies" && "▣"}
            {tab === "Opportunities" && "💼"}
            {tab === "Applications" && "▤"}
            {tab === "Skill Requirements" && "✦"}
            <span>{tab}</span>
          </button>
        ))}

        <div className="admin-sidebar-bottom">
          <button onClick={loadDashboard}>↻ Refresh Data</button>
          <button onClick={handleLogout} style={{ marginTop: "8px", background: "#f87171" }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{activeTab === "Overview" ? "Dashboard Overview" : activeTab}</h1>
            <p>Manage and monitor your portal data</p>
          </div>

          <button className="admin-refresh" onClick={loadDashboard}>
            ↻ Refresh
          </button>
        </header>

        {loading ? (
          <div className="admin-message">Loading your database records...</div>
        ) : error ? (
          <div className="admin-error">
            {error}
            <button onClick={loadDashboard}>Try Again</button>
          </div>
        ) : (
          <>
            {activeTab === "Overview" ? (
              <>
                <section className="admin-welcome">
                  <div>
                    <h2>Welcome, Administrator</h2>
                    <p>
                      Here's an overview of the existing portal data.
                    </p>
                  </div>
                  <span>LIVE DATABASE DATA</span>
                </section>

                <section className="admin-stat-grid">
                  {cards.map((card) => (
                    <button
                      className="admin-stat-card"
                      key={card.title}
                      onClick={() => setActiveTab(card.tab)}
                    >
                      <div className="admin-stat-top">
                        <span>{card.title}</span>
                        <span className="admin-stat-icon">{card.icon}</span>
                      </div>
                      <strong>{card.value}</strong>
                      <small>View records →</small>
                    </button>
                  ))}
                </section>

                <section className="admin-overview-grid">
                  <div className="admin-panel">
                    <h3>Recent Students</h3>
                    {data.students.slice(-5).reverse().map((student) => (
                      <div className="admin-recent-row" key={student._id}>
                        <div className="admin-avatar">
                          {(student.fullName || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{student.fullName || "Student"}</strong>
                          <p>{student.email || "No email"}</p>
                        </div>
                      </div>
                    ))}
                    {data.students.length === 0 && (
                      <p className="admin-empty">No student records found.</p>
                    )}
                    <button
                      className="admin-text-button"
                      onClick={() => setActiveTab("Students")}
                    >
                      View all students →
                    </button>
                  </div>

                  <div className="admin-panel">
                    <h3>Recent Opportunities</h3>
                    {data.opportunities.slice(-5).reverse().map((item) => (
                      <div className="admin-recent-row" key={item._id}>
                        <div className="admin-avatar company-avatar">B</div>
                        <div>
                          <strong>{item.title || "Opportunity"}</strong>
                          <p>{item.companyName || item.company || "Company"}</p>
                        </div>
                      </div>
                    ))}
                    {data.opportunities.length === 0 && (
                      <p className="admin-empty">No opportunities found.</p>
                    )}
                    <button
                      className="admin-text-button"
                      onClick={() => setActiveTab("Opportunities")}
                    >
                      View all opportunities →
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <section className="admin-panel admin-record-panel">
                <div className="admin-record-heading">
                  <div>
                    <h2>{activeTab} Records</h2>
                    <p>{currentRecords.length} records found</p>
                  </div>
                  <input
                    type="search"
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                {currentRecords.length === 0 ? (
                  <div className="admin-empty">
                    No matching records found in the database.
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          {getColumns().map(([label]) => (
                            <th key={label}>{label}</th>
                          ))}
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.map((record, index) => (
                          <tr key={record._id || index}>
                            <td>{index + 1}</td>
                            {getColumns().map(([label, field]) => (
                              <td key={field}>
                                {displayValue(record[field])}
                              </td>
                            ))}
                            <td>
                              <button
                                style={{
                                  background: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                  fontSize: "12px"
                                }}
                                onClick={() => handleDeleteRecord(record)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
