import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/Profile.css";

const Profile = () => {

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});

  const navigate = useNavigate();

  useEffect(() => {

    // LOAD USER PROFILE
    api.get("/auth/profile")
      .then(res => setUser(res.data))
      .catch(err => console.error(err));

    // LOAD USER POSTS
    api.get("/posts/my-posts")
      .then(res => {

        setPosts(res.data);

        // initialize likes state
        const initialLikes = {};

        res.data.forEach(post => {
          initialLikes[post.id] = {
            liked: Boolean(post.liked),
            likes_count: Number(post.likes_count ?? 0)
          };
        });

        setLikes(initialLikes);

      })
      .catch(err => console.error(err));

  }, []);

  // DELETE POST
  const deletePost = async (postId) => {

    try {

      await api.delete(`/posts/${postId}`);

      setPosts(posts.filter(p => p.id !== postId));

    } catch (err) {

      console.error(err);
      alert("Post silinmədi");

    }
  };

  // LIKE POST
  const likePost = async (postId) => {

    const current = likes[postId];

    const optimistic = {
      liked: !current?.liked,
      likes_count: (current?.likes_count ?? 0) + (!current?.liked ? 1 : -1)
    };

    setLikes(prev => ({
      ...prev,
      [postId]: optimistic
    }));

    try {

      const res = await api.post(`/likes/posts/${postId}`);

      setLikes(prev => ({
        ...prev,
        [postId]: {
          liked: Boolean(res.data.liked),
          likes_count: Number(res.data.likes_count ?? 0)
        }
      }));

    } catch (err) {

      // rollback if error
      setLikes(prev => ({
        ...prev,
        [postId]: current
      }));

      console.error(err);

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

            {posts.map(post => (

              <div key={post.id} className="post-card">

                {post.image && (
                  <img
                    src={`http://127.0.0.1:8000/${post.image}`}
                    alt={post.title}
                  />
                )}

                <h4>{post.title}</h4>
                <p>{post.content}</p>

                <div className="post-actions">

                  {/* LIKE BUTTON */}
                  <button
                    className={likes[post.id]?.liked ? "liked-btn" : ""}
                    onClick={() => likePost(post.id)}
                  >
                    ❤️ {likes[post.id]?.likes_count ?? 0}
                  </button>


                  {/* COMMENTS PAGE BUTTON */}
                  <button
                    onClick={() => navigate(`/post/${post.id}/comments`)}
                  >
                    💬 {post.comments_count ?? 0} Comments
                  </button>


                  {/* DELETE POST */}
                  <button
                    className="delete-btn"
                    onClick={() => {

                      if (window.confirm("Postu silmək istədiyinizə əminsiniz?")) {

                        deletePost(post.id);

                      }

                    }}
                  >
                    🗑 Delete
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