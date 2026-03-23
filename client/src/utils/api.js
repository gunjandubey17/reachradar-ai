const API_BASE = '/api';

function getHeaders() {
  const headers = {};
  const token = localStorage.getItem('reachradar_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiPost(path, body, isFormData = false) {
  const headers = getHeaders();
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function setToken(token) {
  localStorage.setItem('reachradar_token', token);
}

export function getToken() {
  return localStorage.getItem('reachradar_token');
}

export function removeToken() {
  localStorage.removeItem('reachradar_token');
}

export function getUser() {
  const raw = localStorage.getItem('reachradar_user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem('reachradar_user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('reachradar_user');
}

export function logout() {
  removeToken();
  removeUser();
  window.location.href = '/';
}
