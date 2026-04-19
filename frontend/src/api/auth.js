import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ---------------- LOGIN ----------------
export const loginUser = async (data) => {
  const formData = new URLSearchParams();

  // ⚠️ backend "username" gözləyir (email kimi istifadə edirik)
  formData.append("username", data.email);
  formData.append("password", data.password);

  const response = await API.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const token = response.data.access_token;
  localStorage.setItem("token", token);

  return response.data;
};

// ---------------- REGISTER ----------------
export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};