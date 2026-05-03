import api from "./axios";

export async function predictDiabetes(data) {
  const res = await api.post("/api/predict/diabetes", data);
  return res.data;
}

export async function predictHeart(data) {
  const res = await api.post("/api/predict/heart", data);
  return res.data;
}