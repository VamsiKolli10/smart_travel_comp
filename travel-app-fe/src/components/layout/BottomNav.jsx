import { useEffect, useRef, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  Box,
  Paper,
  alpha,
  Badge,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Translate as TranslateIcon,
  Book as BookIcon,
  Explore as ExploreIcon,
  Home as HomeIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const NAV_ACTIONS = [
  { label: "Home", icon: <DashboardIcon />, to: "/home" },
  { label: "Translate", icon: <TranslateIcon />, to: "/translation" },
  { label: "Phrasebook", icon: <BookIcon />, to: "/phrasebook" },
  { label: "Explore", icon: <ExploreIcon />, to: "/destinations" },
];

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function BottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navRef = useRef(null);
  const actionRefs = useRef([]);
  const [focusLocked, setFocusLocked] = useState(false);
  const [rovingIndex, setRovingIndex] = useState(0);
  const [previousValue, setPreviousValue] = useState(0);

  const activeIndex = (() => {
    const idx = NAV_ACTIONS.findIndex((item) => item.to === location.pathname);
    return idx === -1 ? 0 : idx;
  })();

  useEffect(() => {
    if (activeIndex !== previousValue) {
      setRovingIndex(activeIndex);
      setPreviousValue(activeIndex);
    }
  }, [activeIndex, previousValue]);

  const cycleFocus = (direction) => {
    const count = NAV_ACTIONS.length;
    const nextIndex = (rovingIndex + direction + count) % count;
    const nextNode = actionRefs.current[nextIndex];
    nextNode?.focus();
    setRovingIndex(nextIndex);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setFocusLocked(false);
      actionRefs.current[rovingIndex]?.blur();
      return;
    }
    if (!focusLocked) return;
    if (event.key === "Tab") {
      event.preventDefault();
      cycleFocus(event.shiftKey ? -1 : 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      cycleFocus(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      cycleFocus(-1);
    }
  };

  const handleFocusCapture = () => setFocusLocked(true);
  const handleBlurCapture = (event) => {
    if (!navRef.current?.contains(event.relatedTarget)) {
      setFocusLocked(false);
    }
  };

  if (!isMobile) return null;

  return (
    <Paper
      component="nav"
      elevation={8}
      aria-label="Primary mobile navigation"
      ref={navRef}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      onKeyDown={handleKeyDown}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: "blur(10px)",
        boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
        transition: "transform 0.3s ease, opacity 0.3s ease",
        transform: focusLocked ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <Box sx={visuallyHidden} aria-live="polite">
        {focusLocked &&
          "Focus is locked inside navigation. Use arrow keys or Tab to move and Escape to exit."}
      </Box>
      <BottomNavigation
        value={activeIndex}
        showLabels
        sx={{
          "& .MuiBottomNavigationAction-root": {
            transition: "all 0.3s ease",
            "&.Mui-selected": {
              color: theme.palette.primary.main,
              "& .MuiBottomNavigationAction-label": {
                fontWeight: 600,
              },
            },
            "&:not(.Mui-selected)": {
              color: theme.palette.text.secondary,
            },
          },
        }}
      >
        {NAV_ACTIONS.map((action, index) => (
          <BottomNavigationAction
            key={action.to}
            component={NavLink}
            to={action.to}
            label={action.label}
            icon={
              <Box sx={{ position: "relative" }}>
                {action.icon}
                {action.label === "Phrasebook" && (
                  <Badge
                    badgeContent={3}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 9,
                        minWidth: 14,
                        height: 14,
                        padding: "0 4px",
                        transform: "translate(50%, -50%)",
                      },
                    }}
                  />
                )}
              </Box>
            }
            aria-label={`Go to ${action.label}`}
            ref={(node) => {
              actionRefs.current[index] = node;
            }}
            tabIndex={
              focusLocked ? (rovingIndex === index ? 0 : -1) : undefined
            }
            onFocus={() => setRovingIndex(index)}
            sx={{
              transform:
                focusLocked && rovingIndex === index
                  ? "translateY(-2px)"
                  : "translateY(0)",
              transition: "transform 0.3s ease, color 0.3s ease",
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
