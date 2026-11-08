const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${body}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  listTasks: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
    ).toString()
    return request(`/api/tasks${query ? `?${query}` : ''}`)
  },
  getCounts: () => request('/api/tasks/counts'),
  createTask: (task) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, patch) =>
    request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
}

export { API_BASE_URL }
