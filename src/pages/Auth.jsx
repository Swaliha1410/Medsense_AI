import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode]       = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  })

  const { login, register, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Already logged in → go to dashboard
  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true })
  }, [isLoggedIn])

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && form.password !== form.password2) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ username: form.username, password: form.password })
      } else {
        await register(form)
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message)
        const first  = Object.values(parsed)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } catch {
        setError(mode === 'login' ? 'Invalid username or password.' : 'Registration failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => { setMode(m); setError('') }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <Logo className="w-12 h-12 brightness-0 invert" />
          <span className="text-2xl font-bold">MedSense</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4">Your health, intelligently managed.</h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            AI-powered health guidance, symptom analysis, and instant hospital finder — all in one place.
          </p>
          <div className="space-y-3">
            {['AI Chat available 24/7', 'Personalised health insights', 'Find hospitals instantly', 'Secure & private'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white/90">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-sm relative z-10">© 2026 MedSense AI</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold text-text">Med<span className="text-[#14C8A8]">Sense</span></span>
          </Link>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white shadow-sm text-text' : 'text-text/50 hover:text-text'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-text mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-text/50 text-sm mb-6">
                {mode === 'login' ? 'Sign in to continue to MedSense' : 'Start your health journey today'}
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">First Name</label>
                        <input name="first_name" placeholder="John" value={form.first_name} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]/50 bg-white" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">Last Name</label>
                        <input name="last_name" placeholder="Doe" value={form.last_name} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]/50 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">Email</label>
                      <input name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]/50 bg-white" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">Username</label>
                  <input name="username" placeholder="your_username" value={form.username} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]/50 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]/50 bg-white pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <input name="password2" type="password" placeholder="••••••••" value={form.password2} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]/50 bg-white" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-text/50">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="text-[#0F6FFF] font-semibold hover:underline">
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-text/30">
            By continuing you agree to our <a href="#" className="hover:underline">Terms</a> and <a href="#" className="hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
