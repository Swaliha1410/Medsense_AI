import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Heart, MapPin, Pill, FileText, Plus, Trash2, Upload, TrendingUp, Clock, Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { healthScore, medicines, reports } from '../services/api'

export default function Dashboard() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [score, setScore]           = useState(null)
  const [pendingMeds, setPendingMeds] = useState([])
  const [reportsCount, setReportsCount] = useState(0)
  const [loadingMeds, setLoadingMeds] = useState(false)

  // New medicine form
  const [medForm, setMedForm] = useState({ medicine_name: '', dosage: '', frequency: 'daily', reminder_time: '08:00' })
  const [showMedForm, setShowMedForm] = useState(false)
  const [savingMed, setSavingMed] = useState(false)

  // Report upload
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadingReport, setUploadingReport] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth'); return }

    healthScore.latest().then(setScore).catch(() => {})

    setLoadingMeds(true)
    medicines.list('pending').then((data) => {
      setPendingMeds(data?.results || data || [])
    }).catch(() => {}).finally(() => setLoadingMeds(false))

    reports.list().then((data) => {
      setReportsCount((data?.results || data || []).length)
    }).catch(() => {})
  }, [isLoggedIn])

  const addMedicine = async (e) => {
    e.preventDefault()
    setSavingMed(true)
    try {
      const created = await medicines.add(medForm)
      setPendingMeds((prev) => [...prev, created])
      setMedForm({ medicine_name: '', dosage: '', frequency: 'daily', reminder_time: '08:00' })
      setShowMedForm(false)
    } catch {}
    setSavingMed(false)
  }

  const markTaken = async (id) => {
    await medicines.update(id, { status: 'taken' })
    setPendingMeds((prev) => prev.filter((m) => m.id !== id))
  }

  const uploadReport = async (e) => {
    e.preventDefault()
    if (!uploadFile) return
    setUploadingReport(true)
    try {
      await reports.upload(uploadTitle || uploadFile.name, uploadFile)
      setReportsCount((c) => c + 1)
      setUploadFile(null)
      setUploadTitle('')
    } catch {}
    setUploadingReport(false)
  }

  const cards = [
    { icon: MessageSquare, title: 'AI Chat', subtitle: 'Active conversation', value: '24/7 Available', gradient: 'from-[#0F6FFF] to-[#14C8A8]', link: '/chat' },
    { icon: Heart, title: 'Health Score', subtitle: 'Overall wellness', value: score ? `${score.score}/100` : '—', gradient: 'from-[#14C8A8] to-[#0F6FFF]', link: null },
    { icon: MapPin, title: 'Hospital Finder', subtitle: 'Nearby facilities', value: 'Find Now', gradient: 'from-[#0F6FFF] to-[#14C8A8]', link: '/hospitals' },
    { icon: Pill, title: 'Medicine Reminder', subtitle: 'Today', value: `${pendingMeds.length} Pending`, gradient: 'from-[#14C8A8] to-[#0F6FFF]', link: null },
    { icon: FileText, title: 'Medical Reports', subtitle: 'Uploaded', value: `${reportsCount} Files`, gradient: 'from-[#0F6FFF] to-[#14C8A8]', link: null },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">

        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold text-text">
            Welcome back, <span className="text-gradient">{user?.first_name || user?.username}</span> 👋
          </h1>
          <p className="text-text/60 mt-2">Here's your health overview for today.</p>
        </motion.div>

        {/* Quick Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[180px] mb-10">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`glassmorphism rounded-3xl p-6 cursor-pointer group relative overflow-hidden ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              onClick={() => card.link && navigate(card.link)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-1">{card.title}</h3>
                  <p className="text-sm text-text/50">{card.subtitle}</p>
                </div>
                <div className="text-3xl font-bold text-gradient">{card.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Medicine Reminders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glassmorphism rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0F6FFF]" /> Medicine Reminders
              </h2>
              <button onClick={() => setShowMedForm(!showMedForm)} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center text-white hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showMedForm && (
              <form onSubmit={addMedicine} className="mb-4 p-4 bg-white rounded-2xl space-y-3">
                <input required placeholder="Medicine name" value={medForm.medicine_name} onChange={(e) => setMedForm(p => ({ ...p, medicine_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30" />
                <input placeholder="Dosage (e.g. 500mg)" value={medForm.dosage} onChange={(e) => setMedForm(p => ({ ...p, dosage: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30" />
                <div className="flex gap-2">
                  <select value={medForm.frequency} onChange={(e) => setMedForm(p => ({ ...p, frequency: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                  <input type="time" value={medForm.reminder_time} onChange={(e) => setMedForm(p => ({ ...p, reminder_time: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={savingMed} className="flex-1 py-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                    {savingMed ? 'Saving…' : 'Add Reminder'}
                  </button>
                  <button type="button" onClick={() => setShowMedForm(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-text/60">Cancel</button>
                </div>
              </form>
            )}

            {loadingMeds ? (
              <p className="text-text/40 text-sm">Loading…</p>
            ) : pendingMeds.length === 0 ? (
              <div className="text-center py-8 text-text/40">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMeds.slice(0, 5).map((med) => (
                  <div key={med.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm">
                    <div>
                      <p className="font-semibold text-text text-sm">{med.medicine_name}</p>
                      <p className="text-xs text-text/50">{med.dosage} · {med.reminder_time}</p>
                    </div>
                    <button onClick={() => markTaken(med.id)} className="text-xs px-3 py-1 bg-[#14C8A8]/10 text-[#14C8A8] rounded-full hover:bg-[#14C8A8]/20 transition-colors font-medium">Taken</button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upload Medical Report */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glassmorphism rounded-3xl p-6">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-[#0F6FFF]" /> Upload Medical Report
            </h2>
            <form onSubmit={uploadReport} className="space-y-4">
              <input placeholder="Report title (optional)" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30" />
              <label className="block w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0F6FFF]/40 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-text/30" />
                <p className="text-sm text-text/50">{uploadFile ? uploadFile.name : 'Click to upload PDF, JPG, PNG'}</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])} />
              </label>
              <button type="submit" disabled={!uploadFile || uploadingReport} className="w-full py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                {uploadingReport ? 'Uploading…' : 'Upload Report'}
              </button>
            </form>

            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-text/40 uppercase tracking-wide mb-3">Quick Actions</p>
              <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#0F6FFF]/5 transition-colors group">
                <MessageSquare className="w-5 h-5 text-[#0F6FFF]" />
                <span className="text-sm font-medium text-text group-hover:text-[#0F6FFF]">Ask AI a question</span>
              </Link>
              <Link to="/hospitals" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#0F6FFF]/5 transition-colors group">
                <MapPin className="w-5 h-5 text-[#0F6FFF]" />
                <span className="text-sm font-medium text-text group-hover:text-[#0F6FFF]">Find nearby hospitals</span>
              </Link>
              <Link to="/chat-history" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#0F6FFF]/5 transition-colors group">
                <Clock className="w-5 h-5 text-[#0F6FFF]" />
                <span className="text-sm font-medium text-text group-hover:text-[#0F6FFF]">View chat history</span>
              </Link>
              <Link to="/health-profile" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#0F6FFF]/5 transition-colors group">
                <TrendingUp className="w-5 h-5 text-[#0F6FFF]" />
                <span className="text-sm font-medium text-text group-hover:text-[#0F6FFF]">Update health profile</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
