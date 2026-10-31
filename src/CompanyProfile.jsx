import { useState } from "react";
import "./CompanyProfile.css";

const API_URL = "http://localhost:3000/company-profile";

function CompanyProfile() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    industryType: "",
    companySize: "",
    establishedYear: "",
    website: "",
    phone: "",
    location: "",
    description: "",
    technologies: "",
    expertise: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function loadProfile() {
    if (!formData.email.trim()) {
      setMessage("Please enter your company email first.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}?email=${encodeURIComponent(formData.email.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Company profile not found.");
        setMessageType("error");
        return;
      }

      setFormData({
        companyName: data.companyName || "",
        email: data.email || "",
        industryType: data.industryType || "",
        companySize: data.companySize || "",
        establishedYear: data.establishedYear || "",
        website: data.website || "",
        phone: data.phone || "",
        location: data.location || "",
        description: data.description || "",
        technologies: (data.technologies || []).join(", "),
        expertise: (data.expertise || []).join(", ")
      });

      setMessage("Company profile loaded successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage("Cannot connect to the backend. Please start your server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const payload = {
      ...formData,
      establishedYear: Number(formData.establishedYear),
      technologies: formData.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      expertise: formData.expertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to save company profile.");
        setMessageType("error");
        return;
      }

      setMessage("Company profile saved successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage("Cannot connect to the backend. Please start your server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="company-page">
      <div className="company-container">

        <div className="company-header">
          <div>
            <p className="company-subtitle">INDUSTRY ACCOUNT</p>
            <h1>Company Profile</h1>
            <p className="company-description">
              Add your company information to connect with students and universities.
            </p>
          </div>
        </div>

        <form className="company-form" onSubmit={handleSubmit}>

          <div className="company-section">
            <h2>Basic Information</h2>
            <p>Enter your company's basic details.</p>

            <div className="company-grid">

              <div className="company-field">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="company-field">
                <label>Company Email *</label>
                <div className="company-email-row">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    required
                  />
                  <button
                    type="button"
                    className="company-load-btn"
                    onClick={loadProfile}
                    disabled={loading}
                  >
                    Load
                  </button>
                </div>
              </div>

              <div className="company-field">
                <label>Industry Type *</label>
                <select
                  name="industryType"
                  value={formData.industryType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select industry</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="company-field">
                <label>Company Size *</label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select company size</option>
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-200 employees">51-200 employees</option>
                  <option value="201-500 employees">201-500 employees</option>
                  <option value="501-1000 employees">501-1000 employees</option>
                  <option value="1000+ employees">1000+ employees</option>
                </select>
              </div>

              <div className="company-field">
                <label>Established Year *</label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  placeholder="e.g. 2015"
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="company-field">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="company-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="company-field">
                <label>Company Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  required
                />
              </div>

            </div>
          </div>

          <div className="company-section">
            <h2>Company Description</h2>
            <p>Tell students and universities about your company.</p>

            <div className="company-field">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your company, work and goals..."
                rows="5"
                required
              />
            </div>
          </div>

          <div className="company-section">
            <h2>Technologies and Expertise</h2>
            <p>Separate multiple entries using commas.</p>

            <div className="company-field">
              <label>Technologies</label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, Python"
              />
            </div>

            <div className="company-field">
              <label>Areas of Expertise</label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                placeholder="Web Development, AI, Cloud Computing"
              />
            </div>
          </div>

          {message && (
            <div className={`company-message ${messageType}`}>
              {message}
            </div>
          )}

          <div className="company-actions">
            <button
              type="submit"
              className="company-save-btn"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Save Company Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CompanyProfile;