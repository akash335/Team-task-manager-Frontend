const API = import.meta.env.VITE_API_BASE_URL;
export async function api(path, method="GET", body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? {"Content-Type":"application/json"} : {}),
      ...(token ? {"Authorization": `Bearer ${token}`} : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
