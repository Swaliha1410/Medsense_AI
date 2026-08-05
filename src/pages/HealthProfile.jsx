import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Heart, AlertTriangle, Save, CheckCircle, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { profile as profileApi } from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function HealthProfile() {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    phone: '',
    date_of_birth: '',
    blood_group: '',
    allergies: '',
    gender: '',
    height: '',
    weight: '',
    emergency_contact: '',
    emergency_phone: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    profileApi
      .get()
      .then((data) => {
        setForm({
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          blood_group: data.blood_group || '',
          allergies: data.allergies || '',
          gender: data.gender || '',
          height: data.height || '',
          weight: data.weight || '',
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn, navigate])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await profileApi.update({
        phone: form.phone,
        date_of_birth: form.date_of_birth || null,
        blood_group: form.blood_group,
        allergies: form.allergies,
        gender: form.gender,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        emergency_contact: form.emergency_contact,
        emergency_phone: form.emergency_phone,
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
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-[#0F6FFF]/30 border-t-[#0F6FFF] rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 mb-6 border border-[#E2E8F0]"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F172A] mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#0F6FFF]" />
        </div>
        {title}
      </h2>
      {children}
    </motion.div>
  )

  const Field = ({ label, name, type = 'text', placeholder, children }) => (
    <div>
      <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
      {children || (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white"
        />
      )}
    </div>
  )

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Your Health Profile</h1>
          <p className="text-[#64748B]">
            Keep your health information updated to personalize your MedSense experience
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <Section title="Personal Information" icon={User}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">Name</label>
                <input
                  type="text"
                  value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
                  disabled
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] text-[#64748B]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] text-[#64748B]"
                />
              </div>
              <Field label="Phone" name="phone" type="tel" placeholder="+1 555-0100" />
              <Field label="Date of Birth" name="date_of_birth" type="date" />
              <Field label="Gender" name="gender">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white"
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* Health Info */}
          <Section title="Health Information" icon={Heart}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Blood Group" name="blood_group">
                <select
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Height (cm)" name="height" type="number" placeholder="170" />
              <Field label="Weight (kg)" name="weight" type="number" placeholder="70" />
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List any known allergies (medications, food, etc.)..."
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 bg-white resize-none"
                />
              </div>
            </div>
          </Section>

          {/* Emergency Contact */}
          <Section title="Emergency Information" icon={AlertTriangle}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Emergency Contact Name"
                name="emergency_contact"
                placeholder="Jane Doe"
              />
              <Field
                label="Emergency Contact Phone"
                name="emergency_phone"
                type="tel"
                placeholder="+1 555-9999"
              />
            </div>
          </Section>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F0F9FF] rounded-2xl p-6 mb-6 border border-[#0F6FFF]/10"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#0F6FFF] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#0F172A] mb-2">Privacy & Security</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Your health information is private and securely stored. We use industry-standard
                  encryption to protect your data. Your information is never shared with third
                  parties without your explicit consent.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
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
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-[#22C55E] text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" /> Saved successfully!
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
