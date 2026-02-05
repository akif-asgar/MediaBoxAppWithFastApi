import api from "./axios";

// LOGIN
export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// REGISTER
export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// GET PROFILE
export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};

// UPDATE PROFILE
export const updateProfile = async (data) => {
  const res = await api.put("/auth/profile", data);
  return res.data;
};

// UPLOAD PROFILE PHOTO
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/auth/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// LOGOUT (frontend-side)
export const logout = () => {
  localStorage.removeItem("token");
};
