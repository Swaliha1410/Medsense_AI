import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Heart, AlertTriangle, Save, CheckCircle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { profile as profileApi } from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS      = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function HealthProfile() {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', date_of_birth: '', blood_group: '', allergies: '',
    gender: '', height: '', weight: '', emergency_contact: '', emergency_phone: '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth'); return }
    profileApi.get()
      .then((data) => {
        setForm({
          first_name:        user?.first_name        || '',
          last_name:         user?.last_name         || '',
          email:             user?.email             || '',
          phone:             data.phone              || '',
          date_of_birth:     data.date_of_birth      || '',
          blood_group:       data.blood_group        || '',
          allergies:         data.allergies          || '',
          gender:            data.gender             || '',
          height:            data.height             || '',
          weight:            data.weight             || '',
          emergency_contact: data.emergency_contact  || '',
          emergency_phone:   data.emergency_phone    || '',
        })
      })
      .catch(() => {
        setForm(f => ({
          ...f,
          first_name: user?.first_name || '',
          last_name:  user?.last_name  || '',
          email:      user?.email      || '',
        }))
      })
      .finally(() => setLoading(false))
  }, [isLoggedIn, user])

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await profileApi.update({
        phone:             form.phone,
        date_of_birth:     form.date_of_birth || null,
        blood_group:       form.blood_group,
        allergies:         form.allergies,
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <p className="text-text/40 mt-24">Loading…</p>
      </div>
    )
  }

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glassmorphism rounded-3xl p-6 mb-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-text mb-5">
        <Icon className="w-5 h-5 text-[#0F6FFF]" /> {title}
      </h2>
      {children}
    </motion.div>
  )

  const Field = ({ label, name, type = 'text', placeholder, children }) => (
    <div>
      <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">{label}</label>
      {children || (
        <input
          name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white"
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text/50 hover:text-[#0F6FFF] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-text">Health <span className="text-gradient">Profile</span></h1>
          <p className="text-text/60 mt-1">Your personal health information for better AI guidance</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <Section title="Personal Information" icon={User}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First Name"  name="first_name"  placeholder="John" />
              <Field label="Last Name"   name="last_name"   placeholder="Doe" />
              <Field label="Email"       name="email"       type="email" placeholder="john@example.com" />
              <Field label="Phone"       name="phone"       type="tel"   placeholder="+1 555-0100" />
              <Field label="Date of Birth" name="date_of_birth" type="date" />
              <Field label="Gender" name="gender">
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white">
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Medical Info */}
          <Section title="Medical Information" icon={Heart}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Blood Group" name="blood_group">
                <select name="blood_group" value={form.blood_group} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white">
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Height (cm)" name="height" type="number" placeholder="170" />
              <Field label="Weight (kg)" name="weight" type="number" placeholder="70" />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text/50 mb-1.5 uppercase tracking-wide">Allergies</label>
                <textarea
                  name="allergies" value={form.allergies} onChange={handleChange} rows={3}
                  placeholder="List any known allergies (medications, food, etc.)…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white resize-none"
                />
              </div>
            </div>
          </Section>

          {/* Emergency Contact */}
          <Section title="Emergency Contact" icon={AlertTriangle}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Contact Name"  name="emergency_contact" placeholder="Jane Doe" />
              <Field label="Contact Phone" name="emergency_phone"   type="tel" placeholder="+1 555-9999" />
            </div>
          </Section>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4">
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Profile'}
            </motion.button>
            {saved && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-[#14C8A8] text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Saved successfully!
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
