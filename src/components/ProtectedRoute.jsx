import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const ProtectedRoute = ({ redirectPath = "/login" }) => {
  const { user, loading } = useAuthStore();

  // 1. Show loading state while auth listener initializes
  if (loading) {
    return <div>Loading...</div>;
  }

  // 2. Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Render child routes when authenticated
  return <Outlet />;
};

export default ProtectedRoute;
