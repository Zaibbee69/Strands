import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login.jsx";
import App from "./pages/App.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import Layout from "./context/Layout.jsx";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Layout wraps everything inside it */}
          <Route element={<Layout />}>
            {/* 2. Login is public, but still inherits the Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 3. ProtectedRoute only guards the routes nested inside it */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<App />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
