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
        position: "relative",
        backgroundColor: theme.palette.background.default,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 15% 10%, rgba(50,184,198,0.15) 0%, transparent 45%), radial-gradient(circle at 85% 0%, rgba(94,82,64,0.18) 0%, transparent 55%)"
              : "radial-gradient(circle at 15% 10%, rgba(50,184,198,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 0%, rgba(94,82,64,0.12) 0%, transparent 55%)",
          zIndex: 0,
        },
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: { xs: 2, sm: 3 },
          paddingBottom: isMobile ? "100px" : 3,
          minHeight: "calc(100vh - 64px)",
          width: "100%",
          maxWidth: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
}
