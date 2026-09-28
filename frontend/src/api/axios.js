// ============================================================
// axios.js — Konfigurimi i Axios (HTTP Client i Frontend-it)
// ============================================================
// Ky skedar krijon instancën kryesore të Axios të konfiguruar
// me URL-në bazë të backend-it dhe JWT token automatik.
//
// Çdo kërkesë API që bëhet nëpërmjet "api" (këtë instance)
// do të ketë automatikisht:
//   1. baseURL → http://127.0.0.1:7001 (backend FastAPI)
//   2. Authorization header → Bearer <access_token> (nga localStorage)
//
// Përdorim:
//   import api from "./axios";
//   const res = await api.get("/api/auth/me");
// ============================================================

import axios from "axios";
import { getAccessToken } from "../utils/token";  // Funksioni që lexon token-in nga localStorage

// ============================================================
// Krijo instancën e Axios me URL bazë të backend-it
// ============================================================
const api = axios.create({
  baseURL: "http://127.0.0.1:7001",  // Backend FastAPI — të gjitha kërkesat shkojnë këtu
});

// ============================================================
// Request Interceptor — Ekzekutohet para ÇDOKËRKESE
// ============================================================
// "Interceptor" i kap të gjitha kërkesat para se të dërgohen
// dhe shton automatikisht JWT token-in në header.
// Kjo do të thotë: NUK nevojitet të shtohet Authorization header manualisht.
api.interceptors.request.use((config) => {
  // Lexo access token-in nga localStorage (ku e ka ruajtur token.js pas login-it)
  const token = getAccessToken();

  // DEBUG: Shfaq token-in në console (mund të hiqet në prodhim)
  console.log("ACCESS TOKEN:", token);

  // Nëse token-i ekziston, shto-e si Authorization header
  // Format standard OAuth2: "Bearer eyJhbGc..."
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Kthe config-in (me ose pa Authorization) — kërkesa vazhdon
  return config;
});

// Eksporto instancën për t'u përdorur në tërë aplikacionin
export default api;