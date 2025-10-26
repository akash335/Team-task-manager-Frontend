const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');

export async function api(path, method = 'GET', data = null, token = null) {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (data) opts.body = JSON.stringify(data);

  console.log(`[API] ${method} → ${url}`, data || '');
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    console.error(`[API ERROR] ${res.status} ${text}`);
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}