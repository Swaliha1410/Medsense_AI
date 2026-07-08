import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Bell, Globe, Shield, Trash2, ArrowLeft, Moon, Sun, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Hindi', 'Mandarin', 'Portuguese']
const VOICES    = ['Default', 'Female (US)', 'Male (US)', 'Female (UK)', 'Male (UK)']

export default function Settings() {
  const { isLoggedIn, logout, user } = useAuth()
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    voice_enabled:      true,
    voice_type:         'Default',
    speech_rate:        1.0,
    notifications:      true,
    email_alerts:       false,
    language:           'English',
    dark_mode:          false,
    save_chat_history:  true,
    data_sharing:       false,
  })
  const [saved, setSaved]     = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const toggle = (key) => {
    setSettings(p => ({ ...p, [key]: !p[key] }))
    setSaved(false)
  }

  const handleSelect = (key, val) => {
    setSettings(p => ({ ...p, [key]: val }))
    setSaved(false)
  }

  const handleSave = () => {
    // Persist to localStorage for now; extend to backend later
    localStorage.setItem('medsense_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glassmorphism rounded-3xl p-6 mb-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-text mb-4">
        <Icon className="w-5 h-5 text-[#0F6FFF]" /> {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </motion.div>
  )

  const Row = ({ label, desc, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {desc && <p className="text-xs text-text/40 mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  )

  const Toggle = ({ val, onToggle }) => (
    <button onClick={onToggle} className="transition-colors">
      {val
        ? <ToggleRight className="w-8 h-8 text-[#14C8A8]" />
        : <ToggleLeft  className="w-8 h-8 text-text/30" />
      }
    </button>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text/50 hover:text-[#0F6FFF] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-text">Settings</h1>
          <p className="text-text/60 mt-1">Manage your preferences and account</p>
        </motion.div>

        {/* Voice */}
        <Section title="Voice & Audio" icon={Volume2}>
          <Row label="Voice Responses" desc="AI reads answers aloud">
            <Toggle val={settings.voice_enabled} onToggle={() => toggle('voice_enabled')} />
          </Row>
          {settings.voice_enabled && (
            <>
              <Row label="Voice Type">
                <select value={settings.voice_type} onChange={(e) => handleSelect('voice_type', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white">
                  {VOICES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Row>
              <Row label="Speech Rate" desc={`${settings.speech_rate.toFixed(1)}x`}>
                <input type="range" min="0.5" max="2" step="0.1" value={settings.speech_rate}
                  onChange={(e) => handleSelect('speech_rate', parseFloat(e.target.value))}
                  className="w-28 accent-[#0F6FFF]" />
              </Row>
            </>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <Row label="Push Notifications" desc="Medicine reminders & health tips">
            <Toggle val={settings.notifications} onToggle={() => toggle('notifications')} />
          </Row>
          <Row label="Email Alerts" desc="Weekly health summary via email">
            <Toggle val={settings.email_alerts} onToggle={() => toggle('email_alerts')} />
          </Row>
        </Section>

        {/* Language & Display */}
        <Section title="Language & Display" icon={Globe}>
          <Row label="Language">
            <select value={settings.language} onChange={(e) => handleSelect('language', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </Row>
          <Row label="Dark Mode" desc="Coming soon">
            <Toggle val={settings.dark_mode} onToggle={() => toggle('dark_mode')} />
          </Row>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Data" icon={Shield}>
          <Row label="Save Chat History" desc="Store conversations on server">
            <Toggle val={settings.save_chat_history} onToggle={() => toggle('save_chat_history')} />
          </Row>
          <Row label="Anonymous Analytics" desc="Help improve MedSense">
            <Toggle val={settings.data_sharing} onToggle={() => toggle('data_sharing')} />
          </Row>
        </Section>

        {/* Account Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glassmorphism rounded-3xl p-6 mb-6">
          <h2 className="text-base font-bold text-text mb-4">Account</h2>
          <div className="space-y-1">
            <Link to="/health-profile" className="flex items-center justify-between py-3 border-b border-gray-100 group">
              <span className="text-sm font-medium text-text group-hover:text-[#0F6FFF] transition-colors">Edit Health Profile</span>
              <ChevronRight className="w-4 h-4 text-text/30 group-hover:text-[#0F6FFF]" />
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center justify-between py-3 border-b border-gray-100 group">
              <span className="text-sm font-medium text-red-400 group-hover:text-red-600 transition-colors">Log Out</span>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between py-3 group">
              <span className="text-sm font-medium text-red-500 group-hover:text-red-700 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Account
              </span>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          </div>
        </motion.div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-8 py-3.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-xl shadow-lg">
            Save Settings
          </motion.button>
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#14C8A8] text-sm font-medium">
              ✓ Settings saved
            </motion.span>
          )}
        </div>

        {/* Delete confirm modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center text-text mb-2">Delete Account?</h3>
              <p className="text-text/60 text-sm text-center mb-6">This will permanently delete all your data. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-text">Cancel</button>
                <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
