// src/utils/api.js
// src/utils/api.js
import { getToken, isTokenValid, logoutAndRedirect } from './auth';

// In dev: use proxy (BASE = '')
// In prod: use absolute API base from env (REACT_APP_API_BASE)
const BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '')
    : '';

function buildUrl(path) {
  if (!path.startsWith('/')) path = `/${path}`;
  return BASE ? `${BASE}${path}` : path;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  // Attach JWT if present & valid
  if (token) {
    if (!isTokenValid(token)) {
      alert('Session expired. Please log in again.');
      logoutAndRedirect();
      throw new Error('Expired token');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  // Default JSON Content-Type if you send a body and didn’t set one
  if (options.body && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  // Make the request (BASE is '' in dev so CRA proxy handles /api -> :5001)
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (e) {
    // True network failure (backend not running, wrong port, VPN/firewall, etc.)
    alert(`Network error: ${e?.message || 'failed to reach server'}`);
    throw e;
  }

  // Handle auth errors consistently
  if (res.status === 401 || res.status === 403) {
    let msg = 'Authentication failed. Please log in again.';
    try {
      const data = await res.clone().json();
      if (data?.message) msg = data.message;
    } catch {}
    alert(msg);
    logoutAndRedirect();
    throw new Error(`Auth error: ${res.status}`);
  }

  // If server responded with HTML (e.g., 404 page), tell the dev exactly why
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    alert(
      `Non-JSON response from ${path} (status ${res.status}). ` +
      `Check the API route/path and HTTP method.\n\n` +
      text.slice(0, 200) + '…'
    );
    throw new Error(`Non-JSON ${res.status}`);
  }

  return res;
}

// Convenience helper when you want parsed JSON and automatic error throw on !ok
export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}
