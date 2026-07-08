/**
 * Medsense AI — API Service
 * All calls to the Django backend go through this file.
 * Base URL: http://localhost:8000/api
 */

const BASE_URL = 'http://localhost:8000/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('medsense_token')
}

function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  }
}

async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: isFormData
      ? { ...(getToken() ? { Authorization: `Token ${getToken()}` } : {}) }
      : authHeaders(),
  }

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(JSON.stringify(err))
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}


// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  /**
   * Register a new account.
   * @param {{ username, email, first_name, last_name, password, password2 }} data
   */
  register(data) {
    return request('POST', '/auth/register/', data)
  },

  /**
   * Login and persist the token to localStorage.
   * @param {{ username, password }} data
   */
  async login(data) {
    const result = await request('POST', '/auth/login/', data)
    localStorage.setItem('medsense_token', result.token)
    return result
  },

  /** Logout and clear the stored token. */
  async logout() {
    await request('POST', '/auth/logout/')
    localStorage.removeItem('medsense_token')
  },

  /** Return the currently authenticated user. */
  me() {
    return request('GET', '/auth/me/')
  },

  isLoggedIn() {
    return Boolean(getToken())
  },
}


// ── Profile ───────────────────────────────────────────────────────────────────

export const profile = {
  get()         { return request('GET',   '/profile/') },
  update(data)  { return request('PATCH', '/profile/', data) },
}


// ── Chat ──────────────────────────────────────────────────────────────────────

export const chat = {
  list()          { return request('GET',    '/chat/') },
  send(data)      { return request('POST',   '/chat/', data) },
  remove(id)      { return request('DELETE', `/chat/${id}/`) },
}


// ── Health Score ──────────────────────────────────────────────────────────────

export const healthScore = {
  list()          { return request('GET',  '/health-scores/') },
  latest()        { return request('GET',  '/health-scores/latest/') },
  add(data)       { return request('POST', '/health-scores/', data) },
}


// ── Medicine Reminders ────────────────────────────────────────────────────────

export const medicines = {
  list(status)    {
    const qs = status ? `?status=${status}` : ''
    return request('GET', `/medicines/${qs}`)
  },
  add(data)       { return request('POST',   '/medicines/', data) },
  update(id, data){ return request('PATCH',  `/medicines/${id}/`, data) },
  remove(id)      { return request('DELETE', `/medicines/${id}/`) },
}


// ── Medical Reports ───────────────────────────────────────────────────────────

export const reports = {
  list() { return request('GET', '/reports/') },

  /** Upload a file using FormData */
  upload(title, file) {
    const form = new FormData()
    form.append('title', title)
    form.append('file', file)
    return request('POST', '/reports/', form, true)
  },

  remove(id) { return request('DELETE', `/reports/${id}/`) },
}


// ── Hospital Searches ─────────────────────────────────────────────────────────

export const hospitalSearches = {
  list()        { return request('GET',    '/hospital-searches/') },
  save(data)    { return request('POST',   '/hospital-searches/', data) },
  remove(id)    { return request('DELETE', `/hospital-searches/${id}/`) },
}


// ── Contact / CTA ─────────────────────────────────────────────────────────────

export const contact = {
  /**
   * Submit the Get Started / contact form. No auth required.
   * @param {{ name, email, message }} data
   */
  submit(data) {
    return request('POST', '/contact/', data)
  },
}
