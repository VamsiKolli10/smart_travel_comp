import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../common/Button";
import useNotification from "../../hooks/useNotification";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get token from URL params (in real app, this would be validated)
  const token = searchParams.get("token");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic validation
      if (!formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Simulate API call - replace with actual password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      setSuccess(true);
      showNotification("Password reset successfully!", "success");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
      showNotification("Failed to reset password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            {/* Success Header */}
            <div className="reset-password-header">
              <div className="reset-password-icon success">✅</div>
              <h1>Password Reset Complete!</h1>
              <p>Your password has been successfully updated.</p>
            </div>

            {/* Success Message */}
            <div className="success-message">
              <h3>What's next?</h3>
              <div className="success-steps">
                <div className="step">
                  <div className="step-icon">🔐</div>
                  <div className="step-content">
                    <strong>Your password is secure</strong>
                    <p>You can now sign in with your new password</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-icon">🛡️</div>
                  <div className="step-content">
                    <strong>Account security</strong>
                    <p>Consider enabling two-factor authentication</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleGoToLogin}
              variant="contained"
              fullWidth
              size="large"
              className="login-button"
            >
              Continue to Login
            </Button>

            {/* Help Text */}
            <div className="help-text">
              <p>
                Having trouble?{" "}
                <Link to="/forgot-password" className="help-link">
                  Request another reset email
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="back-to-home">
            <Link to="/" className="back-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          {/* Header */}
          <div className="reset-password-header">
            <div className="reset-password-icon">🔑</div>
            <h1>Reset Your Password</h1>
            <p>Enter your new password below</p>
          </div>

          {/* Error Alert */}
          {error && <div className="error-alert">{error}</div>}

          {/* Reset Password Form */}
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
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
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("password")}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="password-requirements">
                <small>Password must be at least 6 characters long</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  disabled={loading}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="reset-button"
            >
              {loading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  Updating Password...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Alternative Options */}
          <div className="alternative-options">
            <h3>Need help?</h3>
            <div className="option-buttons">
              <button
                type="button"
                className="option-button"
                onClick={() => navigate("/login")}
              >
                <span className="option-icon">🔙</span>
                Back to Login
              </button>
              <button
                type="button"
                className="option-button"
                onClick={() => navigate("/forgot-password")}
              >
                <span className="option-icon">📧</span>
                Request New Reset
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="reset-password-footer">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="footer-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="back-to-home">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
