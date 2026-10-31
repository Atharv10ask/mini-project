
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewApplications.css";

const API_URL = "http://localhost:3000";

const statuses = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Selected",
];

function ReviewApplications() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function initialize() {
      const savedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("industry") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("loggedInUser");

      if (!savedUser) {
        navigate("/login", { replace: true });
        return;
      }

      let parsedUser;

      try {
        parsedUser = JSON.parse(savedUser);
      } catch {
        navigate("/login", { replace: true });
        return;
      }

      if (
        !parsedUser.email ||
        String(parsedUser.role || "").toLowerCase() !== "industry"
      ) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(parsedUser);

      await loadCompanyAndApplications(parsedUser.email);
    }

    initialize();
  }, [navigate]);

  async function loadCompanyAndApplications(email) {
    setLoading(true);
    setError("");

    try {
      const profileResponse = await fetch(
        `${API_URL}/company-profile?email=${encodeURIComponent(email)}`
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Could not load company profile."
        );
      }

      const profile =
        profileData.profile ||
        profileData.company ||
        profileData;

      const name =
        profile.companyName ||
        profile.name ||
        profileData.companyName;

      if (!name) {
        throw new Error(
          "Company name not found. Please complete your Company Profile."
        );
      }

      setCompanyName(name);

      const applicationResponse = await fetch(
        `${API_URL}/applications/company?companyName=${encodeURIComponent(name)}`
      );

      const applicationData = await applicationResponse.json();

      if (!applicationResponse.ok) {
        throw new Error(
          applicationData.message || "Could not load applications."
        );
      }

      const records = Array.isArray(applicationData)
        ? applicationData
        : applicationData.applications || [];

      setApplications(records);
    } catch (err) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(applicationId, newStatus) {
    if (!companyName) {
      setError("Company information is missing. Please reload the page.");
      return;
    }

    setUpdatingId(applicationId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            companyName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update application status.");
      }

      const updatedApplication = data.application || data;

      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, ...updatedApplication, status: newStatus }
            : application
        )
      );

      setSelectedApplication((previous) =>
        previous && previous._id === applicationId
          ? { ...previous, ...updatedApplication, status: newStatus }
          : previous
      );
    } catch (err) {
      setError(err.message || "Status update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        application.studentName,
        application.studentEmail,
        application.opportunityTitle,
        application.college,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        filterStatus === "All" ||
        (application.status || "Applied") === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, filterStatus]);

  function getStatusClass(status) {
    return String(status || "Applied")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (!user) {
    return (
      <div className="review-loading">
        Checking industry login...
      </div>
    );
  }

  return (
    <div className="review-page">

      {/* HEADER */}
      <header className="review-header">
        <div>
          <p className="review-eyebrow">INDUSTRY WORKSPACE</p>
          <h1>Review Applications</h1>
          <p>
            Review student applications and manage their selection status.
          </p>
        </div>

        <button
          className="review-back-button"
          onClick={() => navigate("/industry-dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* COMPANY INFORMATION */}
      <section className="review-company-bar">
        <div>
          <span>Company</span>
          <strong>{companyName || "Loading company..."}</strong>
        </div>

        <div>
          <span>Industry Email</span>
          <strong>{user.email}</strong>
        </div>

        <div>
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="review-summary-grid">
        {statuses.map((status) => (
          <div className="review-summary-card" key={status}>
            <span>{status}</span>
            <strong>
              {applications.filter(
                (application) =>
                  (application.status || "Applied") === status
              ).length}
            </strong>
          </div>
        ))}
      </section>

      {/* APPLICATION LIST */}
      <section className="review-content">

        <div className="review-content-heading">
          <div>
            <h2>Student Applications</h2>
            <p>View and manage applications submitted to your company.</p>
          </div>

          <button
            className="review-refresh-button"
            onClick={() => loadCompanyAndApplications(user.email)}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="review-toolbar">
          <input
            type="text"
            placeholder="Search student, email, college or opportunity..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="All">All Applications</option>
            {statuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="review-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="review-message">
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="review-empty">
            <div>📄</div>
            <h3>No Applications Found</h3>
            <p>
              No applications match your search or selected status.
            </p>
          </div>
        ) : (
          <div className="review-table-wrapper">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Opportunity</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <strong>
                        {application.studentName || "Student"}
                      </strong>
                      <span className="review-student-email">
                        {application.studentEmail}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {application.opportunityTitle || "Opportunity"}
                      </strong>
                      <span className="review-secondary">
                        {application.opportunityType || "Job"}
                      </span>
                    </td>

                    <td>{formatDate(application.createdAt)}</td>

                    <td>
                      <span
                        className={`review-status ${getStatusClass(
                          application.status
                        )}`}
                      >
                        {application.status || "Applied"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="review-view-button"
                        onClick={() => setSelectedApplication(application)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="review-result-count">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>

      </section>

      {/* STUDENT DETAILS MODAL */}
      {selectedApplication && (
        <div
          className="review-modal-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="review-modal-header">
              <div>
                <p>APPLICATION DETAILS</p>
                <h2>Student Information</h2>
              </div>

              <button
                className="review-close-button"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>

            <div className="review-modal-body">

              <div className="review-detail-item">
                <span>Student Name</span>
                <strong>
                  {selectedApplication.studentName || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Email</span>
                <strong>
                  {selectedApplication.studentEmail || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>College / University</span>
                <strong>
                  {selectedApplication.college || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Degree</span>
                <strong>
                  {selectedApplication.degree || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Branch</span>
                <strong>
                  {selectedApplication.branch || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Opportunity</span>
                <strong>
                  {selectedApplication.opportunityTitle || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Opportunity Type</span>
                <strong>
                  {selectedApplication.opportunityType || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Location</span>
                <strong>
                  {selectedApplication.location || "Not available"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Stipend / Salary</span>
                <strong>
                  {selectedApplication.stipend || "Not specified"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Applied Date</span>
                <strong>
                  {formatDate(selectedApplication.createdAt)}
                </strong>
              </div>

              <div className="review-detail-item review-skills-item">
                <span>Student Skills</span>

                <div className="review-skills">
                  {Array.isArray(selectedApplication.skills) &&
                  selectedApplication.skills.length > 0 ? (
                    selectedApplication.skills.map((skill, index) => (
                      <span key={index}>
                        {typeof skill === "string"
                          ? skill
                          : skill.skillName || skill.name || "Skill"}
                      </span>
                    ))
                  ) : (
                    <span>No skills provided</span>
                  )}
                </div>
              </div>

              <div className="review-status-update">
                <label htmlFor="application-status">
                  Update Application Status
                </label>

                <select
                  id="application-status"
                  value={selectedApplication.status || "Applied"}
                  disabled={updatingId === selectedApplication._id}
                  onChange={(event) =>
                    updateStatus(
                      selectedApplication._id,
                      event.target.value
                    )
                  }
                >
                  {statuses.map((status) => (
                    <option value={status} key={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingId === selectedApplication._id && (
                  <span>Updating status...</span>
                )}
              </div>

            </div>

            <div className="review-modal-footer">
              <button
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReviewApplications;
