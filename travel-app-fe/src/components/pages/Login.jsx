import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import BackHomeButton from "../common/BackHomeButton";
import useNotification from "../../hooks/useNotification";
import { loginWithEmail } from "../../services/auth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (!formData.email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      await loginWithEmail(formData.email, formData.password);

      showNotification("Login successful! Welcome back.", "success");
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
      showNotification("Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      {/* ✅ Back Home button on top-left */}
      <BackHomeButton />

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h1>Welcome</h1>
            <p>Sign in to your Travel Companion account</p>
          </div>

          {/* Error Alert */}
          {error && <div className="error-alert">{error}</div>}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Demo Credentials */}
          <div className="demo-credentials">
            <h3>Demo Credentials:</h3>
            <div className="demo-info">
              <p>
                <strong>Email:</strong> demo@travelcompanion.com
              </p>
              <p>
                <strong>Password:</strong> demo123
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="footer-link">
                Sign up here
              </Link>
            </p>

            <p>
              <Link to="/forgot-password" className="footer-link secondary">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
