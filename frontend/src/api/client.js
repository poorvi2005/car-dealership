/**
 * The only file that talks to the backend.
 *
 * Every request goes through `request()`, which:
 *  - prefixes the API base URL (from VITE_API_URL),
 *  - attaches the JWT as "Authorization: Bearer <token>" when we have one,
 *  - turns FastAPI error bodies into a readable message on an ApiError.
 */
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const TOKEN_KEY = 'forecourt_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// The auth context registers a callback here so an expired token logs the user out.
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

/** FastAPI returns `detail` as a string, or for validation errors, a list of problems. */
export function readableError(detail, fallback = 'Something went wrong. Try again.') {
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : ''
        const msg = (d.msg || '').replace(/^Value error, /, '')
        return field && field !== 'body' ? `${field.replace(/_/g, ' ')}: ${msg}` : msg
      })
      .join('. ')
  }
  return fallback
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(API_URL + path)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError("Can't reach the server. Check that the API is running.", 0)
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized()
    throw new ApiError(readableError(data?.detail), res.status)
  }
  return data
}

export const api = {
  // auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me'),

  // vehicles
  listVehicles: () => request('/api/vehicles'),
  searchVehicles: (filters) => request('/api/vehicles/search', { params: filters }),
  categories: () => request('/api/vehicles/categories'),
  createVehicle: (vehicle) => request('/api/vehicles', { method: 'POST', body: vehicle }),
  updateVehicle: (id, changes) => request(`/api/vehicles/${id}`, { method: 'PUT', body: changes }),
  deleteVehicle: (id) => request(`/api/vehicles/${id}`, { method: 'DELETE' }),

  // inventory
  purchase: (id, quantity = 1) => request(`/api/vehicles/${id}/purchase`, { method: 'POST', body: { quantity } }),
  restock: (id, quantity) => request(`/api/vehicles/${id}/restock`, { method: 'POST', body: { quantity } }),
}
