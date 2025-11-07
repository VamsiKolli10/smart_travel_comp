import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Button from "../common/Button";
import AuthShell from "../layout/AuthShell";
import useNotification from "../../hooks/useNotification";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Please enter your email address");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      showNotification("Password reset email sent successfully!", "success");
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      showNotification("Failed to send reset email. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      showNotification("Reset email sent again!", "success");
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        icon="📧"
        title="Check your email"
        subtitle={`We've sent password reset instructions to ${email}`}
        backLink={{ to: "/", label: "← Back to home" }}
        footer={
          <Typography variant="body2" color="text.secondary" align="center">
            Ready to continue? <Link to="/login">Return to sign in</Link>
          </Typography>
        }
      >
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Follow the steps below to finish resetting your password.
          </Typography>
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              {
                primary: "Check your inbox",
                secondary: "Look for an email from Smart Travel Companion.",
              },
              {
                primary: "Open the reset link",
                secondary: "Click the button inside the email to pick a new password.",
              },
              {
                primary: "Create your password",
                secondary: "Enter a strong password you'll remember and confirm it.",
              },
            ].map((step, index) => (
              <ListItem
                key={step.primary}
                sx={{
                  border: "1px solid rgba(94,82,64,0.12)",
                  borderRadius: 2,
                  alignItems: "flex-start",
                  gap: 2,
                  p: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ fontWeight: 600, minWidth: 24 }}
                >
                  {index + 1}
                </Typography>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {step.primary}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {step.secondary}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResend}
              disabled={loading}
            >
              {loading ? "Sending…" : "Resend email"}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/reset-password", { state: { email } })}
            >
              Continue to reset
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Stack>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon="🔑"
      title="Forgot password?"
      subtitle="Enter the email linked to your account and we’ll send a reset link."
      backLink={{ to: "/", label: "← Back to home" }}
      footer={
        <Typography variant="body2" color="text.secondary" align="center">
          Remember your password? <Link to="/login">Sign in</Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={3} onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          autoComplete="email"
          fullWidth
          disabled={loading}
          helperText="We’ll send password reset instructions to this email."
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? "Sending reset email…" : "Send reset email"}
        </Button>

        <Stack spacing={1.5} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Need help? <Link to="/register">Create a new account</Link>
          </Typography>
        </Stack>
      </Stack>
    </AuthShell>
  );
}
