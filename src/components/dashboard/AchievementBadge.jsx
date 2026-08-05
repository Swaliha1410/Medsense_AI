import React from 'react'
import { motion } from 'framer-motion'

export default function AchievementBadge({ icon: Icon, title, unlocked, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative p-4 rounded-2xl backdrop-blur-sm border-2 transition-all ${
        unlocked
          ? 'bg-white/80 border-transparent shadow-lg'
          : 'bg-gray-100/50 border-gray-300 opacity-50'
      }`}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${
            !unlocked && 'grayscale'
          }`}
          animate={unlocked ? {
            rotate: [0, -5, 5, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        <p className={`text-xs font-semibold text-center ${unlocked ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
          {title}
        </p>
      </div>

      {/* Lock Indicator */}
      {!unlocked && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Sparkle Effect for Unlocked */}
      {unlocked && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}
