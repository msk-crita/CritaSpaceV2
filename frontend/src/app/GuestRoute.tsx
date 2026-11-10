import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-background">
        <p className="text-sm text-text-secondary">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
