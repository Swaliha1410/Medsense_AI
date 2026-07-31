import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Pill, Droplet, Stethoscope, Cross } from 'lucide-react'

export default function AIAvatar({ mood = 'neutral' }) {
  const [currentMood, setCurrentMood] = useState(mood)

  const floatingIcons = [
    { Icon: Heart, delay: 0, color: '#EF4444' },
    { Icon: Activity, delay: 0.2, color: '#2F80FF' },
    { Icon: Pill, delay: 0.4, color: '#8B5CF6' },
    { Icon: Droplet, delay: 0.6, color: '#22C7A9' },
    { Icon: Stethoscope, delay: 0.8, color: '#F59E0B' },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Holographic Body Background */}
      <motion.div
        className="absolute w-64 h-96 opacity-10"
        animate={{
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 200 300" fill="none" className="w-full h-full">
          {/* Simple human outline */}
          <ellipse cx="100" cy="40" rx="30" ry="35" stroke="#2F80FF" strokeWidth="2" />
          <line x1="100" y1="75" x2="100" y2="150" stroke="#2F80FF" strokeWidth="2" />
          <line x1="100" y1="90" x2="60" y2="130" stroke="#2F80FF" strokeWidth="2" />
          <line x1="100" y1="90" x2="140" y2="130" stroke="#2F80FF" strokeWidth="2" />
          <line x1="100" y1="150" x2="70" y2="220" stroke="#2F80FF" strokeWidth="2" />
          <line x1="100" y1="150" x2="130" y2="220" stroke="#2F80FF" strokeWidth="2" />
          
          {/* Heart pulse */}
          <motion.circle
            cx="100"
            cy="110"
            r="8"
            fill="#EF4444"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </svg>
      </motion.div>

      {/* Floating Medical Icons */}
      {floatingIcons.map(({ Icon, delay, color }, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: Math.cos((index / floatingIcons.length) * Math.PI * 2) * 120,
            y: Math.sin((index / floatingIcons.length) * Math.PI * 2) * 120,
          }}
          animate={{
            x: Math.cos((index / floatingIcons.length) * Math.PI * 2 + Date.now() / 2000) * 130,
            y: Math.sin((index / floatingIcons.length) * Math.PI * 2 + Date.now() / 2000) * 130,
            rotate: [0, 360],
          }}
          transition={{
            x: { duration: 8, repeat: Infinity, ease: "linear", delay },
            y: { duration: 8, repeat: Infinity, ease: "linear", delay },
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          }}
        >
          <motion.div
            className="w-12 h-12 rounded-2xl backdrop-blur-sm bg-white/80 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.2 }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              y: { duration: 2, repeat: Infinity, delay: delay * 2 },
            }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </motion.div>
        </motion.div>
      ))}

      {/* AI Avatar Center */}
      <motion.div
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 p-1 shadow-2xl"
        animate={{
          boxShadow: [
            "0 0 20px rgba(47, 128, 255, 0.3)",
            "0 0 40px rgba(47, 128, 255, 0.5)",
            "0 0 20px rgba(47, 128, 255, 0.3)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {/* Simple Avatar Illustration */}
          <motion.div
            className="w-32 h-32"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Face */}
              <circle cx="50" cy="45" r="35" fill="#E0F2FE" />
              
              {/* Eyes */}
              <motion.circle
                cx="40" cy="42" r="3" fill="#0F172A"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
              />
              <motion.circle
                cx="60" cy="42" r="3" fill="#0F172A"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
              />
              
              {/* Smile */}
              <path
                d="M 40 55 Q 50 62 60 55"
                stroke="#0F172A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Stethoscope */}
              <circle cx="50" cy="75" r="8" fill="none" stroke="#2F80FF" strokeWidth="2" />
              <line x1="50" y1="67" x2="50" y2="30" stroke="#2F80FF" strokeWidth="2" />
              <circle cx="45" cy="30" r="3" fill="#2F80FF" />
              <circle cx="55" cy="30" r="3" fill="#2F80FF" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Pulsing Ring */}
      <motion.div
        className="absolute w-56 h-56 rounded-full border-4 border-blue-500/30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
