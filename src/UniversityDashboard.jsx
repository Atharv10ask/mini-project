
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UniversityDashboard.css";

function UniversityDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/university/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load student profiles");
        }
        return response.json();
      })
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Could not load students. Please check your backend server.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchText = search.trim().toLowerCase();

    return [
      student.fullName,
      student.email,
      student.college,
      student.degree,
      student.branch,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="university-page">
      <aside className="university-sidebar">
        <div className="university-brand">
          <div className="university-brand-icon">A</div>
          <div>
            <h2>Academia Portal</h2>
            <span>Collaboration Workspace</span>
          </div>
        </div>

        <p className="university-sidebar-label">UNIVERSITY</p>

        <nav className="university-navigation">
          <button
            type="button"
            className="university-nav-item active"
            onClick={() => navigate("/university-dashboard")}
          >
            <span className="university-nav-icon">▦</span>
            Dashboard
          </button>

          <button
            type="button"
            className="university-nav-item"
            onClick={() =>
              document
                .getElementById("university-student-list")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span className="university-nav-icon">♙</span>
            Student Profiles
          </button>

          <button
            type="button"
            className="university-nav-item"
            onClick={() => navigate("/skill-gap")}
          >
            <span className="university-nav-icon">▤</span>
            Skill Gap Analysis
          </button>

          {/* Career Development Navigation */}
          <button
            type="button"
            className="university-nav-item"
            onClick={() => navigate("/career-development")}
          >
            <span className="university-nav-icon">♧</span>
            Career Development
          </button>
        </nav>

        <div className="university-sidebar-footer">
          <span className="university-status-dot" />
          University Workspace
        </div>
      </aside>

      <main className="university-main">
        <header className="university-header">
          <div>
            <p className="university-eyebrow">UNIVERSITY WORKSPACE</p>
            <h1>University Dashboard</h1>
            <p className="university-header-description">
              Manage student profiles, review technical skills, and identify
              industry skill requirements.
            </p>
          </div>

          <button
            type="button"
            className="university-header-button"
            onClick={() => navigate("/skill-gap")}
          >
            View Skill Gap Analysis <span>→</span>
          </button>
        </header>

        <section className="university-stat-card">
          <div>
            <p className="university-stat-label">
              Total Registered Students
            </p>
            <h2>{loading ? "—" : students.length}</h2>
            <p className="university-stat-caption">
              Student profiles available in the system
            </p>
          </div>

          <div className="university-stat-icon">♙</div>
        </section>

        <section className="university-analysis-card">
          <div className="university-analysis-icon">↗</div>

          <div className="university-analysis-content">
            <p className="university-card-eyebrow">SKILLS AND INDUSTRY</p>
            <h2>Skill Gap Analysis</h2>
            <p>
              Compare student skills with industry requirements, find missing
              skills, and identify areas that need additional training.
            </p>
          </div>

          <button
            type="button"
            className="university-analysis-button"
            onClick={() => navigate("/skill-gap")}
          >
            Open Analysis <span>→</span>
          </button>
        </section>

        {/* Student Profiles */}
        <section
          className="university-students-card"
          id="university-student-list"
        >
          <div className="university-list-header">
            <div>
              <h2>All Students</h2>
              <p>Review student details and technical skills.</p>
            </div>

            <div className="university-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search students..."
                aria-label="Search students by name, email, college, degree or branch"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="university-feedback">
              Loading student profiles...
            </div>
          )}

          {!loading && error && (
            <div className="university-feedback university-feedback-error">
              {error}
            </div>
          )}

          {!loading && !error && filteredStudents.length === 0 && (
            <div className="university-feedback">
              {search
                ? "No students match your search."
                : "No student profiles found yet."}
            </div>
          )}

          {!loading && !error && filteredStudents.length > 0 && (
            <div className="university-table-container">
              <table className="university-table">
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>COLLEGE</th>
                    <th>DEGREE / BRANCH</th>
                    <th>SKILLS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id || student.email}>
                      <td>
                        <div className="university-student-cell">
                          <div className="university-avatar">
                            {(student.fullName || "S")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="university-student-details">
                            <strong>
                              {student.fullName || "Unnamed Student"}
                            </strong>
                            <span>
                              {student.email || "No email provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{student.college || "Not provided"}</td>

                      <td>
                        <div className="university-degree-details">
                          <strong>{student.degree || "Not provided"}</strong>
                          <span>
                            {student.branch || "Branch not provided"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="university-skill-count">
                          {Array.isArray(student.skills)
                            ? student.skills.length
                            : 0}{" "}
                          skills
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="university-view-button"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Student Profile Modal */}
        {selectedStudent && (
          <div
            className="university-modal-backdrop"
            onClick={() => setSelectedStudent(null)}
          >
            <section
              className="university-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Student profile details"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="university-modal-header">
                <div>
                  <p className="university-eyebrow">STUDENT PROFILE</p>
                  <h2>{selectedStudent.fullName || "Student Profile"}</h2>
                  <p>{selectedStudent.email}</p>
                </div>

                <button
                  type="button"
                  className="university-close-button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Close profile"
                >
                  ×
                </button>
              </div>

              <div className="university-profile-grid">
                <div>
                  <span>Phone</span>
                  <strong>{selectedStudent.phone || "Not provided"}</strong>
                </div>

                <div>
                  <span>College</span>
                  <strong>{selectedStudent.college || "Not provided"}</strong>
                </div>

                <div>
                  <span>Degree</span>
                  <strong>{selectedStudent.degree || "Not provided"}</strong>
                </div>

                <div>
                  <span>Branch</span>
                  <strong>{selectedStudent.branch || "Not provided"}</strong>
                </div>

                <div>
                  <span>Graduation Year</span>
                  <strong>
                    {selectedStudent.graduationYear || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Career Goal</span>
                  <strong>
                    {selectedStudent.careerGoal || "Not provided"}
                  </strong>
                </div>
              </div>

              <h3 className="university-modal-section-title">
                Technical Skills
              </h3>

              {Array.isArray(selectedStudent.skills) &&
              selectedStudent.skills.length > 0 ? (
                <div className="university-modal-skills">
                  {selectedStudent.skills.map((skill, index) => (
                    <div
                      className="university-modal-skill"
                      key={`${skill.skillName || skill.name || "skill"}-${index}`}
                    >
                      <strong>
                        {skill.skillName || skill.name || "Unnamed Skill"}
                      </strong>
                      <span>{skill.level || "Not specified"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="university-no-skills">
                  No technical skills added yet.
                </p>
              )}

              <div className="university-profile-links">
                {selectedStudent.github && (
                  <a
                    href={selectedStudent.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub Profile ↗
                  </a>
                )}

                {selectedStudent.linkedin && (
                  <a
                    href={selectedStudent.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn Profile ↗
                  </a>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default UniversityDashboard;
