import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const Statistics = () => {
  const stats = [
    { value: 100000, suffix: '+', label: 'Health Queries', duration: 2 },
    { value: 500, suffix: '+', label: 'Hospitals', duration: 2 },
    { value: 98, suffix: '%', label: 'Accuracy', duration: 2 },
    { value: 24, suffix: '/7', label: 'Support', duration: 1.5 },
  ]

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#14C8A8]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0F6FFF]/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-text mb-4">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Join a growing community that trusts MedSense for their healthcare needs.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

const StatCard = ({ stat, index }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime
      const duration = stat.duration * 1000

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        setCount(Math.floor(progress * stat.value))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isInView, stat.value, stat.duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.05 }}
      className="glassmorphism rounded-3xl p-8 text-center cursor-pointer group"
    >
      <div className="mb-4">
        <span className="text-5xl font-bold text-gradient">
          {count.toLocaleString()}
          {stat.suffix}
        </span>
      </div>
      <p className="text-lg font-semibold text-text/70 group-hover:text-text transition-colors">
        {stat.label}
      </p>
    </motion.div>
  )
}

export default Statistics
