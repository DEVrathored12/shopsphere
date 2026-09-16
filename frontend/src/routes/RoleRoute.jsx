import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

/**
 * Guards a route subtree behind both authentication AND one or more
 * allowed roles. Usage:
 *
 *   <Route element={<RoleRoute allowedRoles={["shop_owner"]} />}>
 *     <Route path="/owner/dashboard" element={<OwnerDashboard />} />
 *   </Route>
 *
 * This is a frontend convenience only — the backend independently
 * enforces authorization on every request and must never be trusted
 * to be redundant with this check.
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
