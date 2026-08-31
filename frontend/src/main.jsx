import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login.jsx";
import App from "./pages/App.jsx";
import Signup from "./pages/Signup.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import UsersIndex from "./pages/UsersIndex.jsx";
import Messages from "./pages/Messages.jsx";
import Likes from "./pages/Likes.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import Layout from "./layouts/Layout.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
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
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<App />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/users" element={<UsersIndex />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/likes" element={<Likes />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
