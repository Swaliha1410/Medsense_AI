import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'

export default function AIInsights({ data }) {
  const insights = useMemo(() => {
    const messages = []
    const { waterGlasses, waterGoal, medicines, steps, stepsGoal, sleepHours, streak, lastWaterTime } = data

    // Water insights
    const waterRemaining = waterGoal - waterGlasses
    if (waterRemaining > 0) {
      messages.push({
        type: 'info',
        icon: AlertCircle,
        color: 'blue',
        message: `You need ${waterRemaining} more ${waterRemaining === 1 ? 'glass' : 'glasses'} of water. 💧`,
      })
    } else {
      messages.push({
        type: 'success',
        icon: CheckCircle,
        color: 'green',
        message: 'Hydration goal completed! Great job! 🎉',
      })
    }

    // Check if water hasn't been drunk for 3 hours
    if (lastWaterTime) {
      const hoursSince = (Date.now() - new Date(lastWaterTime).getTime()) / (1000 * 60 * 60)
      if (hoursSince >= 3 && waterRemaining > 0) {
        messages.push({
          type: 'warning',
          icon: AlertCircle,
          color: 'orange',
          message: "It's been over 3 hours! Time to drink water. 🚰",
        })
      }
    }

    // Medicine insights
    const pendingMeds = medicines.filter(m => !m.taken)
    if (pendingMeds.length > 0) {
      messages.push({
        type: 'warning',
        icon: AlertCircle,
        color: 'purple',
        message: `You haven't taken ${pendingMeds.length} ${pendingMeds.length === 1 ? 'medicine' : 'medicines'} yet. Don't forget! 💊`,
      })
    } else {
      messages.push({
        type: 'success',
        icon: CheckCircle,
        color: 'purple',
        message: 'All medicines taken for today! Well done! 💊✨',
      })
    }

    // Steps insights
    const stepsRemaining = stepsGoal - steps
    if (stepsRemaining > 0) {
      messages.push({
        type: 'info',
        icon: TrendingUp,
        color: 'blue',
        message: `Walk ${stepsRemaining.toLocaleString()} more steps to reach your goal. 👟`,
      })
    } else {
      messages.push({
        type: 'success',
        icon: CheckCircle,
        color: 'green',
        message: 'Step goal achieved! Keep moving! 🏃‍♂️',
      })
    }

    // Sleep insights
    if (sleepHours >= 7 && sleepHours <= 9) {
      messages.push({
        type: 'success',
        icon: CheckCircle,
        color: 'purple',
        message: 'Excellent sleep duration! Your body thanks you. 😴✨',
      })
    } else if (sleepHours < 7 && sleepHours > 0) {
      messages.push({
        type: 'warning',
        icon: AlertCircle,
        color: 'orange',
        message: 'Try to get more sleep tonight. Aim for 7-9 hours. 🌙',
      })
    } else if (sleepHours > 10) {
      messages.push({
        type: 'info',
        icon: AlertCircle,
        color: 'blue',
        message: 'Too much sleep can make you groggy. Aim for 7-9 hours. 😪',
      })
    }

    // Streak insights
    if (streak >= 7) {
      messages.push({
        type: 'success',
        icon: TrendingUp,
        color: 'orange',
        message: `Amazing! You're on a ${streak} day streak! 🔥👑`,
      })
    } else if (streak >= 3) {
      messages.push({
        type: 'success',
        icon: TrendingUp,
        color: 'orange',
        message: `Great! ${streak} days streak. Keep it going! 🔥`,
      })
    }

    // Overall encouragement
    const completionRate = ((waterGlasses / waterGoal) + (medicines.filter(m => m.taken).length / medicines.length) + (Math.min(steps, stepsGoal) / stepsGoal)) / 3
    if (completionRate >= 0.8) {
      messages.push({
        type: 'success',
        icon: CheckCircle,
        color: 'green',
        message: 'Excellent consistency this week! You\'re doing amazing! 🌟',
      })
    }

    return messages
  }, [data])

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
      },
      green: {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
      },
      purple: {
        bg: 'from-purple-50 to-pink-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: 'text-purple-600',
      },
      orange: {
        bg: 'from-orange-50 to-yellow-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: 'text-orange-600',
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-[#E2E8F0] shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2F80FF] to-[#22C7A9] flex items-center justify-center shadow-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#0F172A]">AI Insights</h3>
          <p className="text-sm text-[#64748B]">Personalized recommendations</p>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const colors = getColorClasses(insight.color)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`p-4 rounded-2xl bg-gradient-to-r ${colors.bg} border-2 ${colors.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0`}>
                  <insight.icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <p className={`text-sm font-medium ${colors.text} flex-1`}>
                  {insight.message}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Motivation Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Keep Going!</p>
            <p className="text-xs text-[#64748B] mt-1">
              Your health is improving every day 💙
            </p>
          </div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-4xl"
          >
            💪
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
