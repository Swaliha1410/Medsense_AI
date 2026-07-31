import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)  // checking token on mount

  // On mount – if a token exists, fetch the current user
  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('medsense_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const result = await auth.login(credentials)
    setUser(result.user)
    return result
  }, [])

  const register = useCallback(async (data) => {
    const result = await auth.register(data)
    // auto-login after register
    await auth.login({ username: data.username, password: data.password })
    setUser(result.user)
    return result
  }, [])

  const logout = useCallback(async () => {
    try { await auth.logout() } catch (_) {}
    localStorage.removeItem('medsense_token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(() => {
    return auth.me().then(setUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
