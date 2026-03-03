import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";

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
      navigate("/profile"); // uğurlu olandan sonra
    } catch (err) {
      console.error(err);
      alert("Post yaradılmadı");
    }
  };

  return (
    <div>
      <h2>Add Post</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default AddPost;