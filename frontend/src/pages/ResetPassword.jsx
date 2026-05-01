import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/Auth.css"; 

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  
  // Extract token from URL: ?token=...
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/reset-password?token=${token}&new_password=${newPassword}`);
      alert("Şifrə uğurla dəyişdirildi!");
      navigate("/login");
    } catch (err) {
      alert("Xəta: Linkin vaxtı keçmiş ola bilər.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Yeni Şifrə Təyin Et</h2>
        <input 
          type="password" 
          placeholder="Yeni şifrə" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} 
          required 
        />
        <button type="submit">Yadda Saxla</button>
      </form>
    </div>
  );
};

export default ResetPassword;