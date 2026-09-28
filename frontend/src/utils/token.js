// ============================================================
// token.js — Menaxhimi i JWT Token-ave në Browser
// ============================================================
// Ky skedar menaxhon ruajtjen dhe leximin e JWT token-ave
// në localStorage të browser-it.
//
// Dy token ruhen pas login-it:
//   "access_token"  → JWT i shkurtër (30 min) — dërgohet me çdo kërkesë API
//   "refresh_token" → JWT i gjatë (7 ditë) — për marrjen e access token të ri
//
// Rrjedha tipike:
//   Login → saveTokens() → çdo kërkesë API lexon getAccessToken()
//   Logout → removeTokens() → hiqen të dyja token-at
//   Token skadoi → përdor refresh_token për marrjen e access_token të ri
// ============================================================

export function saveTokens(accessToken, refreshToken) {
  /**
   * Ruan access token dhe refresh token në localStorage.
   * Thirret menjëherë pas login/refresh të suksesshëm.
   * 
   * @param accessToken  - JWT access token (jeton 30 minuta)
   * @param refreshToken - JWT refresh token (jeton 7 ditë)
   * 
   * localStorage është persistent — qëndron edhe pas mbylljes së browser-it.
   * (ndryshe nga sessionStorage që fshihet kur mbyllet tab-i)
   */
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function getAccessToken() {
  /**
   * Lexon access token-in nga localStorage.
   * Kthehet null nëse nuk jemi të loguar.
   * 
   * Ky funksion thirret nga axios.js interceptori para çdo kërkese API
   * për të shtuar Authorization header automatikisht.
   * 
   * @returns string | null - token-i ose null nëse nuk ekziston
   */
  return localStorage.getItem("access_token");
}

export function removeTokens() {
  /**
   * Fshi të dyja token-at nga localStorage — efektivisht logout.
   * Pas kësaj, çdo kërkesë API do të kthejë 401 Unauthorized.
   * 
   * Thirrni këtë funksion kur:
   *   - Përdoruesi klikon "Logout"
   *   - Access token ka skaduar dhe refresh ka dështuar
   *   - Detektohet aktivitet i dyshimtë
   */
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}