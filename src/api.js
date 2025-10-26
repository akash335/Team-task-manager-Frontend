// Get base API URL from environment (e.g. .env.local)
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, ''); // Trim trailing '/'

// Unified API helper
export async function api(path, opts = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const res = await fetch(`${API_BASE}${cleanPath}`, {
    headers: { 
      'Content-Type': 'application/json', 
      ...(opts.headers || {}) 
    },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}
