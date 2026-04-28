import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/EditProfile.css";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Fetch current profile data on load
  useEffect(() => {
    api.get("/profile")
      .then(res => {
        setUsername(res.data.username);
        setEmail(res.data.email);
      })
      .catch(err => {
        console.error("Profil məlumatları gətirilərkən xəta:", err);
        if (err.response?.status === 401) navigate("/login");
      });
  }, [navigate]);

  // 2. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update text data
      await api.put("/auth/profile", {
        username,
        email,
        password: password || null
      });

      // Update photo if selected
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        await api.post("/auth/profile/photo", formData);
      }

      alert("Profil uğurla yeniləndi!");
      navigate("/profile");

    } catch (err) {
      console.error("Yeniləmə xətası:", err);
      alert(err.response?.data?.detail || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-container">
      <form className="edit-form" onSubmit={handleSubmit}>
        <h2>Profili Redaktə Et</h2>

        <div className="input-group">
          <label>İstifadəçi adı</label>
          <input
            type="text"
            placeholder="İstifadəçi adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Yeni Şifrə (dəyişmək istəmirsinizsə boş qoyun)</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Yeni şifrə"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="input-group">
          <label>Profil Şəkli</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? "Gözləyin..." : "Yadda Saxla"}
        </button>
        
        <button 
          type="button" 
          className="cancel-btn" 
          onClick={() => navigate("/profile")}
          style={{ marginTop: "10px", background: "#6c757d" }}
        >
          Ləğv et
        </button>
      </form>
    </div>
  );
};

export default EditProfile;