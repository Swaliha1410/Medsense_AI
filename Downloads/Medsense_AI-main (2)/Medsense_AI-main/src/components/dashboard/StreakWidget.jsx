import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Calendar } from 'lucide-react'

export default function StreakWidget({ streak }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="backdrop-blur-xl bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border-2 border-orange-200 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#0F172A]">Daily Streak</h3>
        <Calendar className="w-5 h-5 text-orange-600" />
      </div>

      {/* Flame Animation */}
      <div className="flex items-center justify-center mb-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <Flame className="w-32 h-32 text-orange-500 fill-orange-500" />
          
          {/* Sparkles around flame */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 60
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            
            return (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              >
                ✨
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Streak Counter */}
      <div className="text-center">
        <motion.div
          key={streak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2"
        >
          {streak}
        </motion.div>
        <p className="text-lg font-semibold text-orange-700">
          {streak === 1 ? 'Day Streak' : 'Days Streak'} 🔥
        </p>
        <p className="text-sm text-[#64748B] mt-2">
          {streak === 0 ? 'Complete your goals to start!' : 'Keep it going!'}
        </p>
      </div>

      {/* Progress Milestones */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { days: 7, emoji: '🏅', label: '1 Week' },
          { days: 30, emoji: '🏆', label: '1 Month' },
          { days: 100, emoji: '👑', label: '100 Days' },
        ].map((milestone, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl text-center transition-all ${
              streak >= milestone.days
                ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white shadow-lg scale-105'
                : 'bg-white/50 text-gray-400'
            }`}
          >
            <p className="text-2xl mb-1">{milestone.emoji}</p>
            <p className="text-xs font-semibold">{milestone.label}</p>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div className="mt-6 p-4 rounded-2xl bg-white/70 border border-orange-200">
        <p className="text-xs font-semibold text-[#0F172A] mb-2">Daily Requirements:</p>
        <div className="space-y-1 text-xs text-[#64748B]">
          <p>✓ Complete water goal (8 glasses)</p>
          <p>✓ Take all medicines</p>
          <p>✓ Reach step goal (8,000 steps)</p>
        </div>
      </div>
    </motion.div>
  )
}
