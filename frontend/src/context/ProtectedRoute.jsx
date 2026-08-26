import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <h1>lol</h1>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
