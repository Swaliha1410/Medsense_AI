import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Droplet, TrendingUp, Moon } from 'lucide-react'

export default function HealthScoreCircle({ score = 82 }) {
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
    if (score >= 80) return '#22C55E'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Attention'
  }

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const breakdown = [
    { icon: Heart, label: 'Heart', value: 88, color: '#EF4444' },
    { icon: Moon, label: 'Sleep', value: 75, color: '#8B5CF6' },
    { icon: Droplet, label: 'Hydration', value: 80, color: '#22C7A9' },
    { icon: TrendingUp, label: 'Activity', value: 65, color: '#2F80FF' },
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Score Circle */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="128"
            cy="128"
            r={radius}
            stroke={getScoreColor()}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className="text-6xl font-bold"
            style={{ color: getScoreColor() }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {animatedScore}
          </motion.p>
          <p className="text-sm text-[#64748B] font-medium mt-1">{getScoreLabel()}</p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="w-full grid grid-cols-2 gap-3">
        {breakdown.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * index }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[#F8FAFC]"
          >
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
            <div className="flex-1">
              <p className="text-xs text-[#64748B]">{item.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 0.5 + 0.1 * index, duration: 1 }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#0F172A]">{item.value}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
