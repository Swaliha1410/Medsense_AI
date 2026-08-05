import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Globe, Shield, Trash2, ChevronRight, Download,
  Lock, User, LogOut, Palette, X, Eye, EyeOff,
  Mail, KeyRound, ShieldCheck, ArrowRight, AlertCircle
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { auth as authApi } from '../services/api'

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Hindi', 'Mandarin', 'Portuguese']

// ── Reusable Modal Shell ───────────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
      >
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </div>
  )
}

function Alert({ type, msg }) {
  if (!msg) return null
  const is_err = type === 'error'
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2 ${
        is_err ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-green-50 border border-green-200 text-green-600'
      }`}>
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      {msg}
    </motion.div>
  )
}

// ── Email Change Modal (2-step) ───────────────────────────────────────────────
function EmailChangeModal({ open, onClose, onSuccess }) {
  const [step, setStep]         = useState(1)   // 1=enter new email, 2=enter OTP
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  React.useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const reset = () => { setStep(1); setNewEmail(''); setCode(''); setError(''); setSuccess(''); setResendTimer(0) }
  const handleClose = () => { reset(); onClose() }

  const sendCode = async (e) => {
    e?.preventDefault()
    if (!newEmail.trim()) { setError('Please enter a new email address.'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await authApi.requestEmailChange({ new_email: newEmail.trim().toLowerCase() })
      setSuccess('Verification code sent to your new email.')
      setStep(2); setResendTimer(60)
    } catch (err) {
      try { setError(JSON.parse(err.message).error || 'Something went wrong.') }
      catch { setError('Failed to send code. Try again.') }
    } finally { setLoading(false) }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code sent to your new email.'); return }
    setLoading(true); setError('')
    try {
      const res = await authApi.confirmEmailChange({ code })
      setSuccess('Email updated successfully!')
      onSuccess(res.email)
      setTimeout(handleClose, 1500)
    } catch (err) {
      try { setError(JSON.parse(err.message).error || 'Incorrect code. Try again.') }
      catch { setError('Incorrect code. Try again.') }
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
          <Mail className="w-5 h-5 text-[#0F6FFF]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">Change Email</h3>
          <p className="text-xs text-[#64748B]">{step === 1 ? 'Enter your new email address' : `Code sent to ${newEmail}`}</p>
        </div>
      </div>

      {/* step pills */}
      <div className="flex gap-2 mb-6">
        {[1, 2].map(n => (
          <div key={n} className={`flex-1 h-1.5 rounded-full transition-all ${step >= n ? 'bg-[#0F6FFF]' : 'bg-[#E2E8F0]'}`} />
        ))}
      </div>

      <Alert type="error" msg={error} />
      <Alert type="success" msg={success} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="s1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            onSubmit={sendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">New email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); setError('') }}
                  placeholder="new@example.com" required
                  className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-[#F8FAFC]" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#0F6FFF] text-white font-semibold rounded-xl hover:bg-[#0E5FE6] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Sending…</span></>
                : <><span>Send Verification Code</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}
        {step === 2 && (
          <motion.form key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            onSubmit={verifyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">6-digit verification code</label>
              <input type="text" inputMode="numeric" maxLength={6}
                value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder="_ _ _ _ _ _"
                className="w-full text-center tracking-[0.5em] text-xl font-bold px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-[#F8FAFC]" />
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                {"Didn't receive it? "}
                {resendTimer > 0 ? <span>Resend in {resendTimer}s</span>
                  : <button type="button" onClick={sendCode} className="text-[#0F6FFF] font-medium hover:underline">Resend</button>}
              </p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#0F6FFF] text-white font-semibold rounded-xl hover:bg-[#0E5FE6] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Verifying…</span></>
                : <><span>Confirm Email Change</span><ShieldCheck className="w-4 h-4" /></>}
            </button>
            <button type="button" onClick={() => { setStep(1); setError('') }}
              className="w-full py-2.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              ← Change email address
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  )
}

// ── Password Change Modal ─────────────────────────────────────────────────────
function PasswordChangeModal({ open, onClose }) {
  const [form, setForm]     = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const navigate              = useNavigate()

  const handleClose = () => { setForm({ current: '', newPw: '', confirm: '' }); setError(''); setSuccess(''); onClose() }
  const ch = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPw !== form.confirm) { setError('New passwords do not match.'); return }
    if (form.newPw.length < 8)       { setError('New password must be at least 8 characters.'); return }
    if (form.current === form.newPw) { setError('New password must be different from current.'); return }
    setLoading(true); setError('')
    try {
      const res = await authApi.changePassword({
        current_password: form.current,
        new_password:     form.newPw,
        confirm_password: form.confirm,
      })
      // Rotate the stored token
      localStorage.setItem('medsense_token', res.token)
      setSuccess('Password changed successfully!')
      setTimeout(handleClose, 1500)
    } catch (err) {
      try { setError(JSON.parse(err.message).error || 'Something went wrong.') }
      catch { setError('Failed to change password. Try again.') }
    } finally { setLoading(false) }
  }

  const PwInput = ({ label, field, showKey }) => (
    <div>
      <label className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type={showPw[showKey] ? 'text' : 'password'} value={form[field]}
          onChange={e => ch(field, e.target.value)} required
          placeholder={label}
          className="w-full pl-10 pr-10 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] bg-[#F8FAFC]" />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-[#0F6FFF]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">Change Password</h3>
          <p className="text-xs text-[#64748B]">Enter your current password to continue</p>
        </div>
      </div>

      <Alert type="error" msg={error} />
      <Alert type="success" msg={success} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <PwInput label="Current password" field="current" showKey="current" />

        {/* Confirm pass hint border */}
        <div className="border-t border-[#E2E8F0] pt-4 space-y-4">
          <PwInput label="New password" field="newPw" showKey="new" />
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Confirm new password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw.new ? 'text' : 'password'} value={form.confirm}
                onChange={e => ch('confirm', e.target.value)} required placeholder="Confirm new password"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-[#F8FAFC] ${
                  form.confirm && form.confirm !== form.newPw
                    ? 'border-red-300 focus:ring-red-200' : 'border-[#E2E8F0] focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF]'}`} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#0F6FFF] text-white font-semibold rounded-xl hover:bg-[#0E5FE6] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving…</span></>
            : <><span>Change Password</span><ShieldCheck className="w-4 h-4" /></>}
        </button>

        {/* Forgot password fallback */}
        <p className="text-center text-xs text-[#64748B] pt-1">
          Forgot your current password?{' '}
          <button type="button" onClick={() => { handleClose(); navigate('/auth') }}
            className="text-[#0F6FFF] font-semibold hover:underline">
            Use Forgot Password
          </button>
        </p>
      </form>
    </Modal>
  )
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const { logout, user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { language, changeLanguage } = useLanguage()

  const [settings, setSettings] = useState({
    medicineReminders: true, aiUpdates: true, hospitalAlerts: false, language, theme: 'light',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEmailModal, setShowEmailModal]       = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const toggle = key => setSettings(p => ({ ...p, [key]: !p[key] }))
  const handleSelect = (key, val) => {
    setSettings(p => ({ ...p, [key]: val }))
    if (key === 'language') changeLanguage(val)
  }
  const handleLogout = async () => { await logout(); navigate('/auth') }
  const handleDownloadData = () => alert('Your data download will begin shortly. Check your email for the link.')
  const handleDeleteAccount = () => { setShowDeleteConfirm(false); handleLogout() }

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 mb-5 border border-[#E2E8F0]">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F172A] mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#0F6FFF]" />
        </div>
        {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </motion.div>
  )

  const Row = ({ label, desc, children, onClick }) => (
    <div
      className={`flex items-center justify-between py-3.5 border-b border-[#E2E8F0] last:border-0 ${
        onClick ? 'cursor-pointer hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors' : ''}`}
      onClick={onClick}>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        {desc && <p className="text-xs text-[#64748B] mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  )

  const Toggle = ({ val, onToggle }) => (
    <button onClick={e => { e.stopPropagation(); onToggle() }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${val ? 'bg-[#0F6FFF]' : 'bg-[#E2E8F0]'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Settings</h1>
          <p className="text-[#64748B]">Manage your account and preferences</p>
        </motion.div>

        {/* Account */}
        <Section title="Account" icon={User}>
          {/* Profile → navigates to /health-profile */}
          <Row
            label="Profile"
            desc={user?.email || user?.username}
            onClick={() => navigate('/health-profile')}
          >
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Row>

          {/* Email change */}
          <Row
            label="Email"
            desc={user?.email ? `Current: ${user.email}` : 'Add an email address'}
            onClick={() => setShowEmailModal(true)}
          >
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Row>

          {/* Password change */}
          <Row
            label="Password"
            desc="Change your account password"
            onClick={() => setShowPasswordModal(true)}
          >
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Row>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <Row label="Medicine Reminders" desc="Get notified about scheduled medications">
            <Toggle val={settings.medicineReminders} onToggle={() => toggle('medicineReminders')} />
          </Row>
          <Row label="AI Updates" desc="Health insights and AI recommendations">
            <Toggle val={settings.aiUpdates} onToggle={() => toggle('aiUpdates')} />
          </Row>
          <Row label="Hospital Alerts" desc="Nearby hospital updates and alerts">
            <Toggle val={settings.hospitalAlerts} onToggle={() => toggle('hospitalAlerts')} />
          </Row>
        </Section>

        {/* Privacy & Security */}
        <Section title="Privacy & Security" icon={Shield}>
          <Row label="Data Privacy" desc="How we handle your information">
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Row>
          <Row label="Manage Health Data" desc="Control what data is stored">
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Row>
          <Row label="Download My Data" desc="Export all your health information" onClick={handleDownloadData}>
            <Download className="w-5 h-5 text-[#0F6FFF]" />
          </Row>
          <Row label="Delete Account" desc="Permanently delete your account and data" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-5 h-5 text-[#EF4444]" />
          </Row>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon={Palette}>
          <Row label="Language">
            <select value={settings.language} onChange={e => handleSelect('language', e.target.value)}
              onClick={e => e.stopPropagation()}
              className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </Row>
          <Row label="Theme" desc="Coming soon">
            <select value={settings.theme} onChange={e => handleSelect('theme', e.target.value)}
              onClick={e => e.stopPropagation()} disabled
              className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 outline-none bg-[#F8FAFC] text-[#94A3B8]">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </Row>
        </Section>

        {/* Account Actions */}
        <Section title="Account Actions" icon={Lock}>
          <Row label="Log Out" desc="Sign out of your account" onClick={handleLogout}>
            <LogOut className="w-5 h-5 text-[#64748B]" />
          </Row>
        </Section>

        {/* ── Modals ── */}
        <EmailChangeModal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => { refreshUser(); setShowEmailModal(false) }}
        />

        <PasswordChangeModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />

        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h3 className="text-xl font-bold text-center text-[#0F172A] mb-2">Delete Account?</h3>
              <p className="text-[#64748B] text-sm text-center mb-6 leading-relaxed">
                This will permanently delete all your data including health records, chat history, and medical reports. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border-2 border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-[#EF4444] text-white rounded-xl text-sm font-semibold hover:bg-[#DC2626] transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
