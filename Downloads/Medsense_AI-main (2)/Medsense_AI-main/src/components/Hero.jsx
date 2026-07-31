import React from 'react'
import { motion } from 'framer-motion'
import { Play, Check, Sparkles, Shield, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Scene3D from './Scene3D'
import { useAuth } from '../context/AuthContext'

const Hero = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const badges = [
    { icon: Sparkles, text: 'AI Powered' },
    { icon: Sparkles, text: 'Voice Assistant' },
    { icon: Shield,   text: 'Secure' },
    { icon: MapPin,   text: 'Hospital Finder' },
  ]

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-6 overflow-hidden">
      {/* Gradient Blobs */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-[#0F6FFF]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#14C8A8]/20 rounded-full blur-[120px] animate-pulse" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl lg:text-7xl font-bold text-text leading-tight mb-6"
            >
              Your Personal{' '}
              <span className="text-gradient">AI Healthcare Companion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-text/70 mb-8 leading-relaxed"
            >
              Talk naturally about your health, receive AI-powered guidance, analyse symptoms,
              and instantly find the right hospital nearby.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Link
                to={isLoggedIn ? '/chat' : '/auth?mode=register'}
                className="inline-block"
              >
                <motion.span
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(15, 111, 255, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="block px-8 py-4 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-xl shadow-lg text-lg cursor-pointer"
                >
                  {isLoggedIn ? 'Open AI Chat' : 'Get Started'}
                </motion.span>
              </Link>

              <Link to="/about" className="inline-block">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block px-8 py-4 bg-white text-text font-semibold rounded-xl shadow-lg text-lg flex items-center gap-2 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  Learn More
                </motion.span>
              </Link>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-3"
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 bg-white rounded-full shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-text">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side — 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative h-[600px] lg:h-[700px]"
          >
            <Scene3D />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Hero
