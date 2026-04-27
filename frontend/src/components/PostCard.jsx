import { useEffect, useState } from "react";
import api from "../api/axios";
import "../css/PostCard.css";

export default function PostCard({ post, fallbackUser }) {
  const [likes, setLikes] = useState(post?.likes_count || 0);
  const [liked, setLiked] = useState(post?.liked || false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false); // 🔥 New state

  const loadComments = async () => {
    try {
      const res = await api.get(`/comments/posts/${post.id}`);
      setComments(res.data || []);
    } catch (err) {
      console.error("Comments load error", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/likes/posts/${post.id}`);
      setLiked(res.data.liked);
      setLikes(res.data.likes_count);
    } catch (err) {
      console.error("Like error", err);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      const res = await api.post(`/comments/posts/${post.id}`, {
        content: newComment,
      });

      if (res.status === 200 || res.status === 201) {
        setNewComment("");
        await loadComments(); // Refresh list
      }
    } catch (err) {
      alert("Şərh göndərilmədi. Giriş etdiyinizdən əmin olun.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (post?.id) loadComments();
  }, [post?.id]);

  return (
    <div className="post-card">
      {/* USER */}
      <div className="post-user">
        {post?.author?.username || fallbackUser?.username || "Unknown"}
      </div>

      {/* IMAGE */}
      {post?.image && (
        <img src={`http://127.0.0.1:8000/${post.image}`} alt="post" />
      )}

      {/* CONTENT */}
      <div className="post-content">
        <p>
          {expanded
            ? post?.content
            : post?.content?.length > 100
            ? post.content.slice(0, 100) + "..."
            : post?.content}
        </p>
        {post?.content?.length > 100 && (
          <button className="more-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Less" : "More"}
          </button>
        )}
      </div>

      {/* ACTIONS */}
      <div className="post-actions">
        <button className={liked ? "action-btn liked" : "action-btn"} onClick={handleLike}>
          ❤️ {likes}
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          💬 {comments.length}
        </button>
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="comment-box">
          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <b>{c.user?.username || c.username}:</b> {c.content}
              </div>
            ))}
          </div>

          {/* 🔥 FIXED INPUT AREA */}
          <div className="comment-input-area">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Şərh yaz..."
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <button 
              onClick={handleComment} 
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}