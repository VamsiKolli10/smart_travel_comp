import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Public pages
import Landing from "./components/pages/Landing";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";

// Protected pages
import Dashboard from "./components/pages/Dashboard";
import Translation from "./components/pages/Translation";
import Phrasebook from "./components/pages/Phrasebook";
import Emergency from "./components/pages/Emergency";
import CulturalGuide from "./components/pages/CulturalGuide";
import Destinations from "./components/pages/Destinations";

// ✅ Stays pages
import StaysSearchPage from "./components/pages/StaysSearchPage";
import StayDetailsPage from "./components/pages/StayDetailsPage"; // <-- added import

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* 🌐 Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 🔒 Protected routes (require auth) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect */}
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="translation" element={<Translation />} />
            <Route path="phrasebook" element={<Phrasebook />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="cultural-guide" element={<CulturalGuide />} />
            <Route path="destinations" element={<Destinations />} />

            {/* 🏨 Stays (search + details) */}
            <Route path="stays" element={<StaysSearchPage />} />
            <Route path="stays/:id" element={<StayDetailsPage />} />

            {/* 🔁 Redirect legacy path */}
            <Route path="accommodation" element={<Navigate to="/stays" replace />} />

            {/* 🚫 Fallback inside app */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* 🌍 Global fallback for unauth routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
