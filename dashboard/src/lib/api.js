const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Token Management ─────────────────────────────────────

let authToken = null;

export function setToken(token) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('ua_token', token);
    } else {
      localStorage.removeItem('ua_token');
    }
  }
}

export function getToken() {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('ua_token');
  }
  return authToken;
}

export function clearToken() {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ua_token');
  }
}

// ─── Generic Fetch ─────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expired or invalid
    clearToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Auth API ──────────────────────────────────────────────

export async function signup(name, email, password) {
  const data = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) setToken(data.token);
  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) setToken(data.token);
  return data;
}

export async function getMe() {
  return apiFetch('/api/auth/me');
}

export function logout() {
  clearToken();
}

// ─── Sites API ─────────────────────────────────────────────

export async function getSites() {
  return apiFetch('/api/sites');
}

export async function createSite(name, domain) {
  return apiFetch('/api/sites', {
    method: 'POST',
    body: JSON.stringify({ name, domain }),
  });
}

export async function getSiteDetails(siteId) {
  return apiFetch(`/api/sites/${encodeURIComponent(siteId)}`);
}

export async function deleteSite(siteId) {
  return apiFetch(`/api/sites/${encodeURIComponent(siteId)}`, {
    method: 'DELETE',
  });
}

// ─── Analytics API (site-scoped) ───────────────────────────

export async function getStats(siteId) {
  return apiFetch(`/api/stats?siteId=${encodeURIComponent(siteId)}`);
}

export async function getSessions(siteId, page = 1, limit = 20) {
  return apiFetch(
    `/api/sessions?siteId=${encodeURIComponent(siteId)}&page=${page}&limit=${limit}`
  );
}

export async function getSessionEvents(sessionId, siteId) {
  return apiFetch(
    `/api/sessions/${encodeURIComponent(sessionId)}/events?siteId=${encodeURIComponent(siteId)}`
  );
}

export async function getHeatmapData(pageUrl, siteId) {
  return apiFetch(
    `/api/heatmap?siteId=${encodeURIComponent(siteId)}&pageUrl=${encodeURIComponent(pageUrl)}`
  );
}

export async function getPages(siteId) {
  return apiFetch(`/api/pages?siteId=${encodeURIComponent(siteId)}`);
}
