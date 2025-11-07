import { useEffect, useRef, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Translate as TranslateIcon,
  Book as BookIcon,
  Explore as ExploreIcon,
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

  const activeIndex = (() => {
    const idx = NAV_ACTIONS.findIndex((item) => item.to === location.pathname);
    return idx === -1 ? 0 : idx;
  })();

  useEffect(() => {
    setRovingIndex(activeIndex);
  }, [activeIndex]);

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
    <BottomNavigation
      component="nav"
      aria-label="Primary mobile navigation"
      value={activeIndex}
      showLabels
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
      }}
    >
      {focusLocked && (
        <Box component="p" sx={visuallyHidden} aria-live="polite">
          Focus is locked inside navigation. Use arrow keys or Tab to move and Escape to exit.
        </Box>
      )}
      {NAV_ACTIONS.map((action, index) => (
        <BottomNavigationAction
          key={action.to}
          component={NavLink}
          to={action.to}
          label={action.label}
          icon={action.icon}
          aria-label={`Go to ${action.label}`}
          ref={(node) => {
            actionRefs.current[index] = node;
          }}
          tabIndex={
            focusLocked ? (rovingIndex === index ? 0 : -1) : undefined
          }
          onFocus={() => setRovingIndex(index)}
        />
      ))}
    </BottomNavigation>
  );
}
