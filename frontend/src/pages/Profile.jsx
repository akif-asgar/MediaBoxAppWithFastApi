import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/Profile.css";
import PostCard from "../components/PostCard";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. FIXED URL: Removed "/auth" to match your main.py configuration
    api.get("/auth/profile") 
      .then(res => setUser(res.data))
      .catch(err => {
        console.error("Profile Error:", err);
        if (err.response?.status === 401) navigate("/login");
      });

    // 2. USER POSTS
    api.get("/posts/my-posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Posts Error:", err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Post silinmədi");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profilim</h2>
        {user ? (
          <>
            <div className="profile-avatar">
              <img
                src={user.profile_photo 
                  ? `http://127.0.0.1:8000/${user.profile_photo}` 
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="profile"
              />
            </div>
            <p><strong>İstifadəçi adı:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        ) : (
          <p>Yüklənir...</p>
        )}

        <div className="profile-buttons">
          {/* 3. ENSURE NAVIGATION PATHS MATCH App.jsx */}
          <button onClick={() => navigate("/edit-profile")}>Profil Redaktəsi</button>
          <button onClick={() => navigate("/add-post")}>➕ Yeni Post</button>
          <button onClick={() => navigate("/")}>🏠 Home</button>
          
          <button 
            onClick={handleLogout} 
            style={{ backgroundColor: "#dc3545", color: "white" }}
          >
            ❌ Çıxış (Logout)
          </button>
        </div>
      </div>

      <div className="posts-section">
        <h3>Mənim Postlarım</h3>
        {posts.length === 0 ? (
          <p>Hələ post əlavə etməmisiniz</p>
        ) : (
          <div className="profile-post-grid">
            {posts.map(post => (
              <PostCard key={post.id} post={post} fallbackUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;