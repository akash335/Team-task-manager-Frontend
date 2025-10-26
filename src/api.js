const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, ''); // trim trailing /
export async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
// usage: api('/register', { method: 'POST', body: JSON.stringify(data) })
