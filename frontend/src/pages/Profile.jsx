import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/profile").then((res) => {
      setUser(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Profile</h2>

      {user && (
        <>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </>
      )}

      {/* ADD POST BUTTON */}
      <button
        onClick={() => navigate("/add-post")}
        style={{ marginTop: "20px" }}
      >
        ➕ Add Post
      </button>
    </div>
  );
};

export default Profile;
