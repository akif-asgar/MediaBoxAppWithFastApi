import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/Profile.css";

const Profile = () => {

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});

  useEffect(() => {

    // PROFIL MƏLUMATI
    api.get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    // POSTLAR + likes-in ilkin vəziyyəti
    api.get("/posts/my-posts")
      .then((res) => {
        setPosts(res.data);

        const initialLikes = {};
        res.data.forEach(post => {
          initialLikes[post.id] = {
            likes_count: post.likes_count ?? 0,
            liked: post.liked ?? false
          };
        });
        setLikes(initialLikes);

      })
      .catch((err) => console.error(err));

  }, []);


  // DELETE POST
  const deletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Post silinmədi");
    }
  };


  // LIKE POST (toggle)
  const likePost = async (postId) => {
    try {
      const res = await api.post(`/likes/posts/${postId}`);

      setLikes(prev => ({
        ...prev,
        [postId]: res.data
      }));
    } catch (err) {
      console.error(err);
    }
  };


    return (
    <div className="profile-container">

      {/* PROFILE INFORMATION */}
      <div className="profile-card">

        <h2>Profilim</h2>

        {user && (
          <>
            <div className="profile-avatar">
              {user?.profile_photo ? (
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

        <div className="profile-buttons">
          <button onClick={() => navigate("/edit-profile")}>
            Profil Redaktəsi
          </button>
          <button onClick={() => navigate("/add-post")}>
            ➕ Yeni Post əlavə et
          </button>
        </div>

      </div>

      {/* POSTS */}
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

                {/* ACTION BUTTONS */}
                <div className="post-actions">

                  <button
                    className={likes[post.id]?.liked ? "liked-btn" : ""}
                    onClick={() => likePost(post.id)}
                  >
                    ❤️ {likes[post.id]?.likes_count ?? 0}
                  </button>

                  <button onClick={() => navigate(`/post/${post.id}`)}>
                    💬 Comment
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    className="delete-btn"
                    style={{ color: "#000" }} // qara rəng
                    onClick={() => {
                      if (window.confirm("Postu silmək istədiyinizə əminsiniz?")) {
                        deletePost(post.id);
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>
            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Profile;