import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NavLink, Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import LogoutButton from "../../components/common/LogoutButton";
import { useSelector } from "react-redux";

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: 600,
  "&:hover": {
    color: theme.palette.primary.dark,
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: "4px",
  transition: "color 150ms ease",
  "&:hover": {
    color: theme.palette.primary.main,
  },
  "&.active": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function Navbar({}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const user = useSelector((state) => state.auth);
  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <StyledLink to={user ? "/dashboard" : "/"}>
          Smart Travel Companion
        </StyledLink>
        {!isMobile && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              gap: 3,
            }}
          >
            <StyledNavLink to="/dashboard">Dashboard</StyledNavLink>
            <StyledNavLink to="/translation">Translation</StyledNavLink>
            <StyledNavLink to="/phrasebook">Phrasebook</StyledNavLink>
            <StyledNavLink to="/accommodation">Stays</StyledNavLink>
            <StyledNavLink to="/emergency">Emergency</StyledNavLink>
            <StyledNavLink to="/cultural-guide">Culture</StyledNavLink>
            <StyledNavLink to="/destinations">Destinations</StyledNavLink>
          </Box>
        )}
        <Box sx={{ marginLeft: "auto" }}>
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
