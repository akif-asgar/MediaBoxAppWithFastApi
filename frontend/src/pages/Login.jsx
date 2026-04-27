import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import "../css/Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
      await loginUser(form);
      navigate("/profile");
      // Refresh to update the Global state/Navbar buttons
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Login uğursuz oldu. Email və ya şifrə yanlışdır.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Daxil ol</h2>

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
            id="toggle"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="toggle">Parolu göstər</label>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Giriş edilir..." : "Login"}
        </button>

        <div className="auth-footer">
          <p>
            Hesabınız yoxdur?{" "}
            <Link to="/register" className="auth-link">
              Qeydiyyatdan keçin
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