import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import type { UserRole } from "../features/auth/auth.types";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
