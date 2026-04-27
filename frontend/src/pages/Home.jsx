import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    api.get("/home")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Home error:", err));
  }, []);

  return (
    <div className="home-container">
      {/* CONDITIONAL HEADER BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
        {isAuthenticated ? (
          <button
            onClick={() => navigate("/profile")}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#007bff",
              color: "white",
              fontWeight: "bold"
            }}
          >
            👤 Profilim
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#28a745",
              color: "white",
              fontWeight: "bold"
            }}
          >
            🔑 Giriş et
          </button>
        )}
      </div>

      <h2>Home Feed</h2>

      {!posts.length ? (
        <h3>No posts yet</h3>
      ) : (
        <div className="posts-list">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}