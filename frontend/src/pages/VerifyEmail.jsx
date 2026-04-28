import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Use your axios instance
import "../css/auth.css";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // We get the email passed from the Register page
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calling the backend route we created earlier
      await api.post(`/auth/verify-email?email=${email}&code=${code}`);
      alert("Email təsdiqləndi! İndi daxil ola bilərsiniz.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Kod yanlışdır.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleVerify}>
        <h2>Email Təsdiqləmə</h2>
        <p style={{ textAlign: "center", marginBottom: "15px" }}>
          Kod <b>{email}</b> ünvanına göndərildi.
        </p>
        
        <input
          type="text"
          className="auth-input"
          placeholder="6-rəqəmli kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength="6"
          required
        />

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Yoxlanılır..." : "Təsdiqlə"}
        </button>
      </form>
    </div>
  );
}