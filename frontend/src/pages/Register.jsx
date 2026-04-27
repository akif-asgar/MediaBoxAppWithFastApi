import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../css/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(form);
      alert("Qeydiyyat uğurludur! İndi daxil ola bilərsiniz.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Qeydiyyat uğursuz oldu. Məlumatları yoxlayın.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Qeydiyyat</h2>

        <input
          type="text"
          name="username"
          className="auth-input"
          placeholder="İstifadəçi adı"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          className="auth-input"
          placeholder="Email ünvanı"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          className="auth-input"
          placeholder="Şifrə"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="show-password">
          <input
            type="checkbox"
            id="reg-toggle"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="reg-toggle">Parolu göstər</label>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Gözləyin..." : "Hesab yarat"}
        </button>

        <div className="auth-footer">
          <p>
            Artıq hesabınız var?{" "}
            <Link to="/login" className="auth-link">
              Daxil olun
            </Link>
          </p>
          <div className="divider"></div>
          <Link to="/" className="back-home">
            🏠 Ana səhifəyə qayıt
          </Link>
        </div>
      </form>
    </div>
  );
}