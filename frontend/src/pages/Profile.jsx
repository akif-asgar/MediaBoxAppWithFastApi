import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    // USER PROFIL
    api.get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    // ISTIFADECININ POSTLARI
    api.get("/posts/my-posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));

  }, []);

  return (
    <div className="profile-container">

      {/* PROFIL MELUMATLARI */}
      <div className="profile-card">
        <h2>Profilim</h2>

        {user && (
          <>
            <p><strong>İstifadəçi adı:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        )}

        <div className="profile-buttons">
          <button onClick={() => navigate("/edit-profile")}>
            Profil Redaktəsi
          </button>

          <button onClick={() => navigate("/add-post")}>
            ➕ Yeni Post əlavə et
          </button>
        </div>
      </div>


      {/* POSTLAR */}
      <div className="posts-section">
        <h3>Mənim Postlarım</h3>

        {posts.length === 0 ? (
          <p>Hələ post əlavə etməmisiniz</p>
        ) : (

          <div className="posts-grid">

            {posts.map((post) => (
              <div key={post.id} className="post-card">

                {post.image && (
                  <img
                    src={`http://127.0.0.1:8000/${post.image}`}
                    alt={post.title}
                  />
                )}

                <h4>{post.title}</h4>
                <p>{post.content}</p>

              </div>
            ))}

          </div>

        )}
      </div>

    </div>
  );
};

export default Profile;