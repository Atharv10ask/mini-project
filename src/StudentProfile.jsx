
import { useState, useEffect } from "react";
import axios from "axios";
import "./StudentProfile.css";

function StudentProfile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    careerGoal: "",
    github: "",
    linkedin: ""
  });

  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let savedEmail = localStorage.getItem("email") || "";
    if (!savedEmail) {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u.email) savedEmail = u.email;
      } catch (e) {}
    }

    if (savedEmail) {
      setProfile((prev) => ({ ...prev, email: savedEmail }));
      axios
        .get(`http://localhost:3000/student-profile?email=${encodeURIComponent(savedEmail)}`)
        .then((res) => {
          if (res.data) {
            const data = res.data;
            setProfile({
              fullName: data.fullName || "",
              email: data.email || savedEmail,
              phone: data.phone || "",
              college: data.college || "",
              degree: data.degree || "",
              branch: data.branch || "",
              graduationYear: data.graduationYear ? String(data.graduationYear) : "",
              careerGoal: data.careerGoal || "",
              github: data.github || "",
              linkedin: data.linkedin || ""
            });
            if (Array.isArray(data.skills) && data.skills.length > 0) {
              setSkills(data.skills);
            }
          }
        })
        .catch(() => {
          // If no profile created yet, just keep the prefilled email
        });
    }
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    const name = skillName.trim();

    setMessage("");
    setIsSuccess(false);

    if (!name) {
      setMessage("Please enter a skill name.");
      return;
    }

    if (skills.length >= 30) {
      setMessage("You can add a maximum of 30 skills.");
      return;
    }

    if (
      skills.some(
        (skill) => skill.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setMessage("This skill has already been added.");
      return;
    }

    setSkills([...skills, { name, level }]);
    setSkillName("");
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
    setMessage("");
    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (skills.length === 0) {
      setMessage("Please add at least one skill.");
      setIsSuccess(false);
      return;
    }

    setIsSaving(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:3000/student-profile",
        {
          ...profile,
          graduationYear: Number(profile.graduationYear),
          skills
        }
      );

      setMessage(
        response.data.message || "Profile saved successfully!"
      );
      setIsSuccess(true);
    } catch (error) {
      const data = error.response?.data;

      if (data?.errors) {
        const errors = Object.values(data.errors).flat();
        setMessage(errors.join(" "));
      } else {
        setMessage(
          data?.message ||
          "Unable to save profile. Please check your backend connection."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="brand">
          Academia<span>Connect</span>
        </div>
        <div className="header-label">Student Portal</div>
      </header>

      <main className="profile-container">
        <div className="profile-heading">
          <p className="eyebrow">STUDENT DASHBOARD</p>
          <h1>Create Your Profile</h1>
          <p>
            Showcase your academic background and skills to
            connect with industry opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon">01</div>
              <div>
                <h2>Personal Information</h2>
                <p>Tell us about yourself.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="field">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="field">
                <label>College / University *</label>
                <input
                  name="college"
                  value={profile.college}
                  onChange={handleChange}
                  placeholder="Enter institution name"
                  required
                />
              </div>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon">02</div>
              <div>
                <h2>Academic Details</h2>
                <p>Add your current educational information.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Degree *</label>
                <select
                  name="degree"
                  value={profile.degree}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select degree</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Branch / Specialization *</label>
                <input
                  name="branch"
                  value={profile.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>

              <div className="field">
                <label>Graduation Year *</label>
                <select
                  name="graduationYear"
                  value={profile.graduationYear}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select year</option>
                  {Array.from(
                    { length: 8 },
                    (_, i) => new Date().getFullYear() + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Interested Job Role</label>
                <input
                  name="careerGoal"
                  value={profile.careerGoal}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                />
              </div>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon">03</div>
              <div>
                <h2>Skills & Expertise</h2>
                <p>Add your technical and professional skills.</p>
              </div>
            </div>

            <div className="skill-entry">
              <div className="field">
                <label>Skill Name</label>
                <input
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. React, Java, MongoDB"
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
              </div>

              <div className="field">
                <label>Proficiency Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <button
                type="button"
                className="add-skill-btn"
                onClick={addSkill}
                disabled={skills.length >= 30}
              >
                + Add Skill
              </button>
            </div>

            <div className="skills-list">
              {skills.length === 0 ? (
                <p className="empty-skills">
                  Your added skills will appear here.
                </p>
              ) : (
                skills.map((skill, index) => (
                  <div className="skill-item" key={skill.name}>
                    <div>
                      <strong>{skill.name}</strong>
                      <span>{skill.level}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove ${skill.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon">04</div>
              <div>
                <h2>Professional Links</h2>
                <p>Help companies explore your work.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>GitHub Profile</label>
                <input
                  type="url"
                  name="github"
                  value={profile.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="field">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={profile.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </section>

          {message && (
            <p
              className="profile-message"
              role="status"
              style={{
                color: isSuccess ? "#16803d" : "#b42318"
              }}
            >
              {message}
            </p>
          )}

          <div className="profile-actions">
            <p>* Required fields</p>
            <button
              type="submit"
              className="save-profile-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving Profile..." : "Save Student Profile →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default StudentProfile;
