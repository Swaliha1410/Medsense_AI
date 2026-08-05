import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplet, Pill, TrendingUp, Moon, Award, Lock } from 'lucide-react'

export default function BadgesWidget({ badges }) {
  const badgeList = [
    {
      id: 'hydrationMaster',
      icon: Droplet,
      title: 'Hydration Master',
      description: 'Complete water goal',
      color: 'from-blue-500 to-cyan-500',
      unlocked: badges.hydrationMaster,
    },
    {
      id: 'medicineHero',
      icon: Pill,
      title: 'Medicine Hero',
      description: 'Take all medicines',
      color: 'from-purple-500 to-pink-500',
      unlocked: badges.medicineHero,
    },
    {
      id: 'walkingChampion',
      icon: TrendingUp,
      title: 'Walking Champion',
      description: 'Reach step goal',
      color: 'from-green-500 to-emerald-500',
      unlocked: badges.walkingChampion,
    },
    {
      id: 'sleepExpert',
      icon: Moon,
      title: 'Sleep Expert',
      description: '7-9 hours of sleep',
      color: 'from-indigo-500 to-purple-500',
      unlocked: badges.sleepExpert,
    },
    {
      id: 'healthyWeek',
      icon: Award,
      title: 'Healthy Week',
      description: '7 day streak',
      color: 'from-yellow-500 to-orange-500',
      unlocked: badges.healthyWeek,
    },
  ]

  const unlockedCount = badgeList.filter(b => b.unlocked).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-[#E2E8F0] shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#0F172A]">🎖️ Achievements</h3>
          <p className="text-sm text-[#64748B] mt-1">
            {unlockedCount} / {badgeList.length} unlocked
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
          <p className="text-2xl font-bold text-orange-600">{unlockedCount}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / badgeList.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badgeList.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.05 }}
            whileHover={{ scale: badge.unlocked ? 1.05 : 1, y: badge.unlocked ? -5 : 0 }}
            className={`relative p-4 rounded-2xl border-2 transition-all ${
              badge.unlocked
                ? 'bg-white shadow-lg'
                : 'bg-gray-50/50 border-gray-300 opacity-60'
            }`}
          >
            {/* Badge Icon */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg mb-3 ${
                  !badge.unlocked && 'grayscale'
                }`}
                animate={badge.unlocked ? {
                  rotate: [0, -5, 5, 0],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <badge.icon className="w-10 h-10 text-white" />
              </motion.div>

              <p className={`text-sm font-bold text-center mb-1 ${
                badge.unlocked ? 'text-[#0F172A]' : 'text-[#94A3B8]'
              }`}>
                {badge.title}
              </p>
              
              <p className="text-xs text-[#64748B] text-center">
                {badge.description}
              </p>
            </div>

            {/* Lock Overlay */}
            {!badge.unlocked && (
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center shadow-md">
                <Lock className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Unlock Animation */}
            <AnimatePresence>
              {badge.unlocked && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                    <motion.span
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="text-lg"
                    >
                      ⭐
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkle Effect for Unlocked */}
            {badge.unlocked && (
              <>
                <motion.div
                  className="absolute top-4 left-4 text-yellow-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  ✨
                </motion.div>
                <motion.div
                  className="absolute bottom-4 right-4 text-yellow-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5 + 1.5,
                  }}
                >
                  ✨
                </motion.div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      {unlockedCount < badgeList.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          <p className="text-sm text-center text-[#2F80FF] font-semibold">
            🌟 {badgeList.length - unlockedCount} more {badgeList.length - unlockedCount === 1 ? 'badge' : 'badges'} to unlock!
          </p>
        </motion.div>
      )}

      {/* All Unlocked Celebration */}
      {unlockedCount === badgeList.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300"
        >
          <p className="text-sm text-center text-orange-600 font-bold">
            🏆 All Achievements Unlocked! You're a Health Champion! 👑
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
