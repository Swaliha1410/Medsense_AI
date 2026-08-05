import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, User as UserIcon,
  MapPin, Heart, Pill, ArrowLeft, KeyRound, ShieldCheck, Phone, AlertCircle, CheckCircle
} from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { auth as authApi } from '../services/api'
import { validatePhoneFormat, detectCountryFromPhone } from '../utils/phoneValidation'

// ── Animated Background ───────────────────────────────────────────────────────
const NODES = [
  { x: '10%', y: '20%' }, { x: '15%', y: '50%' }, { x: '12%', y: '80%' },
  { x: '30%', y: '18%' }, { x: '25%', y: '35%' }, { x: '30%', y: '45%' },
  { x: '28%', y: '62%' }, { x: '30%', y: '75%' }, { x: '50%', y: '25%' },
  { x: '48%', y: '50%' }, { x: '45%', y: '70%' }, { x: '70%', y: '30%' },
  { x: '72%', y: '55%' }, { x: '68%', y: '75%' }, { x: '88%', y: '40%' },
  { x: '90%', y: '65%' },
]
const ICONS = [
  { Icon: MapPin, x: '8%',  y: '15%', size: 'w-8 h-8', delay: 0 },
  { Icon: Heart,  x: '18%', y: '35%', size: 'w-7 h-7', delay: 0.5 },
  { Icon: Pill,   x: '12%', y: '65%', size: 'w-8 h-8', delay: 1 },
  { Icon: MapPin, x: '25%', y: '85%', size: 'w-6 h-6', delay: 1.5 },
  { Icon: Heart,  x: '85%', y: '20%', size: 'w-8 h-8', delay: 2 },
  { Icon: Pill,   x: '75%', y: '40%', size: 'w-7 h-7', delay: 2.5 },
  { Icon: MapPin, x: '92%', y: '60%', size: 'w-8 h-8', delay: 3 },
  { Icon: Heart,  x: '78%', y: '85%', size: 'w-6 h-6', delay: 3.5 },
  { Icon: Pill,   x: '45%', y: '10%', size: 'w-7 h-7', delay: 4 },
  { Icon: MapPin, x: '55%', y: '90%', size: 'w-8 h-8', delay: 4.5 },
]

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(173,216,255,.3) 0%,rgba(240,248,255,.5) 25%,rgba(255,255,255,.8) 50%,rgba(240,253,250,.5) 75%,rgba(168,239,255,.3) 100%)' }} />
      <motion.div className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle,rgba(135,206,250,.6) 0%,rgba(173,216,230,.3) 40%,transparent 70%)' }}
        animate={{ scale: [1,1.1,1], opacity: [.3,.5,.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle,rgba(127,255,212,.5) 0%,rgba(175,238,238,.3) 40%,transparent 70%)' }}
        animate={{ scale: [1.1,1,1.1], opacity: [.25,.4,.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#0F6FFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#14C8A8" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {[['10%','20%','30%','18%'],['10%','20%','25%','35%'],['15%','50%','30%','45%'],
          ['15%','50%','28%','62%'],['12%','80%','30%','75%'],['30%','18%','50%','25%'],
          ['30%','18%','48%','50%'],['25%','35%','50%','25%'],['25%','35%','48%','50%'],
          ['30%','45%','48%','50%'],['30%','45%','45%','70%'],['28%','62%','45%','70%'],
          ['28%','62%','48%','50%'],['30%','75%','45%','70%'],['50%','25%','70%','30%'],
          ['50%','25%','72%','55%'],['48%','50%','70%','30%'],['48%','50%','72%','55%'],
          ['48%','50%','68%','75%'],['45%','70%','72%','55%'],['45%','70%','68%','75%'],
          ['70%','30%','88%','40%'],['72%','55%','88%','40%'],['72%','55%','90%','65%'],
          ['68%','75%','90%','65%'],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lg)" strokeWidth="0.8" />
        ))}
      </svg>
      {NODES.map((n, i) => (
        <motion.div key={i} className="absolute w-2 h-2 rounded-full"
          style={{ left: n.x, top: n.y, background: 'radial-gradient(circle,rgba(15,111,255,.8) 0%,rgba(20,200,168,.4) 100%)', boxShadow: '0 0 8px rgba(15,111,255,.5)' }}
          animate={{ scale: [1,1.4,1], opacity: [.5,.9,.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }} />
      ))}
      {ICONS.map(({ Icon, x, y, size, delay }, i) => (
        <motion.div key={i} className="absolute" style={{ left: x, top: y }}
          animate={{ y: [0,-25,0], rotate: [0,15,-15,0], opacity: [.2,.4,.2] }}
          transition={{ duration: 6+(i%3), repeat: Infinity, ease: 'easeInOut', delay }}>
          <Icon className={`${size} text-[#0F6FFF] opacity-25`} strokeWidth={1.5} />
        </motion.div>
      ))}
      {[...Array(50)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, width: Math.random()>.5?'3px':'4px', height: Math.random()>.5?'3px':'4px', background: 'radial-gradient(circle,rgba(255,255,255,.9) 0%,rgba(173,216,230,.4) 100%)' }}
          animate={{ y: [0,-50,0], opacity: [0,.7,0] }}
          transition={{ duration: 6+Math.random()*5, repeat: Infinity, delay: Math.random()*5, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

// ── Forgot Password (3-step) ──────────────────────────────────────────────────
function ForgotPassword({ onBack, prefillUsername }) {
  const [step, setStep]               = useState(1)
  const [email, setEmail]             = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [code, setCode]               = useState('')
  const [newPw, setNewPw]             = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const hasSent = React.useRef(false)   // guard against StrictMode double-invoke

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // Auto-fire once on mount — useRef prevents StrictMode double-send
  useEffect(() => {
    if (!prefillUsername?.trim()) return
    if (hasSent.current) return   // already fired, skip second StrictMode call
    hasSent.current = true
    sendCode()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendCode = async (e) => {
    e?.preventDefault()
    const id = prefillUsername?.trim()
    if (!id) { setError('No username found. Please go back and enter your username on the login page.'); return }
    if (loading) return   // prevent double-fire while a request is in flight
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await authApi.forgotPassword({ email: id })
      if (res.email)        setEmail(res.email)
      if (res.masked_email) setMaskedEmail(res.masked_email)
      setSuccess('Code sent! Check your inbox.')
      setStep(2)
      setResendTimer(60)
    } catch (err) {
      try { setError(JSON.parse(err.message).error || 'Something went wrong.') }
      catch { setError('Could not send reset code. Try again.') }
    } finally { setLoading(false) }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code from your email.'); return }
    setLoading(true); setError('')
    try {
      await authApi.verifyResetCode({ email: email.trim(), code })
      // Only advance if backend confirms the code is correct
      setStep(3)
    } catch (err) {
      try { setError(JSON.parse(err.message).error || 'Incorrect code. Please try again.') }
      catch { setError('Incorrect code. Please try again.') }
    } finally { setLoading(false) }
  }

  const submitNewPassword = async (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return }
    if (newPw.length < 8)   { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      await authApi.resetPassword({ email: email.trim(), code, new_password: newPw, confirm_password: confirmPw })
      setSuccess('Password updated! Redirecting to login…')
      setTimeout(onBack, 2000)
    } catch (err) {
      try { setError(JSON.parse(err.message).error || 'Something went wrong.') }
      catch { setError('Failed to reset password. Try again.') }
    } finally { setLoading(false) }
  }

  const STEPS = [
    { label: 'Code'     },
    { label: 'Password' },
  ]

  return (
    <div>
      {/* back link */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0F6FFF] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </button>

      {/* heading */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Reset Password</h2>
        <p className="text-sm text-gray-500 mt-1">
          {step === 1 && (loading
            ? 'Sending code to your registered email…'
            : error
              ? 'Something went wrong.'
              : 'Sending code…')}
          {step === 2 && (
            <span>Code sent to&nbsp;
              <span className="font-semibold text-[#0F6FFF]">{maskedEmail}</span>
            </span>
          )}
          {step === 3 && 'Choose your new password.'}
        </p>
      </div>

      {/* step indicators — only Code + Password */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const n = i + 2   // steps are 2 and 3 internally
          const active = step === n
          const done   = step > n
          return (
            <React.Fragment key={n}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${active ? 'text-[#0F6FFF]' : done ? 'text-[#14C8A8]' : 'text-gray-300'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${active ? 'border-[#0F6FFF] bg-[#EFF6FF] text-[#0F6FFF]' : done ? 'border-[#14C8A8] bg-[#ECFDF5] text-[#14C8A8]' : 'border-gray-200 text-gray-300'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < 1 && <div className={`flex-1 h-0.5 max-w-[40px] rounded ${step > n ? 'bg-[#14C8A8]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          )
        })}
      </div>

      {/* alerts */}
      <AnimatePresence>
        {error && (
          <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</motion.div>
        )}
        {success && (
          <motion.div key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">{success}</motion.div>
        )}
      </AnimatePresence>

      {/* step 1 — sending spinner (auto, no user input) */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-4">
            {loading
              ? <>
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-[#0F6FFF] rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Sending code to your email…</p>
                </>
              : error
                ? <button onClick={sendCode}
                    className="px-6 py-2.5 bg-[#0F6FFF] text-white font-semibold rounded-xl text-sm hover:bg-[#0E5FE6] transition-all">
                    Retry
                  </button>
                : null}
          </motion.div>
        )}

        {step === 2 && (
          <motion.form key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={verifyCode} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">6-digit code</label>
              <input type="text" inputMode="numeric" maxLength={6}
                value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder="_ _ _ _ _ _" required
                className="w-full text-center tracking-[0.5em] text-xl font-bold px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50" />
              <p className="text-xs text-gray-400 mt-2 text-center">
                {"Didn't receive it? "}
                {resendTimer > 0
                  ? <span>Resend in {resendTimer}s</span>
                  : <button type="button" onClick={sendCode} className="text-[#0F6FFF] font-medium hover:underline">Resend code</button>}
              </p>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 bg-[#0F6FFF] text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0E5FE6] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Verifying…</span></>
                : <><span>Verify Code</span><ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={submitNewPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">New password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={newPw}
                  onChange={e => { setNewPw(e.target.value); setError('') }}
                  placeholder="At least 8 characters" required minLength={8}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setError('') }}
                  placeholder="Repeat password" required
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${confirmPw && confirmPw !== newPw ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]'}`} />
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 bg-[#0F6FFF] text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0E5FE6] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving…</span></>
                : <><span>Set New Password</span><ShieldCheck className="w-5 h-5" /></>}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── AuthPanel (login/register form) ──────────────────────────────────────────
function AuthPanel({ mode, switchMode, error, form, handleChange, handleSubmit,
  showPw, setShowPw, loading, rememberMe, setRememberMe, onForgot,
  handleGoogleSuccess, handleGoogleError }) {
  return (
    <div>
      {/* Logo in card */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Logo className="w-10 h-10" />
        <div className="text-2xl font-bold">
          <span className="text-[#0F6FFF]">Med</span><span className="text-[#14C8A8]">Sense</span>
        </div>
      </div>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#0F172A] mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-gray-500 text-sm">{mode === 'login' ? 'Login to continue to your account' : 'Sign up to get started'}</p>
      </div>
      {/* Tabs */}
      <div className="flex mb-8 border-b border-gray-200">
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${mode === m ? 'text-[#0F6FFF]' : 'text-gray-400'}`}>
            {m === 'login' ? 'Login' : 'Sign Up'}
            {mode === m && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F6FFF]" />}
          </button>
        ))}
      </div>
      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</motion.div>
      )}
      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.form key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-2">First Name</label>
                <input name="first_name" placeholder="John" value={form.first_name} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Last Name</label>
                <input name="last_name" placeholder="Doe" value={form.last_name} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              {mode === 'register' ? 'Email' : 'Username'}
            </label>
            <div className="relative">
              {mode === 'register'
                ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                : <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
              <input name={mode === 'register' ? 'email' : 'username'} type={mode === 'register' ? 'email' : 'text'}
                placeholder={mode === 'register' ? 'Enter your email' : 'Enter your username'}
                value={mode === 'register' ? form.email : form.username}
                onChange={handleChange} required
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all" />
            </div>
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Username</label>
              <input name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input name="password" type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                value={form.password} onChange={handleChange} required
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Confirm Password</label>
              <input name="password2" type="password" placeholder="Confirm your password"
                value={form.password2} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all" />
            </div>
          )}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-gray-50 transition-all"
                  />
                </div>
                {form.phone && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 text-xs">
                    {validatePhoneFormat(form.phone).valid ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-green-600 font-medium">Valid phone number</p>
                          {detectCountryFromPhone(form.phone) && (
                            <p className="text-gray-500">Country: {detectCountryFromPhone(form.phone)}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-600">{validatePhoneFormat(form.phone).message}</p>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0F6FFF] focus:ring-[#0F6FFF]" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" onClick={onForgot} className="text-[#0F6FFF] hover:underline font-medium">
                Forgot Password?
              </button>
            </div>
          )}
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 bg-[#0F6FFF] text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0E5FE6] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Please wait…</span></>
              : <><span>{mode === 'login' ? 'Login' : 'Sign Up'}</span><ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </motion.form>
      </AnimatePresence>
      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">or continue with</span></div>
      </div>
      {/* Social */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
            theme="outline" size="large" text={mode === 'login' ? 'signin_with' : 'signup_with'}
            shape="rectangular" width="100%" logo_alignment="left" />
        </div>
        <button type="button" className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>
      </div>
      {/* Switch mode */}
      <p className="text-center text-sm text-gray-600 mt-8">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="text-[#0F6FFF] font-semibold hover:underline">
          {mode === 'login' ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  )
}

// ── Main Auth Component ───────────────────────────────────────────────────────
export default function Auth() {
  const [params]      = useSearchParams()
  const [mode, setMode]       = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '', phone: '' })

  const { login, register, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (isLoggedIn) navigate('/dashboard', { replace: true }) }, [isLoggedIn])

  const handleChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && form.password !== form.password2) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      if (mode === 'login') await login({ username: form.username, password: form.password })
      else await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message)
        const first = Object.values(parsed)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } catch { setError(mode === 'login' ? 'Invalid username or password.' : 'Registration failed. Try again.') }
    } finally { setLoading(false) }
  }

  const switchMode = m => { setMode(m); setError('') }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true); setError('')
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/dashboard', { replace: true })
      } else { setError(data.error || 'Google login failed. Please try again.') }
    } catch { setError('Failed to connect to server. Please check if Django backend is running.') }
    finally { setLoading(false) }
  }

  const handleGoogleError = () => setError('Google login failed. Please try again.')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }} className="w-full max-w-xl">

          {/* Logo above card */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <Logo className="w-10 h-10" />
            <div className="text-2xl font-bold">
              <span className="text-[#0F6FFF]">Med</span><span className="text-[#14C8A8]">Sense</span>
            </div>
          </Link>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-200/50 p-12 border border-gray-100">
            {showForgot
              ? <ForgotPassword
                  onBack={() => { setShowForgot(false); setError('') }}
                  prefillUsername={form.username}
                />
              : <AuthPanel
                  mode={mode} switchMode={switchMode} error={error}
                  form={form} handleChange={handleChange} handleSubmit={handleSubmit}
                  showPw={showPw} setShowPw={setShowPw} loading={loading}
                  rememberMe={rememberMe} setRememberMe={setRememberMe}
                  onForgot={() => { setShowForgot(true); setError('') }}
                  handleGoogleSuccess={handleGoogleSuccess}
                  handleGoogleError={handleGoogleError}
                />
            }
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
