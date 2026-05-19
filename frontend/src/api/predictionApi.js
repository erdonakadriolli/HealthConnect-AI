import api from "./axios";

export async function predictDiabetes(data) {
  const res = await api.post("/api/predict/diabetes", data);
  return res.data;
}

export async function extractDiabetesFromImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/predict/diabetes/extract", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}
