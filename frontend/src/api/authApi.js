import api from "./axios";

export async function registerUser(data) {
  const res = await api.post("/api/auth/register", data);
  return res.data;
}

export async function loginUser(data) {
  const res = await api.post("/api/auth/login", data);
  return res.data;
}

export async function getMe() {
  const res = await api.get("/api/auth/me");
  return res.data;
}