import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock } from 'lucide-react'

export default function TimelineItem({ time, label, status, icon: Icon, index }) {
  const isCompleted = status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 group"
    >
      {/* Time */}
      <div className="w-16 text-right">
        <p className="text-sm font-semibold text-[#0F172A]">{time}</p>
      </div>

      {/* Timeline Dot */}
      <div className="relative flex flex-col items-center">
        <motion.div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isCompleted
              ? 'bg-gradient-to-br from-[#22C55E] to-[#16A34A]'
              : 'bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1]'
          } shadow-lg`}
          whileHover={{ scale: 1.1 }}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : Icon ? (
            <Icon className="w-5 h-5 text-[#64748B]" />
          ) : (
            <Clock className="w-5 h-5 text-[#64748B]" />
          )}
        </motion.div>

        {/* Connecting Line */}
        {index < 5 && (
          <div className={`w-0.5 h-12 ${isCompleted ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}`} />
        )}
      </div>

      {/* Label */}
      <div className="flex-1">
        <p className={`text-sm font-medium ${isCompleted ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}
