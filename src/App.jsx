import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Home           from './pages/Home'
import Auth           from './pages/Auth'
import Chat           from './pages/Chat'
import Dashboard      from './pages/Dashboard'
import ChatHistory    from './pages/ChatHistory'
import HospitalMap    from './pages/HospitalMap'
import HospitalDetail from './pages/HospitalDetail'
import NavigatePage   from './pages/Navigate'
import Settings       from './pages/Settings'
import HealthProfile  from './pages/HealthProfile'
import About          from './pages/About'

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0F6FFF]/30 border-t-[#0F6FFF] rounded-full animate-spin" />
      </div>
    )
  }
  return isLoggedIn ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<Home />} />
      <Route path="/auth"      element={<Auth />} />
      <Route path="/about"     element={<About />} />
      <Route path="/hospitals"                 element={<HospitalMap />} />
      <Route path="/hospitals/:osmType/:osmId" element={<HospitalDetail />} />
      <Route path="/hospitals/:id"             element={<HospitalDetail />} />
      <Route path="/navigate"                  element={<NavigatePage />} />
      <Route path="/chat"      element={<Chat />} />

      {/* Protected */}
      <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/chat-history"   element={<PrivateRoute><ChatHistory /></PrivateRoute>} />
      <Route path="/health-profile" element={<PrivateRoute><HealthProfile /></PrivateRoute>} />
      <Route path="/settings"       element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
