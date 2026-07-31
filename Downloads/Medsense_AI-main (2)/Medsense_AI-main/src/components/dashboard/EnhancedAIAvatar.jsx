import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Droplet, Pill, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'

export default function EnhancedAIAvatar({ 
  mood = 'happy',
  message = null,
  onAnimationComplete = () => {}
}) {
  const [eyesOpen, setEyesOpen] = useState(true)
  const [mouthOpen, setMouthOpen] = useState(false)
  const [isWaving, setIsWaving] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const avatarRef = useRef(null)

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyesOpen(false)
      setTimeout(() => setEyesOpen(true), 150)
    }, 3000 + Math.random() * 2000)

    return () => clearInterval(blinkInterval)
  }, [])

  // Wave on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWaving(true)
      setTimeout(() => setIsWaving(false), 1500)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Show message bubble
  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      setShowBubble(true)
      const timer = setTimeout(() => {
        setShowBubble(false)
        setTimeout(() => {
          setCurrentMessage(null)
          onAnimationComplete()
        }, 300)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [message, onAnimationComplete])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (avatarRef.current) {
        const rect = avatarRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        mousePos.current = {
          x: (e.clientX - centerX) / 20,
          y: (e.clientY - centerY) / 20,
        }
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const getMoodColor = () => {
    switch (mood) {
      case 'happy': return '#22C55E'
      case 'sleepy': return '#8B5CF6'
      case 'sick': return '#EF4444'
      case 'worried': return '#F59E0B'
      case 'celebrating': return '#F59E0B'
      case 'drinking': return '#22C7A9'
      case 'exercising': return '#2F80FF'
      default: return '#22C55E'
    }
  }

  const getMouthPath = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return 'M 35 50 Q 50 62 65 50' // Big smile
      case 'sleepy':
        return 'M 40 55 L 60 55' // Straight line
      case 'sick':
      case 'worried':
        return 'M 35 58 Q 50 48 65 58' // Frown
      case 'drinking':
        return 'M 40 52 Q 50 58 60 52' // Small O shape
      default:
        return 'M 40 52 Q 50 58 60 52'
    }
  }

  return (
    <div ref={avatarRef} className="relative w-full h-full flex items-center justify-center">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && currentMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 z-50"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-blue-100">
              <p className="text-sm font-medium text-[#0F172A] text-center">
                {currentMessage}
              </p>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Avatar Container */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: getMoodColor() }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {/* Avatar Circle */}
        <motion.div
          className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 p-2 shadow-2xl"
          style={{
            borderColor: getMoodColor(),
            borderWidth: 4,
          }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Face */}
              <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
              
              {/* Hair */}
              <path
                d="M 20 35 Q 20 15 50 15 Q 80 15 80 35 Q 75 25 50 25 Q 25 25 20 35"
                fill="#0F172A"
              />

              {/* Left Eye */}
              <motion.g
                animate={{
                  x: mousePos.current.x * 0.5,
                  y: mousePos.current.y * 0.5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <ellipse
                  cx="35"
                  cy="42"
                  rx="4"
                  ry={eyesOpen ? 5 : 0.5}
                  fill="#0F172A"
                />
              </motion.g>

              {/* Right Eye */}
              <motion.g
                animate={{
                  x: mousePos.current.x * 0.5,
                  y: mousePos.current.y * 0.5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <ellipse
                  cx="65"
                  cy="42"
                  rx="4"
                  ry={eyesOpen ? 5 : 0.5}
                  fill="#0F172A"
                />
              </motion.g>

              {/* Eyebrows */}
              {mood === 'worried' && (
                <>
                  <path d="M 28 35 Q 35 33 42 35" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 58 35 Q 65 33 72 35" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              )}

              {/* Blush */}
              {(mood === 'happy' || mood === 'celebrating') && (
                <>
                  <circle cx="25" cy="55" r="4" fill="#FCA5A5" opacity="0.6" />
                  <circle cx="75" cy="55" r="4" fill="#FCA5A5" opacity="0.6" />
                </>
              )}

              {/* Mouth */}
              <motion.path
                d={getMouthPath()}
                stroke="#0F172A"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                animate={mouthOpen ? { d: 'M 40 52 Q 50 62 60 52' } : {}}
              />

              {/* Tongue (when drinking) */}
              {mood === 'drinking' && (
                <ellipse cx="50" cy="56" rx="3" ry="2" fill="#FCA5A5" />
              )}

              {/* Sleeping Z's */}
              {mood === 'sleepy' && (
                <g>
                  <motion.text
                    x="75"
                    y="25"
                    fill="#8B5CF6"
                    fontSize="8"
                    fontWeight="bold"
                    animate={{ opacity: [0, 1, 1, 0], y: [0, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Z
                  </motion.text>
                  <motion.text
                    x="80"
                    y="20"
                    fill="#8B5CF6"
                    fontSize="6"
                    fontWeight="bold"
                    animate={{ opacity: [0, 1, 1, 0], y: [0, -5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  >
                    Z
                  </motion.text>
                </g>
              )}

              {/* Stethoscope */}
              <g transform="translate(50, 75)">
                <circle cx="0" cy="0" r="6" fill="none" stroke={getMoodColor()} strokeWidth="2" />
                <line x1="0" y1="-6" x2="0" y2="-25" stroke={getMoodColor()} strokeWidth="2" />
                <circle cx="-5" cy="-25" r="2.5" fill={getMoodColor()} />
                <circle cx="5" cy="-25" r="2.5" fill={getMoodColor()} />
              </g>
            </svg>
          </div>
        </motion.div>

        {/* Waving Hand */}
        <AnimatePresence>
          {isWaving && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, 15, -15, 15, 0] }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute -right-4 top-8 text-5xl"
            >
              👋
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Icons */}
        {mood === 'celebrating' && (
          <motion.div
            className="absolute -top-4 -right-4"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.div>
        )}

        {mood === 'drinking' && (
          <motion.div
            className="absolute -bottom-4 -right-4"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          >
            <Droplet className="w-8 h-8 text-blue-500" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
