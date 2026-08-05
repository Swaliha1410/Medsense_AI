import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Heart, MapPin, Pill, FileText } from 'lucide-react'

const DashboardPreview = () => {
  const cards = [
    {
      icon: MessageSquare,
      title: 'AI Chat',
      subtitle: 'Active conversation',
      value: '24/7 Available',
      gradient: 'from-[#0F6FFF] to-[#14C8A8]',
      position: 'lg:col-span-2 lg:row-span-2',
    },
    {
      icon: Heart,
      title: 'Health Score',
      subtitle: 'Overall wellness',
      value: '92/100',
      gradient: 'from-[#14C8A8] to-[#0F6FFF]',
      position: 'lg:col-span-1',
    },
    {
      icon: MapPin,
      title: 'Hospital Finder',
      subtitle: 'Nearby facilities',
      value: '45 Hospitals',
      gradient: 'from-[#0F6FFF] to-[#14C8A8]',
      position: 'lg:col-span-1',
    },
    {
      icon: Pill,
      title: 'Medicine Reminder',
      subtitle: 'Today',
      value: '3 Pending',
      gradient: 'from-[#14C8A8] to-[#0F6FFF]',
      position: 'lg:col-span-1',
    },
    {
      icon: FileText,
      title: 'Medical Reports',
      subtitle: 'Uploaded',
      value: '12 Files',
      gradient: 'from-[#0F6FFF] to-[#14C8A8]',
      position: 'lg:col-span-1',
    },
  ]

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0F6FFF]/10 rounded-full blur-[150px]"></div>

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
            Your Health <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Everything you need to manage your health in one beautiful, intuitive interface.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[180px]">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`glassmorphism rounded-3xl p-6 cursor-pointer group relative overflow-hidden ${card.position}`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-1">{card.title}</h3>
                  <p className="text-sm text-text/50">{card.subtitle}</p>
                </div>
                <div className="text-3xl font-bold text-gradient">{card.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
