import { useEffect, useState } from "react";
import api from "../api/axios";
import "../css/PostCard.css";

export default function PostCard({ post }) {

  const [likes, setLikes] = useState(post?.likes_count || 0);
  const [liked, setLiked] = useState(post?.liked || false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);

  const loadComments = async () => {
    const res = await api.get(`/comments/posts/${post.id}`);
    setComments(res.data || []);
  };

  const handleLike = async () => {
    const res = await api.post(`/likes/posts/${post.id}`);
    setLiked(res.data.liked);
    setLikes(res.data.likes_count);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const res = await api.post(`/comments/posts/${post.id}`, {
      content: newComment,
    });

    if (res.status === 200 || res.status === 201) {
      setNewComment("");
      await loadComments();
    }
  };

  useEffect(() => {
    loadComments();
  }, [post?.id]);

  return (
    <div className="post-card">

      {/* USER */}
      <div className="post-user">
        {post?.author?.username || "Unknown"}
      </div>

      {/* IMAGE */}
      {post?.image && (
        <img
          src={`http://127.0.0.1:8000/${post.image}`}
          alt="post"
        />
      )}

      {/* CONTENT */}
      <p>
        {expanded
          ? post?.content
          : post?.content?.length > 100
            ? post.content.slice(0, 100) + "..."
            : post?.content
        }
      </p>

      {post?.content?.length > 100 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer"
          }}
        >
          {expanded ? "Less" : "More"}
        </button>
      )}

      {/* ACTIONS */}
      <div className="post-actions">

        <button
          className={liked ? "liked" : ""}
          onClick={handleLike}
        >
          ❤️ {likes}
        </button>

        <button onClick={() => setShowComments(!showComments)}>
          💬 {comments.length}
        </button>

      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="comment-box">

          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <b>{c.user?.username || c.username}:</b> {c.content}
            </div>
          ))}

          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write comment..."
          />

          <button onClick={handleComment}>Send</button>

        </div>
      )}

    </div>
  );
}