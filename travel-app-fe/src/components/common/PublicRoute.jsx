import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function PublicRoute({ children, redirectTo = "/home" }) {
  const { user, loading } = useAuth();

  // Only block with loader if we already have a user and we're resolving state;
  // otherwise let the public page render so local error state (e.g., unverified email) stays visible.
  if (loading && user) {
    return <FullScreenLoader message="Preparing your workspace…" />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ?? <Outlet />;
}
