import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, Plus, X, Edit, Trash2, Check, Clock,
  AlertCircle, TrendingUp, Calendar, Bell
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { medicines } from '../services/api'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
]

export default function Medicines() {
  const [activeTab, setActiveTab] = useState('today')
  const [medicineList, setMedicineList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '',
    frequency: 'daily',
    reminder_time: '08:00',
    notes: '',
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const data = await medicines.list()
      setMedicineList(data?.results || data || [])
    } catch (error) {
      console.error('Failed to fetch medicines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMedicine) {
        await medicines.update(editingMedicine.id, formData)
      } else {
        await medicines.add(formData)
      }
      await fetchMedicines()
      handleCloseModal()
    } catch (error) {
      alert('Failed to save medicine')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return
    try {
      await medicines.remove(id)
      await fetchMedicines()
    } catch (error) {
      alert('Failed to delete medicine')
    }
  }

  const handleMarkTaken = async (id) => {
    try {
      await medicines.update(id, { status: 'taken' })
      await fetchMedicines()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const handleSkip = async (id) => {
    try {
      await medicines.update(id, { status: 'missed' })
      await fetchMedicines()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      medicine_name: medicine.medicine_name,
      dosage: medicine.dosage || '',
      frequency: medicine.frequency,
      reminder_time: medicine.reminder_time,
      notes: medicine.notes || '',
    })
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingMedicine(null)
    setFormData({
      medicine_name: '',
      dosage: '',
      frequency: 'daily',
      reminder_time: '08:00',
      notes: '',
    })
  }


  const filterMedicines = () => {
    const now   = new Date()
    const today = now.toDateString()
    const todayDow = now.getDay()  // 0=Sun … 6=Sat

    // A medicine is "due today" based on its frequency
    const isDueToday = (med) => {
      switch (med.frequency) {
        case 'daily':
        case 'twice_daily':
        case 'as_needed':
          return true
        case 'weekly': {
          // Due on the same day of week it was originally created
          const createdDow = new Date(med.created_at).getDay()
          return createdDow === todayDow
        }
        default:
          return true
      }
    }

    switch (activeTab) {
      case 'today':
        // Show every medicine that is due today regardless of when it was created
        return medicineList.filter((med) => isDueToday(med) && med.status === 'pending')
      case 'upcoming':
        return medicineList.filter((med) => med.status === 'pending')
      case 'all':
        return medicineList
      case 'history':
        return medicineList.filter((med) => med.status !== 'pending')
      default:
        return medicineList
    }
  }

  const filteredMedicines = filterMedicines()

  // Today's progress — count medicines due today
  const todayDow = new Date().getDay()
  const isDueToday = (med) => {
    switch (med.frequency) {
      case 'daily': case 'twice_daily': case 'as_needed': return true
      case 'weekly': return new Date(med.created_at).getDay() === todayDow
      default: return true
    }
  }
  const todayMedicines = medicineList.filter(isDueToday)
  const todayCompleted = todayMedicines.filter((med) => med.status === 'taken').length
  const todayTotal     = todayMedicines.length
  const progress       = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">My Medicines</h1>
              <p className="text-[#64748B]">
                Manage your medications and reminders in one place
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Medicine
            </button>
          </div>

          {/* Today's Progress */}
          {todayTotal > 0 && (
            <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-2xl p-6 border border-[#0F6FFF]/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                    Today's Progress
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    {todayCompleted} of {todayTotal} doses completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0F6FFF]" />
                  <span className="text-2xl font-bold text-[#0F6FFF]">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {[
            { value: 'today', label: 'Today', icon: Calendar },
            { value: 'upcoming', label: 'Upcoming', icon: Clock },
            { value: 'all', label: 'All Medicines', icon: Pill },
            { value: 'history', label: 'History', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-[#0F6FFF] text-white shadow-lg'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Medicine List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#0F6FFF]/30 border-t-[#0F6FFF] rounded-full animate-spin" />
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
              <Pill className="w-16 h-16 mx-auto text-[#E2E8F0] mb-4" />
              <p className="text-[#64748B] mb-4">
                {activeTab === 'today'
                  ? 'No medicines scheduled for today'
                  : activeTab === 'history'
                  ? 'No medication history yet'
                  : 'No medicines added yet'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                Add your first medicine
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMedicines.map((medicine) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Medicine Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center flex-shrink-0">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                          {medicine.medicine_name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#64748B]">
                          {medicine.dosage && (
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF]" />
                              {medicine.dosage}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF]" />
                            {FREQUENCIES.find((f) => f.value === medicine.frequency)?.label}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {medicine.reminder_time}
                          </span>
                        </div>
                        {medicine.notes && (
                          <p className="text-xs text-[#64748B] mt-2 line-clamp-1">
                            {medicine.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          medicine.status === 'taken'
                            ? 'bg-[#F0FDF4] text-[#22C55E]'
                            : medicine.status === 'missed'
                            ? 'bg-[#FEF2F2] text-[#EF4444]'
                            : 'bg-[#FEF3C7] text-[#F59E0B]'
                        }`}
                      >
                        {medicine.status === 'taken'
                          ? 'Taken'
                          : medicine.status === 'missed'
                          ? 'Missed'
                          : 'Pending'}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {medicine.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleMarkTaken(medicine.id)}
                              className="p-2 hover:bg-[#F0FDF4] rounded-lg transition-colors group"
                              title="Mark as taken"
                            >
                              <Check className="w-4 h-4 text-[#64748B] group-hover:text-[#22C55E]" />
                            </button>
                            <button
                              onClick={() => handleSkip(medicine.id)}
                              className="p-2 hover:bg-[#FEF2F2] rounded-lg transition-colors group"
                              title="Skip"
                            >
                              <X className="w-4 h-4 text-[#64748B] group-hover:text-[#EF4444]" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 hover:bg-[#F0F9FF] rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[#64748B] group-hover:text-[#0F6FFF]" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-[#64748B] group-hover:text-[#EF4444]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#0F172A] mb-2">
                Important Notice
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                This medication tracker is for personal reference only. MedSense does not provide
                medical advice about dosages or medication schedules. Always follow your
                healthcare provider's prescriptions and consult them before making any changes to
                your medication routine.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#64748B]" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Medicine Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.medicine_name}
                      onChange={(e) =>
                        setFormData({ ...formData, medicine_name: e.target.value })
                      }
                      placeholder="e.g., Paracetamol"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 500mg"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Frequency
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({ ...formData, frequency: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                      >
                        {FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.reminder_time}
                        onChange={(e) =>
                          setFormData({ ...formData, reminder_time: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g., Take after meals"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
