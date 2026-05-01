import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Register from "./pages/Register";
import AddPost from "./pages/AddPost";
import EditProfile from "./pages/EditProfile";
import PostComments from "./pages/PostComments";
import ProtectedRoute from "./components/ProtectedRoute";
import Verify from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-post"
        element={
          <ProtectedRoute>
            <AddPost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/:id/comments"
        element={
          <ProtectedRoute>
            <PostComments />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}