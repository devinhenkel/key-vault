const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  listKeys: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/keys${query ? `?${query}` : ''}`);
  },
  getKey: (id) => request(`/keys/${id}`),
  createKey: (body) => request('/keys', { method: 'POST', body: JSON.stringify(body) }),
  updateKey: (id, body) => request(`/keys/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteKey: (id) => request(`/keys/${id}`, { method: 'DELETE' }),
  revealKey: (id) => request(`/keys/${id}/reveal`, { method: 'POST' }),
  health: () => request('/health'),
};