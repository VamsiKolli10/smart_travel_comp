import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function PublicRoute({ children, redirectTo = "/home" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader message="Preparing your workspace…" />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
