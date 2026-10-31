
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "http://localhost:3000";

function Login() {
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      const data = response.data;

      const loggedInUser = {
        ...(data.user || {}),
        email: data.user?.email || email.trim().toLowerCase(),
        role: data.user?.role || role,
      };

      // Verify selected account type
      if (
        String(loggedInUser.role).toLowerCase() !==
        role.toLowerCase()
      ) {
        throw new Error("Account role does not match selected role.");
      }

      // Clear previous login information
      localStorage.removeItem("user");
      localStorage.removeItem("student");
      localStorage.removeItem("industry");
      localStorage.removeItem("university");
      localStorage.removeItem("admin");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("token");

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem("email", loggedInUser.email);
      localStorage.setItem("role", loggedInUser.role);

      // Save role-specific information
      const normalizedRole = loggedInUser.role.toLowerCase();

      if (normalizedRole === "student") {
        localStorage.setItem(
          "student",
          JSON.stringify(loggedInUser)
        );
      }

      if (normalizedRole === "industry") {
        localStorage.setItem(
          "industry",
          JSON.stringify(loggedInUser)
        );
      }

      if (normalizedRole === "university") {
        localStorage.setItem(
          "university",
          JSON.stringify(loggedInUser)
        );
      }

      if (normalizedRole === "admin") {
        localStorage.setItem(
          "admin",
          JSON.stringify(loggedInUser)
        );
      }

      // Save authentication token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert(data.message || "Login successful!");

      // Redirect according to role
      switch (normalizedRole) {

        case "student":
          navigate("/student-dashboard", {
            replace: true,
          });
          break;

        case "industry":
          navigate("/industry-dashboard", {
            replace: true,
          });
          break;

        case "university":
          navigate("/university-dashboard", {
            replace: true,
          });
          break;

        case "admin":
          navigate("/admin-dashboard", {
            replace: true,
          });
          break;

        default:
          navigate("/login", {
            replace: true,
          });
      }

    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-brand">
        <h1>
          Academia<span>Connect</span>
        </h1>

        <p>Bridging Education and Industry</p>

        <div className="brand-message">
          <h2>Turn Your Skills Into Opportunities.</h2>

          <p>
            Connect with universities, discover internships,
            and build your professional future.
          </p>
        </div>

        <div className="brand-footer">
          SKILLS · OPPORTUNITIES · CAREERS
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card">

          <div className="login-heading">
            <span className="login-tag">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>Enter your details to continue.</p>
          </div>

          <form onSubmit={handleLogin}>

            <label htmlFor="role">
              Account type
            </label>

            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Student">Student</option>
              <option value="Industry">Industry</option>
              <option value="University">University</option>
              <option value="Admin">Admin</option>
            </select>

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <span>→</span>}
            </button>

          </form>

          <div className="login-register">
            Don't have an account?
            <Link to="/register">
              {" "}Create account
            </Link>
          </div>

          <div className="login-bottom">
            Academia–Industry Collaboration Portal
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;
