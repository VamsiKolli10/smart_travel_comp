import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import Button from "../common/Button";
import AuthShell from "../layout/AuthShell";
import useNotification from "../../hooks/useNotification";
import { loginWithEmail } from "../../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (infoMessage) setInfoMessage("");
  };

  useEffect(() => {
    if (!location.state) return;
    const { email: incomingEmail, verificationSent } = location.state;
    if (incomingEmail) {
      setFormData((prev) => ({ ...prev, email: incomingEmail }));
    }
    if (verificationSent) {
      setInfoMessage(
        `We sent a verification link to ${incomingEmail || "your email"}. Verify it before signing in.`
      );
    }
    navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  const validate = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }
    if (!formData.email.includes("@")) {
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
      await loginWithEmail(formData.email, formData.password);
      showNotification("Login successful! Welcome back.", "success");
      navigate("/home");
    } catch (err) {
      if (err?.code === "auth/email-not-verified") {
        const email = err?.email || formData.email;
        setError("Please verify your email before continuing.");
        setInfoMessage(
          `We just re-sent a verification email to ${email}. Check your inbox or spam folder, then sign in.`
        );
        showNotification("Verify your email to continue.", "warning");
      } else {
        setError("Login failed. Please check your credentials and try again.");
        showNotification("Login failed. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      icon="🔐"
      title="Welcome back"
      subtitle="Sign in to access your Smart Travel Companion dashboard."
      backLink={{ to: "/", label: "← Back to home" }}
      footer={
        <Stack spacing={1.5} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link to="/forgot-password">Forgot your password?</Link>
          </Typography>
        </Stack>
      }
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}
        {infoMessage && (
          <Alert
            severity="info"
            onClose={() => setInfoMessage("")}
            sx={{ borderRadius: 2 }}
          >
            {infoMessage}
          </Alert>
        )}

        <TextField
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          fullWidth
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </Stack>
    </AuthShell>
  );
}
