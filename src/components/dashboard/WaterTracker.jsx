import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Droplet } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function WaterTracker({ glasses, goal, onAdd, onRemove, onGoalComplete }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const { width, height } = useWindowSize()

  const percentage = (glasses / goal) * 100

  useEffect(() => {
    if (glasses === goal && glasses > 0 && !justCompleted) {
      setShowConfetti(true)
      setJustCompleted(true)
      onGoalComplete?.()
      setTimeout(() => setShowConfetti(false), 5000)
    }
    if (glasses < goal) {
      setJustCompleted(false)
    }
  }, [glasses, goal, justCompleted, onGoalComplete])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-[#E2E8F0] shadow-xl"
    >
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#0F172A]">💧 Water Tracker</h3>
        <div className="text-sm font-semibold text-[#64748B]">
          Today
        </div>
      </div>

      {/* Water Bottle Animation */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-64">
          {/* Bottle Outline */}
          <svg viewBox="0 0 100 200" className="w-full h-full">
            {/* Bottle Cap */}
            <rect x="35" y="0" width="30" height="15" rx="3" fill="#64748B" />
            
            {/* Bottle Neck */}
            <rect x="38" y="15" width="24" height="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
            
            {/* Bottle Body */}
            <path
              d="M 20 35 L 20 180 Q 20 190 30 190 L 70 190 Q 80 190 80 180 L 80 35 Z"
              fill="#F8FAFC"
              stroke="#94A3B8"
              strokeWidth="2"
            />

            {/* Water Fill */}
            <motion.path
              d={`M 20 ${190 - (percentage * 1.55)} L 20 180 Q 20 190 30 190 L 70 190 Q 80 190 80 180 L 80 ${190 - (percentage * 1.55)} Z`}
              fill="url(#waterGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Water Surface Animation */}
            <motion.ellipse
              cx="50"
              cy={190 - (percentage * 1.55)}
              rx="30"
              ry="3"
              fill="#22C7A9"
              opacity="0.5"
              animate={{
                ry: [3, 4, 3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Measurement Lines */}
            {[0, 25, 50, 75, 100].map((mark, i) => (
              <g key={i}>
                <line
                  x1="15"
                  y1={190 - (mark * 1.55)}
                  x2="20"
                  y2={190 - (mark * 1.55)}
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
                <line
                  x1="80"
                  y1={190 - (mark * 1.55)}
                  x2="85"
                  y2={190 - (mark * 1.55)}
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
              </g>
            ))}

            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22C7A9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2F80FF" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Bubbles */}
          {percentage > 0 && (
            <>
              <motion.div
                className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-white/60"
                animate={{
                  y: [-60, -120],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-white/60"
                animate={{
                  y: [-60, -120],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute bottom-20 left-1/2 w-2.5 h-2.5 rounded-full bg-white/60"
                animate={{
                  y: [-60, -120],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Progress Text */}
      <div className="text-center mb-6">
        <motion.div
          key={glasses}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold bg-gradient-to-r from-[#2F80FF] to-[#22C7A9] bg-clip-text text-transparent"
        >
          {glasses} / {goal}
        </motion.div>
        <p className="text-sm text-[#64748B] mt-1">Glasses</p>
      </div>

      {/* Glass Icons */}
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {[...Array(goal)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Droplet
              className={`w-6 h-6 ${
                i < glasses
                  ? 'fill-[#22C7A9] text-[#22C7A9]'
                  : 'text-[#E2E8F0]'
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRemove}
          disabled={glasses === 0}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 text-white flex items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          disabled={glasses >= goal}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2F80FF] to-[#22C7A9] text-white flex items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {glasses === goal && glasses > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200"
          >
            <p className="text-center text-green-700 font-semibold">
              🎉 Hydration Goal Completed!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
