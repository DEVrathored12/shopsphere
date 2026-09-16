import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

/**
 * Guards a route subtree behind authentication. While the auth state is
 * still being resolved (e.g. verifying a stored token), shows the
 * shared full-screen Loader. Unauthenticated users are redirected to
 * /login, preserving the originally requested location so we can send
 * them back after login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
