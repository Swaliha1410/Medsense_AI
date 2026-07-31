import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

export default function SleepTracker({ hours, onChange }) {
  const percentage = (hours / 24) * 100
  const quality = hours >= 7 && hours <= 9 ? 'Excellent' : 
                  hours >= 6 && hours <= 10 ? 'Good' : 
                  hours < 6 ? 'Too Little' : 'Too Much'
  
  const qualityColor = hours >= 7 && hours <= 9 ? 'text-green-600' : 
                       hours >= 6 && hours <= 10 ? 'text-blue-600' : 
                       'text-orange-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-[#E2E8F0] shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#0F172A]">😴 Sleep Tracker</h3>
        <Moon className="w-6 h-6 text-[#8B5CF6]" />
      </div>

      {/* Sleep Visual */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Moon/Sun Icon based on hours */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {hours >= 6 && hours <= 10 ? (
                <Moon className="w-32 h-32 text-[#8B5CF6]" />
              ) : (
                <Sun className="w-32 h-32 text-[#F59E0B]" />
              )}
            </motion.div>
          </div>

          {/* Rotating Stars */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 80
            const x = 96 + Math.cos(angle) * radius
            const y = 96 + Math.sin(angle) * radius
            
            return (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              >
                ⭐
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Hours Display */}
      <div className="text-center mb-6">
        <motion.div
          key={hours}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold text-[#8B5CF6]"
        >
          {hours.toFixed(1)}h
        </motion.div>
        <p className={`text-sm font-semibold mt-2 ${qualityColor}`}>
          {quality}
        </p>
        <p className="text-xs text-[#64748B] mt-1">
          Recommended: 7-9 hours
        </p>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          value={hours}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${percentage * 2}%, #E2E8F0 ${percentage * 2}%, #E2E8F0 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-[#64748B]">0h</span>
          <span className="text-xs text-[#64748B]">6h</span>
          <span className="text-xs text-[#64748B]">12h</span>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[6, 7, 8, 9].map((h) => (
          <motion.button
            key={h}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(h)}
            className={`py-2 rounded-xl text-sm font-semibold transition-all ${
              hours === h
                ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-lg'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-purple-50'
            }`}
          >
            {h}h
          </motion.button>
        ))}
      </div>

      {/* Sleep Quality Indicators */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <div className={`p-3 rounded-xl ${hours < 6 ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'}`}>
          <p className="text-xs text-[#64748B] mb-1">Too Little</p>
          <p className="text-lg">😴</p>
        </div>
        <div className={`p-3 rounded-xl ${hours >= 7 && hours <= 9 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
          <p className="text-xs text-[#64748B] mb-1">Perfect</p>
          <p className="text-lg">😊</p>
        </div>
        <div className={`p-3 rounded-xl ${hours > 10 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
          <p className="text-xs text-[#64748B] mb-1">Too Much</p>
          <p className="text-lg">😪</p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </motion.div>
  )
}
