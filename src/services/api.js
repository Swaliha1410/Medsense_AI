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

  forgotPassword(data) {
    return request('POST', '/auth/forgot-password/', data)
  },

  verifyResetCode(data) {
    return request('POST', '/auth/verify-reset-code/', data)
  },

  resetPassword(data) {
    return request('POST', '/auth/reset-password/', data)
  },

  /** Send OTP to the new email address (auth required). */
  requestEmailChange(data) {
    return request('POST', '/auth/request-email-change/', data)
  },

  /** Verify OTP and apply the new email in the DB (auth required). */
  confirmEmailChange(data) {
    return request('POST', '/auth/confirm-email-change/', data)
  },

  /**
   * Change password — verifies current password first (auth required).
   * Returns a new token on success; caller should update localStorage.
   */
  changePassword(data) {
    return request('POST', '/auth/change-password/', data)
  },
}


// ── Profile ───────────────────────────────────────────────────────────────────

export const profile = {
  get()         { return request('GET',   '/profile/') },
  update(data)  { return request('PATCH', '/profile/', data) },
}


// ── Chat ──────────────────────────────────────────────────────────────────────

export const chat = {
  /** List all messages, optionally filtered by session_id */
  list(session_id)  {
    const qs = session_id ? `?session_id=${encodeURIComponent(session_id)}` : ''
    return request('GET', `/chat/${qs}`)
  },

  /**
   * List all distinct chat sessions for the current user.
   * Returns [{ session_id, title, last_message_at, message_count }, ...]
   */
  sessions()        { return request('GET', '/chat/sessions/') },

  send(data)        { return request('POST',   '/chat/', data) },
  remove(id)        { return request('DELETE', `/chat/${id}/`) },

  /**
   * Delete all messages in a session.
   * Fetches the messages first, then bulk-deletes them.
   */
  async removeSession(session_id) {
    const data = await request('GET', `/chat/?session_id=${encodeURIComponent(session_id)}`)
    const msgs = data?.results || data || []
    await Promise.all(msgs.map((m) => request('DELETE', `/chat/${m.id}/`)))
  },
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

  /** Trigger AI analysis on a stored report by its ID */
  analyze(reportId) {
    return request('POST', '/ai/analyze-report/', { report_id: reportId })
  },

  /** Analyse raw pasted lab text directly */
  analyzeText(reportText) {
    return request('POST', '/ai/analyze-report/', { report_text: reportText })
  },
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


// ── AI Engine ─────────────────────────────────────────────────────────────────

export const ai = {
  /**
   * Send a chat message to the AI engine.
   * @param {{ message: string, history?: Array, session_id?: string }} data
   * @returns {{ response: string, intent: string, disease_info: object|null }}
   */
  chat(data) {
    return request('POST', '/ai/chat/', data)
  },

  /**
   * Analyse symptoms and get structured medical guidance.
   * @param {{
   *   symptoms: string,
   *   age?: string,
   *   severity?: 'mild'|'moderate'|'severe',
   *   duration?: 'today'|'few_days'|'weeks'|'more',
   *   existing_conditions?: string,
   *   medications?: string,
   *   allergies?: string,
   * }} data
   */
  analyzeSymptoms(data) {
    return request('POST', '/ai/analyze-symptoms/', data)
  },

  /**
   * Analyse pasted lab report text.
   * @param {{ report_text: string } | { report_id: number }} data
   * @returns {{ findings: Array, summary: string, abnormal_count: number }}
   */
  analyzeReport(data) {
    return request('POST', '/ai/analyze-report/', data)
  },

  /**
   * Get real-time model accuracy metrics computed from the loaded datasets.
   * Cached server-side for 1 hour.
   * @returns {{ overall_accuracy: number, symptom_top3_accuracy: number, ... }}
   */
  getAccuracy() {
    return request('GET', '/ai/accuracy/')
  },
}
