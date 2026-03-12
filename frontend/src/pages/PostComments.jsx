import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../css/PostComments.css";

const PostComments = () => {

  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {

    // LOAD CURRENT USER
    api.get("/auth/profile")
      .then(res => setUser(res.data))
      .catch(err => console.error(err));

    // LOAD POST DETAILS
    api.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));

    // LOAD COMMENTS
    loadComments();

  }, [id]);



  const loadComments = async () => {

    try {

      const res = await api.get(`/comments/posts/${id}`);

      setComments(res.data);

    } catch (err) {

      console.error(err);

    }

  };


  const addComment = async () => {

    if (!commentText.trim()) return;

    try {

      const res = await api.post(`/comments/posts/${id}`, {
        content: commentText
      });

      setComments(prev => [...prev, res.data]);

      setCommentText("");

    } catch (err) {

      console.error(err);

    }

  };


  const deleteComment = async (commentId) => {

    try {

      await api.delete(`/comments/${commentId}`);

      setComments(prev => prev.filter(c => c.id !== commentId));

    } catch (err) {

      console.error(err);

    }

  };


  if (!post) return <p>Loading...</p>;



  return (

    <div className="post-comments-container">

      {/* POST CARD */}
      <div className="post-card">

        {post.image && (
          <img
            src={`http://127.0.0.1:8000/${post.image}`}
            alt={post.title}
          />
        )}

        <h2>{post.title}</h2>

        <p>{post.content}</p>

      </div>



      <h3>Comments ({comments.length})</h3>



      <div className="comments-list">

        {comments.map(comment => (

          <div key={comment.id} className="comment-box">

            <div className="comment-header">

              <b>{comment.username || "Deleted User"}</b>

              <span className="comment-date">

                {new Date(comment.created_at).toLocaleString()}

              </span>

            </div>

            <p>{comment.content}</p>


            {(user?.id === comment.user_id || user?.id === post.user_id) && (

              <button
                className="delete-comment"
                onClick={() => deleteComment(comment.id)}
              >
                ❌ Delete
              </button>

            )}

          </div>

        ))}

      </div>



      {/* ADD COMMENT */}
      <div className="add-comment">

        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        <button onClick={addComment}>
          Send
        </button>

      </div>

    </div>

  );

};

export default PostComments;