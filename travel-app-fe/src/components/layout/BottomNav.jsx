import {
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Translate as TranslateIcon,
  Book as BookIcon,
  Explore as ExploreIcon,
} from "@mui/icons-material";

export default function BottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const getValue = () => {
    switch (location.pathname) {
      case "/dashboard":
        return 0;
      case "/translation":
        return 1;
      case "/phrasebook":
        return 2;
      case "/destinations":
        return 3;
      default:
        return 0;
    }
  };

  if (!isMobile) return null;

  return (
    <BottomNavigation
      value={getValue()}
      showLabels
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <BottomNavigationAction
        component={NavLink}
        to="/dashboard"
        label="Dashboard"
        icon={<DashboardIcon />}
      />
      <BottomNavigationAction
        component={NavLink}
        to="/translation"
        label="Translate"
        icon={<TranslateIcon />}
      />
      <BottomNavigationAction
        component={NavLink}
        to="/phrasebook"
        label="Phrasebook"
        icon={<BookIcon />}
      />
      <BottomNavigationAction
        component={NavLink}
        to="/destinations"
        label="Explore"
        icon={<ExploreIcon />}
      />
    </BottomNavigation>
  );
}
