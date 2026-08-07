import { Navigate } from "react-router-dom";
import { isAuthenticated, hasRole } from "../services/auth";

export default function ProtectedRoute({ roles, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !hasRole(...roles)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
