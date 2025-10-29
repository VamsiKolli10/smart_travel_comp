import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Landing from "./components/pages/Landing";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";
import Dashboard from "./components/pages/Dashboard";
import Translation from "./components/pages/Translation";
import Phrasebook from "./components/pages/Phrasebook";
import Emergency from "./components/pages/Emergency";
import CulturalGuide from "./components/pages/CulturalGuide";
import Destinations from "./components/pages/Destinations";

// ✅ New: Stays page (replaces Accommodation)
import StaysSearchPage from "./components/pages/StaysSearchPage";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected app layout + routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route element={<Navigate to="/" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="translation" element={<Translation />} />
            <Route path="phrasebook" element={<Phrasebook />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="cultural-guide" element={<CulturalGuide />} />
            <Route path="destinations" element={<Destinations />} />

            {/* ✅ New stays route */}
            <Route path="stays" element={<StaysSearchPage />} />

            {/* ✅ Redirect old accommodation path to stays */}
            <Route path="accommodation" element={<Navigate to="/stays" replace />} />

            {/* Fallback within protected area */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Global fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
