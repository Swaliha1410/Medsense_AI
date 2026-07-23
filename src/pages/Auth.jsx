import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, MessageSquare, Activity, Building2, Mail, Lock, MapPin, Heart, Pill } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

// Animated Background with Neural Network
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - soft blue to light with teal accent */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(173, 216, 255, 0.3) 0%, rgba(240, 248, 255, 0.5) 25%, rgba(255, 255, 255, 0.8) 50%, rgba(240, 253, 250, 0.5) 75%, rgba(168, 239, 255, 0.3) 100%)'
      }} />
      
      {/* Large soft blue glow - top right */}
      <motion.div
        className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(135, 206, 250, 0.6) 0%, rgba(173, 216, 230, 0.3) 40%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Soft teal/cyan glow - bottom */}
      <motion.div
        className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(127, 255, 212, 0.5) 0%, rgba(175, 238, 238, 0.3) 40%, transparent 70%)'
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Neural Network - Dense interconnected lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F6FFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#14C8A8" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* Create a neural network pattern */}
        {/* Horizontal layer connections */}
        <line x1="10%" y1="20%" x2="30%" y2="18%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="10%" y1="20%" x2="25%" y2="35%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="15%" y1="50%" x2="30%" y2="45%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="15%" y1="50%" x2="28%" y2="62%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="12%" y1="80%" x2="30%" y2="75%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        
        {/* Middle layer */}
        <line x1="30%" y1="18%" x2="50%" y2="25%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="30%" y1="18%" x2="48%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="25%" y1="35%" x2="50%" y2="25%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="25%" y1="35%" x2="48%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="30%" y1="45%" x2="48%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="30%" y1="45%" x2="45%" y2="70%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="28%" y1="62%" x2="45%" y2="70%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="28%" y1="62%" x2="48%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="30%" y1="75%" x2="45%" y2="70%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        
        {/* Right side connections */}
        <line x1="50%" y1="25%" x2="70%" y2="30%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="50%" y1="25%" x2="72%" y2="55%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="48%" y1="50%" x2="70%" y2="30%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="48%" y1="50%" x2="72%" y2="55%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="48%" y1="50%" x2="68%" y2="75%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="45%" y1="70%" x2="72%" y2="55%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="45%" y1="70%" x2="68%" y2="75%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        
        {/* Far right */}
        <line x1="70%" y1="30%" x2="88%" y2="40%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="72%" y1="55%" x2="88%" y2="40%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="72%" y1="55%" x2="90%" y2="65%" stroke="url(#lineGrad)" strokeWidth="0.8" />
        <line x1="68%" y1="75%" x2="90%" y2="65%" stroke="url(#lineGrad)" strokeWidth="0.8" />
      </svg>

      {/* Neural Network Nodes */}
      {[
        { x: '10%', y: '20%' }, { x: '15%', y: '50%' }, { x: '12%', y: '80%' },
        { x: '30%', y: '18%' }, { x: '25%', y: '35%' }, { x: '30%', y: '45%' }, { x: '28%', y: '62%' }, { x: '30%', y: '75%' },
        { x: '50%', y: '25%' }, { x: '48%', y: '50%' }, { x: '45%', y: '70%' },
        { x: '70%', y: '30%' }, { x: '72%', y: '55%' }, { x: '68%', y: '75%' },
        { x: '88%', y: '40%' }, { x: '90%', y: '65%' },
      ].map((node, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            left: node.x, 
            top: node.y,
            background: 'radial-gradient(circle, rgba(15, 111, 255, 0.8) 0%, rgba(20, 200, 168, 0.4) 100%)',
            boxShadow: '0 0 8px rgba(15, 111, 255, 0.5)'
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}


      {/* Floating Medical Icon Particles */}
      {[
        { Icon: MapPin, x: '8%', y: '15%', size: 'w-8 h-8', delay: 0 },
        { Icon: Heart, x: '18%', y: '35%', size: 'w-7 h-7', delay: 0.5 },
        { Icon: Pill, x: '12%', y: '65%', size: 'w-8 h-8', delay: 1 },
        { Icon: MapPin, x: '25%', y: '85%', size: 'w-6 h-6', delay: 1.5 },
        { Icon: Heart, x: '85%', y: '20%', size: 'w-8 h-8', delay: 2 },
        { Icon: Pill, x: '75%', y: '40%', size: 'w-7 h-7', delay: 2.5 },
        { Icon: MapPin, x: '92%', y: '60%', size: 'w-8 h-8', delay: 3 },
        { Icon: Heart, x: '78%', y: '85%', size: 'w-6 h-6', delay: 3.5 },
        { Icon: Pill, x: '45%', y: '10%', size: 'w-7 h-7', delay: 4 },
        { Icon: MapPin, x: '55%', y: '90%', size: 'w-8 h-8', delay: 4.5 },
      ].map(({ Icon, x, y, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            duration: 6 + (i % 3), 
            repeat: Infinity, 
            ease: "easeInOut",
            delay 
          }}
        >
          <Icon 
            className={`${size} text-[#0F6FFF] opacity-25`} 
            strokeWidth={1.5} 
          />
        </motion.div>
      ))}

      {/* Floating particles - softer and more subtle */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() > 0.5 ? '3px' : '4px',
            height: Math.random() > 0.5 ? '3px' : '4px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(173, 216, 230, 0.4) 100%)'
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}


export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  })

  const { login, register, isLoggedIn } = useAuth()
  const navigate = useNavigate()

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
        const first = Object.values(parsed)[0]
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center relative"
    >
      <AnimatedBackground />

      {/* Left Panel - Logo Only */}
      <div className="hidden w-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <Logo className="w-12 h-12" />
          <div className="text-3xl font-bold">
            <span className="text-[#0F6FFF]">Med</span>
            <span className="text-[#14C8A8]">Sense</span>
          </div>
        </Link>
      </div>


      {/* Right Panel - Auth Form - Centered */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-full max-w-xl"
        >
          {/* Logo at top */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <Logo className="w-10 h-10" />
            <div className="text-2xl font-bold">
              <span className="text-[#0F6FFF]">Med</span>
              <span className="text-[#14C8A8]">Sense</span>
            </div>
          </Link>

          {/* White Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-200/50 p-12 border border-gray-100">
            {/* Logo in card */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Logo className="w-10 h-10" />
              <div className="text-2xl font-bold">
                <span className="text-[#0F6FFF]">Med</span>
                <span className="text-[#14C8A8]">Sense</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm">
                {mode === 'login' ? 'Login to continue to your account' : 'Sign up to get started'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex mb-8 border-b border-gray-200">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                  mode === 'login' ? 'text-[#0F6FFF]' : 'text-gray-400'
                }`}
              >
                Login
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F6FFF]"
                  />
                )}
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                  mode === 'register' ? 'text-[#0F6FFF]' : 'text-gray-400'
                }`}
              >
                Sign Up
                {mode === 'register' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F6FFF]"
                  />
                )}
              </button>
            </div>


            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {mode === 'register' && (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          First Name
                        </label>
                        <input
                          name="first_name"
                          placeholder="John"
                          value={form.first_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Last Name
                        </label>
                        <input
                          name="last_name"
                          placeholder="Doe"
                          value={form.last_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email/Username */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {mode === 'register' ? 'Email' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name={mode === 'register' ? 'email' : 'username'}
                      type={mode === 'register' ? 'email' : 'text'}
                      placeholder="Enter your email"
                      value={mode === 'register' ? form.email : form.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Username
                    </label>
                    <input
                      name="username"
                      placeholder="Choose a username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                    />
                  </div>
                )}


                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Confirm Password
                    </label>
                    <input
                      name="password2"
                      type="password"
                      placeholder="Confirm your password"
                      value={form.password2}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                    />
                  </div>
                )}

                {/* Remember me & Forgot password */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0F6FFF] focus:ring-[#0F6FFF]"
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-[#0F6FFF] hover:underline font-medium">
                      Forgot Password?
                    </a>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3.5 bg-[#0F6FFF] text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0E5FE6] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>


            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-600 mt-8">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-[#0F6FFF] font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
