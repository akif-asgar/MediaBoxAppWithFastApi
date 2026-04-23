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

    // USER PROFILE
    api.get("/auth/profile")
      .then(res => setUser(res.data))
      .catch(err => console.error(err));

    // USER POSTS
    api.get("/posts/my-posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));

  }, []);

  // DELETE POST
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

      {/* PROFILE CARD */}
      <div className="profile-card">

        <h2>Profilim</h2>

        {user && (
          <>
            <div className="profile-avatar">

              {user.profile_photo ? (
                <img
                  src={`http://127.0.0.1:8000/${user.profile_photo}`}
                  alt="profile"
                />
              ) : (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="default avatar"
                />
              )}

            </div>

            <p><strong>İstifadəçi adı:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>

          </>
        )}

        {/* BUTTONS */}
        <div className="profile-buttons">

          <button onClick={() => navigate("/edit-profile")}>
            Profil Redaktəsi
          </button>

          <button onClick={() => navigate("/add-post")}>
            ➕ Yeni Post
          </button>

          <button onClick={() => navigate("/")}>
            🏠 Home
          </button>

        </div>

      </div>

      {/* POSTS */}
      <div className="posts-section">

        <h3>Mənim Postlarım</h3>

        {posts.length === 0 ? (
          <p>Hələ post əlavə etməmisiniz</p>
        ) : (
          <div className="profile-post-grid">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        )}

      </div>

    </div>

  );
};

export default Profile;