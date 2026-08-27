import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading)
    return <span className="loading loading-spinner loading-xl"></span>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
