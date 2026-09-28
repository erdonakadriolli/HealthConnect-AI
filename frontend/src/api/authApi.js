// ============================================================
// authApi.js — Funksionet e API-t për Autentikim
// ============================================================
// Ky skedar përmban të gjitha thirrjet HTTP që kanë të bëjnë
// me autentikimin (register, login, profili).
//
// Çdo funksion:
//   1. Bën kërkesë HTTP nëpërmjet instancës "api" (axios.js)
//   2. Pret përgjigjen nga backend (FastAPI)
//   3. Kthen vetëm "data" (jo të gjithë response-in e Axios)
//
// Këto funksione përdoren direkt nga faqet (Login.jsx, Register.jsx)
// dhe nuk kanë logjikë — vetëm komunikim me API.
// ============================================================

import api from "./axios";  // Instanca e Axios me baseURL dhe token automatik

// ============================================================
// registerUser() — Regjistrim i përdoruesit të ri
// ============================================================
export async function registerUser(data) {
  /**
   * Dërgon kërkesë POST tek /api/auth/register
   * 
   * @param data - { first_name, last_name, email, password }
   * @returns    - { id, first_name, last_name, email, is_active }
   * @throws     - 409 nëse emaili ekziston tashmë
   */
  const res = await api.post("/api/auth/register", data);
  return res.data;  // Kthen vetëm të dhënat (body e përgjigjes)
}

// ============================================================
// loginUser() — Hyrja e përdoruesit
// ============================================================
export async function loginUser(data) {
  /**
   * Dërgon kërkesë POST tek /api/auth/login
   * 
   * @param data - { email, password }
   * @returns    - { access_token, refresh_token, token_type: "bearer" }
   * @throws     - 401 nëse email/fjalëkalimi janë të gabuara
   * 
   * Token-at ruhen në localStorage nëpërmjet saveTokens() (token.js)
   * dhe pas kësaj çdo kërkesë tjetër do të ketë Authorization header automatik.
   */
  const res = await api.post("/api/auth/login", data);
  return res.data;  // Kthen { access_token, refresh_token, token_type }
}

// ============================================================
// getMe() — Merr profilin e përdoruesit aktual
// ============================================================
export async function getMe() {
  /**
   * Dërgon kërkesë GET tek /api/auth/me
   * 
   * Kjo kërkesë bëhet me Authorization: Bearer <access_token> automatikisht
   * (nga interceptori i axios.js që shton token-in nga localStorage)
   * 
   * @returns - { id, first_name, last_name, email, is_active }
   * @throws  - 401 nëse nuk jemi të loguar (token mungon/ka skaduar)
   */
  const res = await api.get("/api/auth/me");
  return res.data;  // Kthen të dhënat e profilit
}