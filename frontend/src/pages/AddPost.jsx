import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";
import "../css/Addpost.css";

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (image) {
      formData.append("image", image);
    }

    try {
      await createPost(formData);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Post yaradılmadı");
    }
  };

  return (
    <div className="addpost-container">
      <form className="addpost-form" onSubmit={handleSubmit}>
        <h2>Yeni Post Paylaş</h2>

        <input
          type="text"
          placeholder="Başlıq"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Nə düşünürsən?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit">Paylaş</button>
      </form>
    </div>
  );
};

export default AddPost;