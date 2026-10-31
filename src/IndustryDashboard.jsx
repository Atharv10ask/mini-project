
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./IndustryDashboard.css";

const API_URL = "http://localhost:3000";

function IndustryDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("industry") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("loggedInUser");

    if (!savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (
        !parsedUser.email ||
        String(parsedUser.role || "").toLowerCase() !== "industry"
      ) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(parsedUser);
      loadCompanyProfile(parsedUser.email);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  async function loadCompanyProfile(email) {
    try {
      const response = await fetch(
        `${API_URL}/company-profile?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (response.ok) {
        setCompany(data.profile || data.company || data);
      }
    } catch (error) {
      console.error("Company profile loading failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("industry");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    setUser(null);
    navigate("/login", { replace: true });
  }

  if (!user) {
    return (
      <div className="industry-loading">
        Checking login...
      </div>
    );
  }

  const companyName =
    company.companyName ||
    company.name ||
    user.companyName ||
    user.username ||
    "Your Company";

  // Dashboard module navigation
  const menuItems = [
    {
      icon: "▣",
      title: "Company Profile",
      description: "Manage your company information.",
      path: "/company-profile",
    },
    {
      icon: "◇",
      title: "Post Opportunities",
      description: "Publish new jobs and internship openings.",
      path: "/post-opportunity",
    },
    {
      icon: "▤",
      title: "My Opportunities",
      description: "View and manage your published opportunities.",
      path: "/my-opportunities",
    },
    {
      icon: "♙",
      title: "Review Applications",
      description: "View and manage student applications.",
      path: "/review-applications",
    },
    {
      icon: "◎",
      title: "Skill Requirements",
      description: "Specify skills required by your industry.",
      path: "/industry-requirements",
    },
  ];

  return (
    <div className="industry-dashboard">

      {/* SIDEBAR */}
      <aside className="industry-sidebar">

        <div className="industry-brand">
          <div className="industry-logo">A</div>
          <div>
            <h2>Academia Portal</h2>
            <span>Industry Workspace</span>
          </div>
        </div>

        <p className="industry-menu-label">WORKSPACE</p>

        <nav className="industry-nav">

          <button
            className="industry-nav-link active"
            onClick={() => navigate("/industry-dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="industry-nav-link"
            onClick={() => navigate("/company-profile")}
          >
            <span>▣</span>
            Company Profile
          </button>

          <button
            className="industry-nav-link"
            onClick={() => navigate("/post-opportunity")}
          >
            <span>◇</span>
            Post Opportunities
          </button>

          <button
            className="industry-nav-link"
            onClick={() => navigate("/my-opportunities")}
          >
            <span>▤</span>
            My Opportunities
          </button>

          <button
            className="industry-nav-link"
            onClick={() => navigate("/review-applications")}
          >
            <span>♙</span>
            Applications
          </button>

          <button
            className="industry-nav-link"
            onClick={() => navigate("/industry-requirements")}
          >
            <span>◎</span>
            Skill Requirements
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="industry-sidebar-bottom">

          <div className="industry-user-mini">
            <div className="industry-avatar">
              {companyName.charAt(0).toUpperCase()}
            </div>

            <div className="industry-user-info">
              <strong>{companyName}</strong>
              <span>Industry Account</span>
            </div>
          </div>

          <button
            className="industry-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="industry-main">

        {/* HEADER */}
        <header className="industry-header">

          <div>
            <p className="industry-eyebrow">
              INDUSTRY WORKSPACE
            </p>

            <h1>Industry Dashboard</h1>

            <p>
              Manage your company, opportunities and student applications.
            </p>
          </div>

          <div className="industry-header-actions">

            <div className="industry-account">
              <div className="industry-avatar">
                {companyName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{companyName}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <button
              className="industry-header-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        </header>

        {/* WELCOME SECTION */}
        <section className="industry-welcome">

          <div>
            <span className="industry-welcome-tag">
              INDUSTRY ACCOUNT
            </span>

            <h2>
              Welcome, {user.username || companyName}!
            </h2>

            <p>
              Connect with universities, discover skilled students,
              and build your workforce through industry collaboration.
            </p>
          </div>

          <div className="industry-welcome-icon">
            <span>🏢</span>
          </div>

        </section>

        {/* COMPANY INFORMATION */}
        <section className="industry-section">

          <div className="industry-section-heading">

            <div>
              <h2>Company Information</h2>
              <p>Your registered industry account details.</p>
            </div>

            <button
              className="industry-outline-button"
              onClick={() => navigate("/company-profile")}
            >
              Edit Profile
            </button>

          </div>

          <div className="industry-info-grid">

            <div className="industry-info-card">
              <span>Company Name</span>
              <strong>
                {loading ? "Loading..." : companyName}
              </strong>
            </div>

            <div className="industry-info-card">
              <span>Login Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="industry-info-card">
              <span>Industry Role</span>
              <strong>Industry</strong>
            </div>

            <div className="industry-info-card">
              <span>Account Status</span>
              <strong className="industry-account-status">
                Active Session
              </strong>
            </div>

          </div>
        </section>

        {/* WORKSPACE MODULES */}
        <section className="industry-section">

          <div className="industry-section-heading">
            <div>
              <h2>Industry Workspace</h2>
              <p>Access all your industry management modules.</p>
            </div>
          </div>

          <div className="industry-module-grid">

            {menuItems.map((item, index) => (
              <div
                className="industry-module-card"
                key={index}
              >

                <div className="industry-module-icon">
                  {item.icon}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <button
                  onClick={() => navigate(item.path)}
                  className="industry-module-button"
                >
                  Open Module →
                </button>

              </div>
            ))}

          </div>
        </section>

        {/* COLLABORATION SECTION */}
        <section className="industry-collaboration">

          <div>
            <h2>Build Strong Academia–Industry Connections</h2>

            <p>
              Share real-world skill requirements, provide internship
              opportunities and help students become industry-ready.
            </p>
          </div>

          <button
            onClick={() => navigate("/industry-requirements")}
          >
            Add Skill Requirements
          </button>

        </section>

        {/* FOOTER */}
        <footer className="industry-footer">
          Academia–Industry Collaboration Portal
          <span>Industry Workspace</span>
        </footer>

      </main>
    </div>
  );
}

export default IndustryDashboard;
