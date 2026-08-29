import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import { AppearanceProvider } from "./contexts/AppearanceContext.jsx";
import { FeatureFlagsProvider } from "./contexts/FeatureFlagsContext.jsx";
import { AnalyticsProvider } from "./contexts/AnalyticsContext.jsx";
import FeatureGate from "./components/common/FeatureGate.jsx";

// Public pages
import Landing from "./components/pages/Landing";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";
import AuthAction from "./components/pages/AuthAction";
import VerifyEmail from "./components/pages/VerifyEmail";
import LegalPage from "./components/pages/LegalPage";

// Protected pages
import Home from "./components/pages/Home.jsx";
import Translation from "./components/pages/Translation";
import Phrasebook from "./components/pages/Phrasebook";
import Emergency from "./components/pages/Emergency";
import CulturalGuide from "./components/pages/CulturalGuide";
// import Destinations from "./components/pages/Destinations";

// ✅ Stays pages
import StaysSearchPage from "./components/pages/StaysSearchPage";
import StayDetailsPage from "./components/pages/StayDetailsPage"; // <-- added import
import DiscoverPage from "./components/pages/DiscoverPage";
import DestinationDetailsPage from "./components/pages/DestinationDetailsPage";

export default function App() {
  return (
    <AuthProvider>
      <AppearanceProvider>
        <FeatureFlagsProvider>
          <AnalyticsProvider>
            <Routes>
              {/* 🌐 Public routes */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth-action" element={<AuthAction />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/terms" element={<LegalPage kind="terms" />} />
                <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              </Route>

              {/* 🔒 Protected routes (require auth) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route
                    path="/translation"
                    element={
                      <FeatureGate flag="translationModule">
                        <Translation />
                      </FeatureGate>
                    }
                  />
                  <Route path="/phrasebook" element={<Phrasebook />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/cultural-guide" element={<CulturalGuide />} />
                  <Route
                    path="/destinations"
                    element={
                      <FeatureGate flag="discoverModule">
                        <DiscoverPage />
                      </FeatureGate>
                    }
                  />

                  {/* 🧭 Discover (POIs) */}
                  <Route
                    path="/discover"
                    element={
                      <FeatureGate flag="discoverModule">
                        <DiscoverPage />
                      </FeatureGate>
                    }
                  />
                  <Route
                    path="/destinations/:id"
                    element={
                      <FeatureGate flag="discoverModule">
                        <DestinationDetailsPage />
                      </FeatureGate>
                    }
                  />

                  {/* 🏨 Stays (search + details) */}
                  <Route
                    path="/stays"
                    element={
                      <FeatureGate flag="staysModule">
                        <StaysSearchPage />
                      </FeatureGate>
                    }
                  />
                  <Route
                    path="/stays/:id"
                    element={
                      <FeatureGate flag="staysModule">
                        <StayDetailsPage />
                      </FeatureGate>
                    }
                  />

                  {/* 🔁 Redirect legacy path */}
                  <Route
                    path="/accommodation"
                    element={<Navigate to="/stays" replace />}
                  />

                  {/* 🚫 Fallback inside app */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Route>
              </Route>

              {/* 🌍 Global fallback for unauth routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnalyticsProvider>
        </FeatureFlagsProvider>
      </AppearanceProvider>
    </AuthProvider>
  );
}
