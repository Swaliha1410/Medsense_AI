import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Droplet, Pill, TrendingUp, Moon } from 'lucide-react'

export default function HealthScoreWidget({ score, breakdown }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = score / steps
    let current = 0

    const interval = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(interval)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [score])

  const getScoreColor = () => {
    if (score >= 80) return { color: '#22C55E', label: 'Excellent', emoji: '🌟' }
    if (score >= 60) return { color: '#F59E0B', label: 'Good', emoji: '😊' }
    if (score >= 40) return { color: '#F59E0B', label: 'Fair', emoji: '😐' }
    return { color: '#EF4444', label: 'Needs Attention', emoji: '⚠️' }
  }

  const { color, label, emoji } = getScoreColor()
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const metrics = [
    { icon: Droplet, label: 'Hydration', value: breakdown?.water || 0, color: '#22C7A9' },
    { icon: Pill, label: 'Medicine', value: breakdown?.medicine || 0, color: '#8B5CF6' },
    { icon: TrendingUp, label: 'Activity', value: breakdown?.activity || 0, color: '#2F80FF' },
    { icon: Moon, label: 'Sleep', value: breakdown?.sleep || 0, color: '#6D28D9' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#0F172A]">🧠 Health Score</h3>
        <Heart className="w-6 h-6 text-red-500" />
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-72 h-72">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="20"
              fill="none"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="144"
              cy="144"
              r={radius}
              stroke={color}
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeOut" }}
            />

            {/* Glow Effect */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Center Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={animatedScore}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-bold"
              style={{ color }}
            >
              {animatedScore}
            </motion.div>
            <p className="text-lg font-semibold mt-2" style={{ color }}>
              {label} {emoji}
            </p>
            <p className="text-sm text-[#64748B] mt-1">out of 100</p>
          </div>

          {/* Orbiting Icons */}
          {metrics.map((metric, i) => {
            const angle = (i / metrics.length) * Math.PI * 2 - Math.PI / 2
            const orbitRadius = 120
            const x = 144 + Math.cos(angle) * orbitRadius
            const y = 144 + Math.sin(angle) * orbitRadius
            
            return (
              <motion.g
                key={i}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5
                }}
              >
                <foreignObject x={x - 20} y={y - 20} width="40" height="40">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center border-2" style={{ borderColor: metric.color }}>
                    <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>
                </foreignObject>
              </motion.g>
            )
          })}
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#F8FAFC] to-white"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: `${metric.color}20`, borderColor: metric.color, borderWidth: 2 }}
            >
              <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-[#0F172A] mb-1">{metric.label}</p>
              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: metric.color }}>
                {metric.value}
              </p>
              <p className="text-xs text-[#64748B]">points</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Score Change Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Daily Goal Progress</p>
            <p className="text-xs text-[#64748B] mt-1">Keep up the great work!</p>
          </div>
          <div className="text-right">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              {score >= 80 ? '🎯' : score >= 60 ? '💪' : '🔥'}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
