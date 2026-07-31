import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RotateCcw, TrendingUp } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function StepsTracker({ steps, goal, onAdd, onReset, onGoalComplete }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const { width, height } = useWindowSize()

  const percentage = Math.min((steps / goal) * 100, 100)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    if (steps >= goal && !justCompleted) {
      setShowConfetti(true)
      setJustCompleted(true)
      onGoalComplete?.()
      setTimeout(() => setShowConfetti(false), 5000)
    }
    if (steps < goal) {
      setJustCompleted(false)
    }
  }, [steps, goal, justCompleted, onGoalComplete])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
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

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#0F172A]">👣 Steps Tracker</h3>
        <TrendingUp className="w-6 h-6 text-[#2F80FF]" />
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="128"
              cy="128"
              r={radius}
              stroke="url(#stepsGradient)"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2F80FF" />
                <stop offset="100%" stopColor="#22C7A9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={steps}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold bg-gradient-to-r from-[#2F80FF] to-[#22C7A9] bg-clip-text text-transparent"
            >
              {steps.toLocaleString()}
            </motion.div>
            <p className="text-sm text-[#64748B] mt-2">
              / {goal.toLocaleString()} steps
            </p>
            <div className="mt-2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-100 to-teal-100">
              <p className="text-xs font-semibold text-[#2F80FF]">
                {Math.round(percentage)}%
              </p>
            </div>
          </div>

          {/* Animated Footprints */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const x = 128 + Math.cos(angle) * 100
            const y = 128 + Math.sin(angle) * 100
            const isActive = (percentage / 100) * 8 > i
            
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0.2 }}
                transition={{ delay: i * 0.1 }}
              >
                <text
                  x={x}
                  y={y}
                  fontSize="20"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="transform rotate-90"
                  fill={isActive ? '#2F80FF' : '#CBD5E1'}
                >
                  👣
                </text>
              </motion.g>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAdd(500)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2F80FF] to-[#22C7A9] text-white font-semibold shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add 500 Steps
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="w-12 h-12 rounded-2xl bg-white border-2 border-[#E2E8F0] text-[#64748B] hover:border-red-300 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Goal Completion Message */}
      <AnimatePresence>
        {steps >= goal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200"
          >
            <p className="text-center text-green-700 font-semibold">
              🏆 Step Goal Achieved! Walking Champion!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Milestones */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((milestone) => (
          <div
            key={milestone}
            className={`text-center p-2 rounded-xl transition-all ${
              percentage >= milestone
                ? 'bg-gradient-to-br from-blue-100 to-teal-100 border-2 border-blue-300'
                : 'bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <p className={`text-xs font-bold ${
              percentage >= milestone ? 'text-[#2F80FF]' : 'text-gray-400'
            }`}>
              {milestone}%
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
