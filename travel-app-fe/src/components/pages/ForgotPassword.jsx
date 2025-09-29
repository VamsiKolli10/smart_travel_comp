import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import useNotification from "../../hooks/useNotification";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic validation
      if (!email) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Simulate API call - replace with actual password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      setSuccess(true);
      showNotification("Password reset email sent successfully!", "success");
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      showNotification(
        "Failed to send reset email. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showNotification("Reset email sent again!", "success");
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            {/* Success Header */}
            <div className="forgot-password-header">
              <div className="forgot-password-icon success">📧</div>
              <h1>Check Your Email</h1>
              <p>We've sent password reset instructions to</p>
              <p className="email-address">{email}</p>
            </div>

            {/* Instructions */}
            <div className="instructions">
              <h3>What's next?</h3>
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Check your email</strong>
                    <p>Look for an email from Travel Companion</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Click the reset link</strong>
                    <p>Open the email and click the reset button</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Create new password</strong>
                    <p>Follow the instructions to set a new password</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                onClick={handleResendEmail}
                variant="outlined"
                fullWidth
                disabled={loading}
                className="resend-button"
              >
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Sending...
                  </div>
                ) : (
                  "Resend Email"
                )}
              </Button>

              <Button
                onClick={() => navigate("/login")}
                variant="contained"
                fullWidth
                className="back-to-login-button"
              >
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <div className="help-text">
              <p>
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="help-link"
                  disabled={loading}
                >
                  try again
                </button>
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
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {/* Header */}
          <div className="forgot-password-header">
            <div className="forgot-password-icon">🔑</div>
            <h1>Forgot Password?</h1>
            <p>
              No worries! Enter your email and we'll send you reset
              instructions.
            </p>
          </div>

          {/* Error Alert */}
          {error && <div className="error-alert">{error}</div>}

          {/* Forgot Password Form */}
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <div className="help-text">
                <small>
                  We'll send password reset instructions to this email
                </small>
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
                  Sending Reset Email...
                </div>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Alternative Options */}
          <div className="alternative-options">
            <h3>Other options</h3>
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
                onClick={() => navigate("/register")}
              >
                <span className="option-icon">👤</span>
                Create New Account
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="forgot-password-footer">
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
