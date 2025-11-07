import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const emailHint = location.state?.email || "your account";
  const token = searchParams.get("token");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both password fields");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
      showNotification("Password reset successfully!", "success");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
      showNotification("Failed to reset password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const primaryContent = (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      {token && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Reset link verified. Set a new password for {emailHint}.
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="New password"
        name="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        fullWidth
        disabled={loading}
        helperText="Must be at least 6 characters"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Confirm new password"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        fullWidth
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                edge="end"
                disabled={loading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
        {loading ? "Updating password…" : "Update password"}
      </Button>

      <Stack spacing={1.5} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Need help? <Link to="/forgot-password">Request a new link</Link>
        </Typography>
      </Stack>
    </Stack>
  );

  if (success) {
    return (
      <AuthShell
        icon="✅"
        title="Password reset complete"
        subtitle="You can now sign in with your new password."
        backLink={{ to: "/", label: "← Back to home" }}
        footer={
          <Typography variant="body2" color="text.secondary" align="center">
            For extra security, enable two-factor authentication in your profile settings.
          </Typography>
        }
      >
        <Stack spacing={3}>
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[
              {
                primary: "Sign in",
                secondary: "Use your new password next time you log in.",
              },
              {
                primary: "Stay secure",
                secondary: "Avoid reusing passwords and consider a password manager.",
              },
            ].map((step) => (
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

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate("/login")}
          >
            Continue to login
          </Button>
        </Stack>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon="🛠️"
      title="Reset your password"
      subtitle="Enter a new password you'll remember."
      backLink={{ to: "/", label: "← Back to home" }}
      footer={
        <Typography variant="body2" color="text.secondary" align="center">
          Remember your password? <Link to="/login">Sign in</Link>
        </Typography>
      }
    >
      {primaryContent}
    </AuthShell>
  );
}
