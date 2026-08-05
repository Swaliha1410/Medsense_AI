import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Pill, Clock } from 'lucide-react'

export default function MedicineTracker({ medicines, onToggle, onMedicineComplete }) {
  const takenCount = medicines.filter(m => m.taken).length
  const totalCount = medicines.length
  const percentage = (takenCount / totalCount) * 100

  const handleToggle = (id, currentStatus) => {
    onToggle(id)
    if (!currentStatus) {
      onMedicineComplete?.()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-[#E2E8F0] shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#0F172A]">💊 Medicine Tracker</h3>
        <div className="text-sm font-semibold text-[#64748B]">
          {takenCount} / {totalCount}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#2F80FF] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-[#64748B] mt-2 text-center">
          {percentage === 100 ? 'All medicines taken! 🎉' : `${Math.round(percentage)}% completed`}
        </p>
      </div>

      {/* Medicine List */}
      <div className="space-y-3">
        {medicines.map((medicine, index) => (
          <motion.div
            key={medicine.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className={`p-4 rounded-2xl border-2 transition-all ${
              medicine.taken
                ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Custom Checkbox */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggle(medicine.id, medicine.taken)}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  medicine.taken
                    ? 'bg-gradient-to-br from-[#8B5CF6] to-[#2F80FF] shadow-lg'
                    : 'bg-white border-2 border-[#E2E8F0] hover:border-purple-300'
                }`}
              >
                <AnimatePresence>
                  {medicine.taken && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-7 h-7 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!medicine.taken && (
                  <Pill className="w-6 h-6 text-[#94A3B8]" />
                )}
              </motion.button>

              {/* Medicine Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${
                    medicine.taken ? 'text-[#8B5CF6] line-through' : 'text-[#0F172A]'
                  }`}>
                    {medicine.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    medicine.period === 'Morning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : medicine.period === 'Afternoon'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {medicine.period}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Clock className="w-4 h-4" />
                  <span>{medicine.time}</span>
                </div>
              </div>

              {/* Status Badge */}
              <AnimatePresence>
                {medicine.taken && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                  >
                    Taken ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* All Completed Message */}
      <AnimatePresence>
        {percentage === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200"
          >
            <p className="text-center text-purple-700 font-semibold">
              🎉 All medicines taken for today!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
