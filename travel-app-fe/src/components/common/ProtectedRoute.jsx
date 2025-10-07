import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function wProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or spinner
  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
