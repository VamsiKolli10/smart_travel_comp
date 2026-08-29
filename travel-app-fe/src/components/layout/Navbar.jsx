import { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  alpha,
  Divider,
} from "@mui/material";
import { NavLink, Link, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import LogoutButton from "../../components/common/LogoutButton";
import { useSelector } from "react-redux";
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from "@mui/icons-material";
import { useAppearance } from "../../contexts/AppearanceContext.jsx";

const NAV_LINKS = [
  { label: "Home", to: "/home" },
  { label: "Translation", to: "/translation" },
  { label: "Phrasebook", to: "/phrasebook" },
  { label: "Stays", to: "/stays" },
  { label: "Emergency", to: "/emergency" },
  { label: "Culture", to: "/cultural-guide" },
  { label: "Destinations", to: "/destinations" },
];

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: 700,
  position: "relative",
  paddingRight: theme.spacing(2),
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -4,
    left: 0,
    width: "100%",
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transform: "scaleX(0)",
    transformOrigin: "right",
    transition: "transform 0.3s ease",
  },
  "&:hover::after": {
    transform: "scaleX(1)",
    transformOrigin: "left",
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: "4px",
  position: "relative",
  transition: "color 150ms ease",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 6,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.3s ease",
  },
  "&:hover": {
    color: theme.palette.primary.main,
    "&::after": {
      transform: "scaleX(1)",
    },
  },
  "&.active": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    "&::after": {
      transform: "scaleX(1)",
    },
  },
}));

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { mode, toggleMode } = useAppearance();
  const navRefs = useRef([]);
  const [focusedNavIndex, setFocusedNavIndex] = useState(0);

  useEffect(() => {
    const idx = NAV_LINKS.findIndex((item) => item.to === location.pathname);
    if (idx >= 0) {
      setFocusedNavIndex(idx);
    }
  }, [location.pathname]);

  const handleNavKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (focusedNavIndex + delta + NAV_LINKS.length) % NAV_LINKS.length;
    setFocusedNavIndex(nextIndex);
    const nextNode = navRefs.current[nextIndex];
    nextNode?.focus();
  };

  return (
    <AppBar
      component="header"
      position="sticky"
      elevation={1}
      sx={{
        backdropFilter: "blur(8px)",
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar
        component="div"
        role="navigation"
        aria-label="Main site controls"
        sx={{ gap: 2 }}
      >
        <StyledLink
          to={user ? "/home" : "/"}
          aria-label="VoxTrail home"
        >
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            VoxTrail
          </Typography>
        </StyledLink>
        {!isMobile && user && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box
              component="nav"
              aria-label="Primary sections"
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                gap: 0.5,
              }}
              onKeyDown={handleNavKeyDown}
            >
              {NAV_LINKS.map((link, index) => (
                <StyledNavLink
                  key={link.to}
                  to={link.to}
                  tabIndex={focusedNavIndex === index ? 0 : -1}
                  ref={(node) => {
                    navRefs.current[index] = node;
                  }}
                  onFocus={() => setFocusedNavIndex(index)}
                  aria-label={`${link.label} section`}
                >
                  {link.label}
                </StyledNavLink>
              ))}
            </Box>
          </>
        )}
        <Box
          sx={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Tooltip
            title={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <IconButton
              onClick={toggleMode}
              aria-label={
                mode === "dark" ? "Activate light mode" : "Activate dark mode"
              }
              color="inherit"
              sx={{
                borderRadius: 2,
                border: "1px solid rgba(94,82,64,0.16)",
                backgroundColor: "background.paper",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {mode === "dark" ? (
                <LightIcon fontSize="small" />
              ) : (
                <DarkIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          {user && <LogoutButton />}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
