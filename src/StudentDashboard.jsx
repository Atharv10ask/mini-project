
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentProfile from "./StudentProfile";
import ExploreOpportunities from "./ExploreOpportunities";
import SkillGapAnalysis from "./SkillGapAnalysis";
import Notifications from "./Notifications";

import "./StudentDashboard.css";

function StudentDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    navigate("/login", { replace: true });
  };

  const renderPage = () => {
    switch (activePage) {
      case "Profile":
        return <StudentProfile />;

      case "Explore Opportunities":
        return <ExploreOpportunities />;

      case "Skill Gap Analysis":
        return <SkillGapAnalysis />;

      case "Notifications":
        return <Notifications />;

      default:
        return (
          <div className="student-welcome">
            <h1>Welcome to Student Dashboard</h1>
            <p>
              Manage your academic and career development in one place.
            </p>

            <div className="student-cards">

              <div
                className="student-card"
                onClick={() => setActivePage("Profile")}
              >
                <h3>My Profile</h3>
                <p>Manage your personal and academic details.</p>
              </div>

              <div
                className="student-card"
                onClick={() => setActivePage("Skill Gap Analysis")}
              >
                <h3>Skill Gap Analysis</h3>
                <p>Identify skills you need to improve.</p>
              </div>

              <div
                className="student-card"
                onClick={() => setActivePage("Explore Opportunities")}
              >
                <h3>Explore Opportunities</h3>
                <p>Find jobs and internships posted by industries.</p>
              </div>

              <div
                className="student-card"
                onClick={() => setActivePage("Notifications")}
              >
                <h3>Notifications</h3>
                <p>Check your latest updates.</p>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="student-layout">

      <aside className="student-sidebar">
        <h2>Student Portal</h2>

        <button
          className={activePage === "Dashboard" ? "active" : ""}
          onClick={() => setActivePage("Dashboard")}
        >
          Dashboard
        </button>

        <button
          className={activePage === "Profile" ? "active" : ""}
          onClick={() => setActivePage("Profile")}
        >
          My Profile
        </button>

        <button
          className={activePage === "Skill Gap Analysis" ? "active" : ""}
          onClick={() => setActivePage("Skill Gap Analysis")}
        >
          Skill Gap Analysis
        </button>

        <button
          className={activePage === "Explore Opportunities" ? "active" : ""}
          onClick={() => setActivePage("Explore Opportunities")}
        >
          Explore Opportunities
        </button>

        <button
          className={activePage === "Notifications" ? "active" : ""}
          onClick={() => setActivePage("Notifications")}
        >
          Notifications
        </button>

        <button
          className="student-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="student-main">
        {renderPage()}
      </main>

    </div>
  );
}

export default StudentDashboard;
