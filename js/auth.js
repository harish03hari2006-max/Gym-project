/**
 * js/auth.js
 * Auth state helpers shared across all pages.
 */

export function saveSession(token, user) {
  localStorage.setItem('vf_token', token);
  localStorage.setItem('vf_user',  JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('vf_token');
  localStorage.removeItem('vf_user');
}

export function getToken() {
  return localStorage.getItem('vf_token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('vf_user'));
  } catch { return null; }
}

export function isLoggedIn() {
  return !!getToken();
}

export function isAdmin() {
  const u = getUser();
  return u && u.role === 'admin';
}
