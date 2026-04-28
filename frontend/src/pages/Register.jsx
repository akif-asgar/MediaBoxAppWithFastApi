import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../css/Auth.css"; 

console.log("Hello from Register");

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      alert("Qeydiyyat uğurludur! Zəhmət olmasa emailinizi yoxlayın.");
      navigate("/verify", { state: { email: form.email } });
    } catch (err) {
      console.error(err);
      alert("Xəta baş verdi. Məlumatları yoxlayın.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>MediaBox Hesabı Yarat</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            name="username"
            type="text"
            placeholder="İstifadəçi adı"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email ünvanı"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Şifrə"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="show-password">
            <input 
              type="checkbox" 
              id="showPass" 
              onChange={() => setShowPassword(!showPassword)} 
            />
            <label htmlFor="showPass">Şifrəni göstər</label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Gözləyin..." : "Qeydiyyatdan keç"}
          </button>
        </form>

        <div className="divider"></div>

        <div className="auth-footer">
          <p>Artıq hesabınız var?</p>
          <Link to="/login" className="auth-link">Giriş et</Link>
          <div style={{ marginTop: "15px" }}>
             <Link to="/" className="back-home">← Ana səhifəyə qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
}