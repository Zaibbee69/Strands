import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Spinner, Center } from "@chakra-ui/react";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
