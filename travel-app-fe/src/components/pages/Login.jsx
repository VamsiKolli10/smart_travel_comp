import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { auth } from "../../firebase";
import Button from "../common/Button";
import AuthShell from "../layout/AuthShell";
import useNotification from "../../hooks/useNotification";
import { loginWithEmail, resendEmailVerification } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(4),
  boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
  background: `linear-gradient(180deg, ${alpha(
    theme.palette.background.paper,
    0.9
  )} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "& fieldset": {
      borderColor: alpha(theme.palette.divider, 0.5),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
  },
}));

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const { user } = useAuth();
  const redirectPath = useMemo(
    () => location.state?.from?.pathname || "/home",
    [location.state]
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [verificationEmail, setVerificationEmail] = useState(null);
  const [resendingVerification, setResendingVerification] = useState(false);

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
      setVerificationEmail(incomingEmail);
    }
    if (verificationSent) {
      setInfoMessage(
        `We sent a verification link to ${
          incomingEmail || "your email"
        }. Verify it before signing in.`
      );
    }

    // Clear the state to prevent showing the message again
    navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, redirectPath, navigate]);

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
      showNotification("Login successful! Redirecting…", "success");
    } catch (err) {
      if (err?.code === "auth/email-not-verified") {
        const email = err?.email || formData.email;
        setError("Please verify your email before continuing.");
        setVerificationEmail(email);
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

  const handleResendVerification = async () => {
    if (!verificationEmail) return;

    if (!formData.password) {
      showNotification(
        "Enter your password before requesting another verification email.",
        "warning"
      );
      return;
    }

    setResendingVerification(true);
    try {
      await resendEmailVerification({
        user: auth.currentUser ?? undefined,
        email: verificationEmail,
        password: formData.password,
      });

      showNotification(
        "Verification email sent! Please check your inbox.",
        "success"
      );
      setInfoMessage(`We sent another verification link to ${verificationEmail}.`);
    } catch (error) {
      console.error("Resend verification error:", error);
      showNotification(
        "Failed to resend verification email. Please try again.",
        "error"
      );
    } finally {
      setResendingVerification(false);
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
            Don't have an account? <Link to="/register">Create one</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link to="/forgot-password">Forgot your password?</Link>
          </Typography>
        </Stack>
      }
    >
      <AnimatedPaper elevation={0}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                borderRadius: 2,
                animation: "fadeIn 0.3s ease",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              {error}
              {verificationEmail && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    startIcon={
                      resendingVerification ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <EmailIcon fontSize="small" />
                      )
                    }
                  >
                    {resendingVerification
                      ? "Resending..."
                      : "Resend verification email"}
                  </Button>
                </Box>
              )}
            </Alert>
          )}
          {infoMessage && (
            <Alert
              severity="info"
              onClose={() => setInfoMessage("")}
              sx={{
                borderRadius: 2,
                animation: "fadeIn 0.3s ease",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              {infoMessage}
            </Alert>
          )}

          <Box sx={{ position: "relative" }}>
            <StyledTextField
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              autoComplete="email"
              fullWidth
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon
                      color={focusedField === "email" ? "primary" : "action"}
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ position: "relative" }}>
            <StyledTextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              autoComplete="current-password"
              fullWidth
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon
                      color={focusedField === "password" ? "primary" : "action"}
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      sx={{
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transition: "left 0.5s",
              },
              "&:hover::after": {
                left: "100%",
              },
            }}
          >
            {loading ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress size={20} color="inherit" />
                <span>Signing in…</span>
              </Stack>
            ) : (
              "Sign in"
            )}
          </Button>
        </Stack>
      </AnimatedPaper>
    </AuthShell>
  );
}
