import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/home")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Home error:", err));
  }, []);

  if (!posts.length) return <h3>No posts yet</h3>;

  return (
    <div>

      {/* PROFILE BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
        <button
          onClick={() => navigate("/profile")}
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: "#007bff",
            color: "white"
          }}
        >
          👤 Profile
        </button>
      </div>

      <h2>Home Feed</h2>

      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

    </div>
  );
}