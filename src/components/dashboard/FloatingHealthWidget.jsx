import React from 'react'
import { motion } from 'framer-motion'

export default function FloatingHealthWidget({ icon: Icon, title, value, subtitle, color = "blue", delay = 0 }) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
    teal: 'from-teal-500/10 to-teal-600/10 border-teal-500/20',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-500/20',
  }

  const iconColorClasses = {
    blue: 'text-blue-600',
    teal: 'text-teal-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`backdrop-blur-xl bg-gradient-to-br ${colorClasses[color]} border rounded-3xl p-4 shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
        </motion.div>
        <div className="flex-1">
          <p className="text-xs text-[#64748B] font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )
}
