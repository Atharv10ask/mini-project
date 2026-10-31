
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim()) {
      setMessage("Please enter your name or organization name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 4) {
      setMessage("Password must contain at least 4 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!terms) {
      setMessage("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/signup",
        {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          role,
        }
      );

      setMessage(
        (response.data.message || "Account created successfully!") + " Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorList = data.errors.map((err) => err.message).filter(Boolean).join(". ");
        setMessage(errorList || data.message || "Invalid registration details.");
      } else {
        setMessage(
          data?.message ||
          data?.msg ||
          "Registration failed. Please check your backend connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="register-card">
        <section className="hero-panel">
          <div className="brand">
            <div className="brand-logo">
              <svg viewBox="0 0 64 64" fill="none">
                <path
                  d="M4 19 32 5l28 14-28 14L4 19Z"
                  fill="currentColor"
                />
                <path
                  d="M15 25v15c10 9 24 9 34 0V25L32 36 15 25Z"
                  fill="currentColor"
                />
                <path
                  d="M59 21v19"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="59" cy="44" r="4" fill="#56D9FF" />
              </svg>
            </div>

            <div>
              <h2>Academia–Industry</h2>
              <h2>Collaboration Portal</h2>
              <span className="project-id">SIH26044</span>
            </div>
          </div>

          <div className="hero-copy">
            <span className="hero-tag">LEARN · CONNECT · GROW</span>

            <h1>
              Collaborate.
              <br />
              Innovate.
              <br />
              <span>Build the Future.</span>
            </h1>

            <p className="hero-description">
              Connecting students, universities and industries
              to create opportunities, share knowledge and
              drive innovation.
            </p>
          </div>

          <div className="network-art" aria-hidden="true">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>

            <div className="art-building building-one">
              <span></span><span></span><span></span>
            </div>

            <div className="art-building building-two">
              <span></span><span></span><span></span>
            </div>

            <div className="art-building building-three">
              <span></span><span></span><span></span>
            </div>

            <div className="art-cap">✦</div>
            <div className="art-node node-one"></div>
            <div className="art-node node-two"></div>
            <div className="art-node node-three"></div>
            <div className="art-node node-four"></div>
            <div className="art-handshake">↔</div>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">🎓</div>
              <div>
                <h3>Skill Mapping</h3>
                <p>
                  Identify skills, track progress and bridge learning gaps.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">💼</div>
              <div>
                <h3>Internships & Placements</h3>
                <p>
                  Connect talent with real-world industry opportunities.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">🤝</div>
              <div>
                <h3>Collaborative Projects</h3>
                <p>
                  Work together on projects and innovative solutions.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-footer">
            <span>Students</span>
            <b>+</b>
            <span>Universities</span>
            <b>+</b>
            <span>Industries</span>
            <b>=</b>
            <span className="innovation">Innovation</span>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-container">
            <span className="register-tag">CREATE YOUR ACCOUNT</span>

            <h1>Create Your Account</h1>

            <p className="form-description">
              Join the Academia–Industry Collaboration Portal and
              become part of a growing network of learners,
              institutions and industry leaders.
            </p>

            <div className="role-tabs" aria-label="Choose account type">
              <button
                type="button"
                className={role === "Student" ? "role-tab active" : "role-tab"}
                onClick={() => setRole("Student")}
              >
                <span className="role-symbol">♟</span>
                Student
              </button>

              <button
                type="button"
                className={role === "University" ? "role-tab active" : "role-tab"}
                onClick={() => setRole("University")}
              >
                <span className="role-symbol">▤</span>
                University
              </button>

              <button
                type="button"
                className={role === "Industry" ? "role-tab active" : "role-tab"}
                onClick={() => setRole("Industry")}
              >
                <span className="role-symbol">▥</span>
                Industry
              </button>

              <button
                type="button"
                className={role === "Admin" ? "role-tab active" : "role-tab"}
                onClick={() => setRole("Admin")}
              >
                <span className="role-symbol">⚙</span>
                Admin
              </button>
            </div>

            <form onSubmit={signup}>
              <label htmlFor="username">
                Full Name / Organization Name
              </label>

              <div className="input-wrap">
                <span className="input-icon">♙</span>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your name or organization name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <label htmlFor="email">Email Address</label>

              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="password-grid">
                <div>
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">♙</span>
                    <input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">♙</span>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="terms-row">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <a href="#terms">Terms & Conditions</a> and{" "}
                  <a href="#privacy">Privacy Policy</a>
                </span>
              </label>

              {message && (
                <p className="form-message" role="status">
                  {message}
                </p>
              )}

              <button
                className="create-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                <span>→</span>
              </button>
            </form>

            <div className="or-divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>

            <button
              className="google-button"
              type="button"
              onClick={() =>
                setMessage("Google sign-in is not configured yet.")
              }
            >
              <span className="google-mark">G</span>
              Continue with Google
            </button>

            <p className="login-prompt">
              Already have an account?{" "}
              <a href="/login">Login</a>
            </p>

            <p className="form-footnote">
              Academia + Industry + Talent = Innovation
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
