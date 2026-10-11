import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login.jsx";
import App from "./pages/App.jsx";
import Signup from "./pages/Signup.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import UsersIndex from "./pages/UsersIndex.jsx";
import Messages from "./pages/Messages.jsx";
import FollowRequests from "./pages/FollowRequests.jsx";
import Likes from "./pages/Likes.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import Layout from "./layouts/Layout.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<App />} />
                  <Route path="/create" element={<CreatePost />} />
                  <Route path="/users" element={<UsersIndex />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:userId" element={<Messages />} />
                  <Route path="/likes" element={<Likes />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/follow-requests" element={<FollowRequests />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/posts/:id" element={<PostDetail />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
);
