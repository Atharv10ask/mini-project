
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Explore.css";

const API_URL = "http://localhost:3000";

// Convert MongoDB opportunity data into the format used by this page.
function normalizeOpportunity(item) {
  const skills = Array.isArray(item.requiredSkills)
    ? item.requiredSkills
        .map((skill) =>
          typeof skill === "string" ? skill : skill?.skillName
        )
        .filter(Boolean)
    : [];

  const company =
    item.companyName || item.company || "Industry Partner";

  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return {
    id: String(item._id || item.id),
    company,
    initials: initials || "CO",
    title: item.title || "Untitled opportunity",
    type: item.type || "Internship",
    location: item.location || "Not specified",
    workMode: item.workMode || "Not specified",
    duration: item.type === "Job" ? "Full-time" : "Internship",
    stipend: item.compensation || "Not specified",
    domain: item.domain || "Other",
    skills,
    description: item.description || "No description provided.",
    eligibility: item.eligibility || "Not specified",
    openings: item.openings ?? "Not specified",
    deadline: item.deadline || "",
    color: item.type === "Job" ? "green" : "blue",
  };
}

// Read saved login information from localStorage.
function readStoredJson(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// Get the currently logged-in student.
function getSignedInUser() {
  const user =
    readStoredJson("student") ||
    readStoredJson("user") ||
    readStoredJson("loggedInUser");

  if (
    user &&
    typeof user === "object" &&
    (user.email || user._id || user.id || user.username)
  ) {
    return user;
  }

  return null;
}

// Convert profile skills into a consistent format.
function normalizeSkills(profile) {
  if (!profile) return [];

  const rawSkills = Array.isArray(profile)
    ? profile
    : profile.skills;

  if (!Array.isArray(rawSkills)) return [];

  return rawSkills
    .map((skill) => {
      if (typeof skill === "string") {
        return {
          skillName: skill.trim(),
          level: "Not specified",
        };
      }

      if (!skill || typeof skill !== "object") {
        return null;
      }

      return {
        skillName: String(
          skill.skillName || skill.name || skill.skill || ""
        ).trim(),
        level: String(
          skill.level || skill.proficiency || "Not specified"
        ),
      };
    })
    .filter((skill) => skill && skill.skillName);
}

function Explore() {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [activeTab, setActiveTab] = useState("Internship");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [domain, setDomain] = useState("All Domains");

  const [opportunities, setOpportunities] = useState([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState("");

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applying, setApplying] = useState(false);

  const [student, setStudent] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentSkills, setStudentSkills] = useState([]);

  const [showSkills, setShowSkills] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState("");
  const [notice, setNotice] = useState("");

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationError, setNotificationError] = useState("");

  // Load live opportunities posted by companies from MongoDB.
  useEffect(() => {
    const controller = new AbortController();

    async function loadOpportunities() {
      try {
        setOpportunitiesLoading(true);
        setOpportunitiesError("");

        const response = await fetch(`${API_URL}/opportunities`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load opportunities."
          );
        }

        const records = Array.isArray(data)
          ? data
          : Array.isArray(data.opportunities)
            ? data.opportunities
            : [];

        setOpportunities(records.map(normalizeOpportunity));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Load opportunities error:", error);

          setOpportunitiesError(
            error.message ||
              "Could not connect to the opportunities server."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setOpportunitiesLoading(false);
        }
      }
    }

    loadOpportunities();

    return () => controller.abort();
  }, [routerLocation.pathname]);

  // Load the student's saved profile and skills from MongoDB.
  const loadStudentProfile = async (currentUser) => {
    if (!currentUser?.email) {
      setStudentProfile(null);
      setStudentSkills([]);
      setSkillsError(
        "Student email not found. Please log in again."
      );
      return;
    }

    setSkillsLoading(true);
    setSkillsError("");

    try {
      const response = await fetch(
        `${API_URL}/student-profile?email=${encodeURIComponent(
          currentUser.email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load the student profile."
        );
      }

      const profile = Array.isArray(data) ? data[0] : data;

      if (!profile) {
        setStudentProfile(null);
        setStudentSkills([]);
        setSkillsError(
          "Student profile not found. Please create your profile."
        );
        return;
      }

      setStudentProfile(profile);
      setStudentSkills(normalizeSkills(profile));

      localStorage.setItem(
        "studentProfile",
        JSON.stringify(profile)
      );

      setStudent((previous) => ({
        ...(previous || currentUser),
        fullName:
          profile.fullName ||
          previous?.fullName ||
          currentUser.fullName,
        email: profile.email || currentUser.email,
      }));
    } catch (error) {
      setStudentProfile(null);
      setStudentSkills([]);

      setSkillsError(
        error.message ||
          "Could not connect to the backend. Please check your server."
      );
    } finally {
      setSkillsLoading(false);
    }
  };

  // Load applications submitted by this student from MongoDB.
  const loadStudentApplications = async (currentUser) => {
    if (!currentUser?.email) {
      setApplications([]);
      return;
    }

    setApplicationsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/applications/student?email=${encodeURIComponent(
          currentUser.email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your applications."
        );
      }

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.applications)
          ? data.applications
          : [];

      setApplications(records);
    } catch (error) {
      console.error("Load applications error:", error);
      setNotice(
        error.message || "Could not load your applications."
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Load the logged-in student, profile, and applications.
  useEffect(() => {
    const currentUser = getSignedInUser();

    setStudent(currentUser);

    if (currentUser?.email) {
      loadStudentProfile(currentUser);
      loadStudentApplications(currentUser);
    } else {
      setApplications([]);
    }
  }, []);

  // Load unread notifications from the backend.
  useEffect(() => {
    const currentUser = getSignedInUser();
    const controller = new AbortController();

    async function loadNotifications() {
      if (!currentUser?.email) {
        setNotificationCount(0);
        setNotificationError("");
        return;
      }

      try {
        setNotificationError("");

        const response = await fetch(
          `${API_URL}/notifications?email=${encodeURIComponent(
            currentUser.email
          )}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load notifications."
          );
        }

        const notifications = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
            ? data.notifications
            : [];

        setNotificationCount(
          notifications.filter(
            (notification) => !notification.isRead
          ).length
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setNotificationError(error.message);
        }
      }
    }

    loadNotifications();

    return () => controller.abort();
  }, [routerLocation.pathname]);

  // Show or hide the student's saved skills.
  const handleShowSkills = () => {
    if (showSkills) {
      setShowSkills(false);
      return;
    }

    setShowSkills(true);

    const currentUser = getSignedInUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setStudent(currentUser);
    loadStudentProfile(currentUser);
  };

  // Filter opportunities using search, type, location, and domain.
  const filteredOpportunities = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return opportunities.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.company.toLowerCase().includes(searchText) ||
        item.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        ) ||
        item.location.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText);

      return (
        matchesSearch &&
        item.type === activeTab &&
        (location === "All Locations" ||
          item.location === location) &&
        (domain === "All Domains" || item.domain === domain)
      );
    });
  }, [opportunities, activeTab, search, location, domain]);

  const availableLocations = useMemo(
    () => [
      ...new Set(
        opportunities.map((item) => item.location).filter(Boolean)
      ),
    ],
    [opportunities]
  );

  const availableDomains = useMemo(
    () => [
      ...new Set(
        opportunities.map((item) => item.domain).filter(Boolean)
      ),
    ],
    [opportunities]
  );

  // Convert opportunity IDs to strings for consistent comparison.
  const appliedIds = applications.map((application) =>
    String(application.opportunityId)
  );

  // Submit an application to MongoDB.
  const handleApply = async (opportunity) => {
    const currentUser = getSignedInUser();

    if (!currentUser?.email) {
      navigate("/login", {
        state: {
          from: "/explore-opportunities",
          opportunityId: opportunity.id,
          message: "Please log in to apply for this opportunity.",
        },
      });
      return;
    }

    const alreadyApplied = applications.some(
      (application) =>
        String(application.opportunityId) === String(opportunity.id)
    );

    if (alreadyApplied) {
      setNotice("You have already applied for this opportunity.");
      return;
    }

    setApplying(true);
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opportunityId: String(opportunity.id),
          opportunityTitle: opportunity.title,
          opportunityType: opportunity.type,
          companyName: opportunity.company,
          location: opportunity.location,
          stipend: opportunity.stipend,
          studentEmail: currentUser.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Application submission failed."
        );
      }

      if (!data.application) {
        throw new Error(
          "The application was submitted, but the server response was incomplete."
        );
      }

      // Update the page with the application returned by MongoDB.
      setApplications((previous) => [
        data.application,
        ...previous,
      ]);

      setSelectedOpportunity(null);

      setNotice(
        "Application submitted successfully. Your application is saved in MongoDB."
      );
    } catch (error) {
      console.error("Application submission error:", error);

      setNotice(
        error.message || "Unable to submit your application."
      );
    } finally {
      setApplying(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("All Locations");
    setDomain("All Domains");
  };

  // Log out the student.
  const handleLogout = () => {
    [
      "student",
      "user",
      "loggedInUser",
      "token",
      "authToken",
      "studentToken",
    ].forEach((key) => localStorage.removeItem(key));

    setStudent(null);
    setStudentProfile(null);
    setStudentSkills([]);
    setApplications([]);
    setNotificationCount(0);

    navigate("/login");
  };

  return (
    <div className="opportunities-page">
      <aside className="op-sidebar">
        <Link to="/student-dashboard" className="op-brand">
          <div className="op-brand-icon">🎓</div>

          <div>
            <h2>Academia–Industry</h2>
            <p>Collaboration Portal</p>
          </div>
        </Link>

        <nav className="op-nav" aria-label="Student navigation">
          <Link to="/student-dashboard">
            ⌂ <span>Dashboard</span>
          </Link>

          <Link to="/student-profile">
            ♙ <span>Profile</span>
          </Link>

          <button type="button" onClick={handleShowSkills}>
            ⚙ <span>My Skills</span>
          </button>

          <Link
            to="/explore-opportunities"
            className={
              routerLocation.pathname === "/explore-opportunities"
                ? "active"
                : ""
            }
          >
            ▣ <span>Explore Opportunities</span>
          </Link>

          <Link to="/my-applications">
            ▤ <span>My Applications</span>
          </Link>

          <Link
            to="/notifications"
            className={
              routerLocation.pathname === "/notifications"
                ? "active"
                : ""
            }
            aria-label={`Notifications${
              notificationCount > 0
                ? `, ${notificationCount} unread`
                : ""
            }`}
          >
            <span className="op-notification-nav-icon">♧</span>
            <span>Notifications</span>

            {notificationCount > 0 && (
              <span className="op-notification-badge">
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          type="button"
          className="op-logout"
          onClick={
            student ? handleLogout : () => navigate("/login")
          }
        >
          ↪ <span>{student ? "Logout" : "Login"}</span>
        </button>
      </aside>

      <main className="op-main">
        <header className="op-header">
          <div>
            <span className="op-header-label">STUDENT PORTAL</span>
            <h2>Explore Opportunities</h2>
          </div>

          <button
            type="button"
            className="op-user"
            onClick={() =>
              navigate(student ? "/student-profile" : "/login")
            }
            aria-label="Open student profile"
          >
            <div className="op-avatar">
              {(
                studentProfile?.fullName ||
                student?.fullName ||
                student?.username ||
                "S"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="op-user-text">
              <strong>
                {studentProfile?.fullName ||
                  student?.fullName ||
                  student?.username ||
                  "Student Account"}
              </strong>
              <span>View account</span>
            </div>

            <span className="op-user-arrow">↗</span>
          </button>
        </header>

        {notice && (
          <div className="op-notice" role="status">
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {notificationError && (
          <div className="op-notice" role="status">
            <span>
              Notification count could not be refreshed. Open
              Notifications to check the connection.
            </span>

            <button
              type="button"
              onClick={() => setNotificationError("")}
              aria-label="Dismiss notification message"
            >
              ×
            </button>
          </div>
        )}

        {showSkills && (
          <section className="op-skills-panel">
            <div className="op-skills-panel-heading">
              <div>
                <span className="op-header-label">
                  STUDENT PROFILE
                </span>
                <h2>My Skills</h2>
              </div>

              <button
                type="button"
                className="op-panel-close"
                onClick={() => setShowSkills(false)}
                aria-label="Close skills"
              >
                ×
              </button>
            </div>

            {skillsLoading ? (
              <p>Loading your profile and skills...</p>
            ) : skillsError ? (
              <div className="op-skills-empty">
                <p>{skillsError}</p>

                <button
                  type="button"
                  onClick={() =>
                    loadStudentProfile(getSignedInUser())
                  }
                >
                  Try again
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      student ? "/student-profile" : "/login"
                    )
                  }
                >
                  Open my profile
                </button>
              </div>
            ) : studentProfile ? (
              <>
                <div className="op-profile-summary">
                  <p>
                    <strong>Name:</strong>{" "}
                    {studentProfile.fullName || "Not provided"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {studentProfile.email || "Not provided"}
                  </p>

                  <p>
                    <strong>College:</strong>{" "}
                    {studentProfile.college || "Not provided"}
                  </p>

                  <p>
                    <strong>Degree:</strong>{" "}
                    {studentProfile.degree || "Not provided"}
                  </p>

                  <p>
                    <strong>Branch:</strong>{" "}
                    {studentProfile.branch || "Not provided"}
                  </p>
                </div>

                <h3>Saved skills</h3>

                {studentSkills.length > 0 ? (
                  <div className="op-saved-skills">
                    {studentSkills.map((skill, index) => (
                      <div
                        className="op-saved-skill"
                        key={`${skill.skillName}-${index}`}
                      >
                        <strong>{skill.skillName}</strong>
                        <span>{skill.level}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="op-skills-empty">
                    <p>
                      Your profile exists, but no skills have
                      been saved yet.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/student-profile")
                      }
                    >
                      Add skills to my profile
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/student-profile")}
                >
                  Open full profile
                </button>
              </>
            ) : (
              <div className="op-skills-empty">
                <p>No student profile was loaded.</p>

                <button
                  type="button"
                  onClick={() =>
                    loadStudentProfile(getSignedInUser())
                  }
                >
                  Load profile
                </button>
              </div>
            )}
          </section>
        )}

        <section className="op-hero">
          <div className="op-hero-content">
            <span className="op-eyebrow">
              YOUR CAREER STARTS HERE
            </span>

            <h1>Find your next opportunity.</h1>

            <p>
              Explore internships and jobs from industry partners.
              Discover roles that match your skills and career goals.
            </p>

            <div className="op-hero-stats">
              <div>
                <strong>{opportunities.length}</strong>
                <span>Available opportunities</span>
              </div>

              <div>
                <strong>{applications.length}</strong>
                <span>Applications tracked</span>
              </div>
            </div>
          </div>

          <div className="op-hero-art" aria-hidden="true">
            <div className="op-art-circle">↗</div>

            <div className="op-art-card">
              <span>CAREER GROWTH</span>

              <div className="op-art-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              <strong>Make it happen.</strong>
            </div>

            <div className="op-art-orbit" />
          </div>
        </section>

        <section className="op-workspace">
          <div className="op-section-heading">
            <div>
              <h2>Discover opportunities</h2>
              <p>
                Find the right role for your skills and interests.
              </p>
            </div>

            <Link
              className="op-applications-link"
              to="/my-applications"
            >
              <span>✓</span> {applications.length} applied · Track
              applications
            </Link>
          </div>

          <div className="op-search-row">
            <label className="op-search">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search job title, company, skills..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              aria-label="Filter by location"
            >
              <option value="All Locations">All Locations</option>

              {availableLocations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              aria-label="Filter by domain"
            >
              <option value="All Domains">All Domains</option>

              {availableDomains.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="op-clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>

          <div className="op-tabs">
            <button
              type="button"
              className={
                activeTab === "Internship" ? "selected" : ""
              }
              onClick={() => setActiveTab("Internship")}
            >
              Internships
            </button>

            <button
              type="button"
              className={activeTab === "Job" ? "selected" : ""}
              onClick={() => setActiveTab("Job")}
            >
              Full-time jobs
            </button>

            <span>{filteredOpportunities.length} results</span>
          </div>

          {opportunitiesError && (
            <div className="op-notice" role="alert">
              <span>{opportunitiesError}</span>

              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {opportunitiesLoading ? (
            <div className="op-empty">
              <h3>Loading opportunities...</h3>
              <p>
                Please wait while we fetch the latest listings.
              </p>
            </div>
          ) : (
            <div className="op-card-grid">
              {filteredOpportunities.map((item) => {
                const alreadyApplied = appliedIds.includes(
                  String(item.id)
                );

                return (
                  <article className="op-card" key={item.id}>
                    <div className="op-card-top">
                      <div
                        className={`op-company-logo ${item.color}`}
                      >
                        {item.initials}
                      </div>

                      <div className="op-company-info">
                        <strong>{item.company}</strong>
                        <span>Industry opportunity</span>
                      </div>

                      <span className="op-type">{item.type}</span>
                    </div>

                    <h3>{item.title}</h3>

                    <div className="op-meta">
                      <span>⌖ {item.location}</span>
                      <span>◷ {item.workMode}</span>
                      <span>Openings: {item.openings}</span>
                    </div>

                    <p className="op-description">
                      {item.description}
                    </p>

                    <div className="op-skills">
                      {item.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>

                    <div className="op-card-bottom">
                      <div className="op-pay">
                        <span>
                          {item.type === "Job" ? "Salary" : "Stipend"}
                        </span>

                        <strong>{item.stipend}</strong>
                      </div>

                      <button
                        type="button"
                        className="op-details-btn"
                        onClick={() =>
                          setSelectedOpportunity(item)
                        }
                      >
                        View details ↗
                      </button>
                    </div>

                    {alreadyApplied && (
                      <div className="op-applied-status">
                        ✓ Application submitted · Applied
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {!opportunitiesLoading &&
            !opportunitiesError &&
            filteredOpportunities.length === 0 && (
              <div className="op-empty">
                <div>⌕</div>
                <h3>No opportunities found</h3>

                <p>
                  Try another search term or change your filters.
                </p>

                <button type="button" onClick={clearFilters}>
                  Reset filters
                </button>
              </div>
            )}
        </section>

        <footer className="op-footer">
          <span>Academia–Industry Collaboration Portal</span>
          <span>Connecting skills with opportunities.</span>
        </footer>
      </main>

      {selectedOpportunity && (
        <div
          className="op-modal-backdrop"
          onClick={() => {
            if (!applying) setSelectedOpportunity(null);
          }}
        >
          <section
            className="op-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="op-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="op-modal-close"
              onClick={() => setSelectedOpportunity(null)}
              aria-label="Close details"
              disabled={applying}
            >
              ×
            </button>

            <div
              className={`op-company-logo ${selectedOpportunity.color}`}
            >
              {selectedOpportunity.initials}
            </div>

            <span className="op-modal-label">
              {selectedOpportunity.type} opportunity
            </span>

            <h2 id="op-modal-title">
              {selectedOpportunity.title}
            </h2>

            <p className="op-modal-company">
              {selectedOpportunity.company}
            </p>

            <div className="op-modal-facts">
              <div>
                <span>Location</span>
                <strong>{selectedOpportunity.location}</strong>
              </div>

              <div>
                <span>Work mode</span>
                <strong>{selectedOpportunity.workMode}</strong>
              </div>

              <div>
                <span>
                  {selectedOpportunity.type === "Job"
                    ? "Salary"
                    : "Stipend"}
                </span>
                <strong>{selectedOpportunity.stipend}</strong>
              </div>

              <div>
                <span>Openings</span>
                <strong>{selectedOpportunity.openings}</strong>
              </div>

              <div>
                <span>Application deadline</span>
                <strong>
                  {selectedOpportunity.deadline
                    ? new Date(
                        selectedOpportunity.deadline
                      ).toLocaleDateString()
                    : "Not specified"}
                </strong>
              </div>
            </div>

            <h3>About this opportunity</h3>
            <p>{selectedOpportunity.description}</p>

            <h3>Eligibility</h3>
            <p>{selectedOpportunity.eligibility}</p>

            <h3>Required skills</h3>

            <div className="op-skills op-modal-skills">
              {selectedOpportunity.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <button
              type="button"
              className="op-apply-btn"
              onClick={() => handleApply(selectedOpportunity)}
              disabled={
                applying ||
                appliedIds.includes(
                  String(selectedOpportunity.id)
                )
              }
            >
              {applying
                ? "Submitting application..."
                : appliedIds.includes(
                      String(selectedOpportunity.id)
                    )
                  ? "Already applied"
                  : student
                    ? "Apply for this opportunity →"
                    : "Log in to apply →"}
            </button>

            <p className="op-demo-note">
              Your application is submitted to the server and stored
              in MongoDB. You can track its status from My Applications.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default Explore;
