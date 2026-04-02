const API_JSON_HEADER = { 'Content-Type': 'application/json' };

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const url = base ? `${base.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}` : path;

  const res = await fetch(url, {
    method,
    headers: body ? API_JSON_HEADER : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const err = data?.error || data?.message || res.statusText || `HTTP ${res.status}`;
    throw new Error(err);
  }

  return data;
}

