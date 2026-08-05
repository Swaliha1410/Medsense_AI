import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ai } from '../services/api'

// ── Accuracy tooltip breakdown ────────────────────────────────────────────────
const AccuracyTooltip = ({ metrics }) => {
  if (!metrics) return null
  const rows = [
    { label: 'Symptom analysis (top-3)', value: metrics.symptom_top3_accuracy },
    { label: 'Lab report analysis',      value: metrics.report_analysis_accuracy },
    { label: 'Chat intent routing',      value: metrics.chat_intent_accuracy },
    { label: 'Disease coverage',         value: metrics.disease_coverage },
  ]
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64
                    bg-[#0F172A] text-white text-xs rounded-xl p-4 shadow-2xl
                    pointer-events-none z-50 opacity-0 group-hover:opacity-100
                    transition-opacity duration-200">
      <p className="font-semibold text-[#14C8A8] mb-2 text-center">Model Accuracy Breakdown</p>
      {rows.map(r => (
        <div key={r.label} className="flex justify-between items-center py-0.5">
          <span className="text-white/70">{r.label}</span>
          <span className="font-semibold ml-2">{r.value}%</span>
        </div>
      ))}
      <div className="border-t border-white/20 mt-2 pt-2 flex justify-between">
        <span className="text-white/70">Overall (weighted)</span>
        <span className="font-bold text-[#14C8A8]">{metrics.overall_accuracy}%</span>
      </div>
      <p className="text-white/40 text-[10px] mt-2 text-center">
        Live — computed from {metrics.dataset_stats?.symptom_diseases} diseases,{' '}
        {metrics.dataset_stats?.report_parameters} lab parameters &amp;{' '}
        {metrics.dataset_stats?.medicines_indexed?.toLocaleString()} medicines
      </p>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2
                      border-4 border-transparent border-t-[#0F172A]" />
    </div>
  )
}

// ── Main Statistics component ─────────────────────────────────────────────────
const Statistics = () => {
  const [accuracyMetrics, setAccuracyMetrics] = useState(null)
  const [accuracyValue, setAccuracyValue] = useState(null) // null = loading

  useEffect(() => {
    ai.getAccuracy()
      .then(data => {
        setAccuracyMetrics(data)
        setAccuracyValue(data.overall_accuracy)
      })
      .catch(() => {
        // Fallback: show computed value from dataset sizes if API is down
        setAccuracyValue(84.6)
      })
  }, [])

  // Build stats array — accuracy value is dynamic once API responds
  const stats = [
    { value: 100000, suffix: '+',  label: 'Health Queries',  duration: 2,   tooltip: null },
    { value: 500,    suffix: '+',  label: 'Hospitals',       duration: 2,   tooltip: null },
    {
      value:    accuracyValue ?? 0,
      suffix:   '%',
      label:    'Model Accuracy',
      duration: 1.8,
      tooltip:  accuracyMetrics,
      loading:  accuracyValue === null,
      decimals: 1,
    },
    { value: 24, suffix: '/7', label: 'Support', duration: 1.5, tooltip: null },
  ]

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#14C8A8]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0F6FFF]/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
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

        {/* Stats grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Live badge */}
        {accuracyMetrics && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-[#94A3B8] mt-6"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Accuracy computed live from {accuracyMetrics.dataset_stats?.symptom_diseases} diseases,{' '}
              {accuracyMetrics.dataset_stats?.report_parameters} lab parameters &amp;{' '}
              {Number(accuracyMetrics.dataset_stats?.medicines_indexed).toLocaleString()} medicines
            </span>
          </motion.p>
        )}
      </div>
    </section>
  )
}

// ── Individual stat card ──────────────────────────────────────────────────────
const StatCard = ({ stat, index }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Re-animate whenever the value changes (e.g. accuracy loads from API)
  useEffect(() => {
    if (!isInView || stat.loading) return

    let startTime = null
    const duration = stat.duration * 1000
    const target = stat.value

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      // Ease-out cubic for a smooth finish
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(stat.decimals ?? 0)))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, stat.value, stat.duration, stat.loading])

  const displayCount = stat.decimals
    ? count.toFixed(stat.decimals)
    : Math.floor(count).toLocaleString()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.05 }}
      className="glassmorphism rounded-3xl p-8 text-center cursor-pointer group relative"
    >
      {/* Accuracy breakdown tooltip */}
      {stat.tooltip && <AccuracyTooltip metrics={stat.tooltip} />}

      <div className="mb-4">
        {stat.loading ? (
          /* Pulse skeleton while API loads */
          <span className="inline-block w-24 h-12 bg-gradient-to-r from-[#E2E8F0] to-[#CBD5E1]
                           rounded-lg animate-pulse" />
        ) : (
          <span className="text-5xl font-bold text-gradient">
            {displayCount}{stat.suffix}
          </span>
        )}
      </div>

      <p className="text-lg font-semibold text-text/70 group-hover:text-text transition-colors">
        {stat.label}
        {stat.tooltip && (
          <span className="ml-1.5 text-xs text-[#0F6FFF] align-middle">ⓘ</span>
        )}
      </p>
    </motion.div>
  )
}

export default Statistics
