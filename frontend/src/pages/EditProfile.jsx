import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁 ikonlar
import "../css/EditProfile.css";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/profile")
      .then(res => {
        setUsername(res.data.username);
        setEmail(res.data.email);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put("/auth/profile", {
        username,
        email,
        password: password || null
      });

      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        await api.post("/auth/profile/photo", formData);
      }

      alert("Profil uğurla yeniləndi");
      navigate("/profile");

    } catch (err) {
      console.error(err);
      alert("Xəta baş verdi");
    }
  };

  return (
    <div className="edit-container">
      <form className="edit-form" onSubmit={handleSubmit}>
        <h2>Profili Redaktə Et</h2>

        <input
          type="text"
          placeholder="İstifadəçi adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Yeni şifrə"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button type="submit">Yadda Saxla</button>
      </form>
    </div>
  );
};

export default EditProfile;