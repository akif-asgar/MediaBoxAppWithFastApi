import { useState } from "react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This calls your FastAPI @router.post("/forgot-password")
      await api.post(`/auth/forgot-password?email=${email}`);
      setMessage("Sıfırlama linki emailinizə göndərildi. Zəhmət olmasa yoxlayın.");
    } catch (err) {
      alert(err.response?.data?.detail || "Xəta baş verdi");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Şifrəni bərpa et</h2>
        <p>Email ünvanınızı daxil edin və biz sizə bərpa linki göndərək.</p>
        <input 
          type="email" 
          placeholder="Email" 
          className="auth-input"
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit" className="login-btn">Link göndər</button>
        {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;