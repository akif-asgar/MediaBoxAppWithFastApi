import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);

  const token = response.data.access_token;
  localStorage.setItem("token", token);

  return response.data;
};

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};
