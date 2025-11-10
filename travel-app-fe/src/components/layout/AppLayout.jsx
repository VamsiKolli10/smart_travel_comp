import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme, alpha, Paper } from "@mui/material";
import SharedNavbar from "./SharedNavbar";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        backgroundColor: theme.palette.background.default,
        overflowX: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 15% 10%, rgba(50,184,198,0.15) 0%, transparent 45%), radial-gradient(circle at 85% 0%, rgba(94,82,64,0.18) 0%, transparent 55%)"
              : "radial-gradient(circle at 15% 10%, rgba(50,184,198,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 0%, rgba(94,82,64,0.12) 0%, transparent 55%)",
          zIndex: 0,
          opacity: 0.7,
          pointerEvents: "none",
        },
        // Decorative elements
        "&::after": {
          content: '""',
          position: "fixed",
          bottom: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
          [theme.breakpoints.down("md")]: {
            width: 200,
            height: 200,
            bottom: -50,
            right: -50,
          },
        },
      }}
    >
      <SharedNavbar />
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
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(6px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: `0 15px 40px ${alpha(
                theme.palette.common.black,
                0.12
              )}`,
            },
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Paper>
      </Box>
      <BottomNav />
    </Box>
  );
}
