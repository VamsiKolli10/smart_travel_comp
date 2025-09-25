import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.default,
          paddingBottom: isMobile ? "100px" : 3, // Add bottom padding for mobile bottom nav
          minHeight: "calc(100vh - 64px)", // Account for navbar height
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
}
