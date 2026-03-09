import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import AddPost from "./pages/AddPost";
import EditProfile from "./pages/EditProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/register" element={<Register />} />

      <Route path="/add-post" element={<AddPost />} />

      <Route path="/edit-profile" element={<EditProfile />} />

    </Routes>
  );
}
