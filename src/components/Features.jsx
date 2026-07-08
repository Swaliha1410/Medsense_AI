import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Activity, MapPin, FileText } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Talk naturally about your health concerns and get instant, personalized guidance from our advanced AI.',
      color: 'from-[#0F6FFF] to-[#14C8A8]',
    },
    {
      icon: Activity,
      title: 'Smart Symptom Checker',
      description: 'Analyze your symptoms using AI to understand potential conditions and get recommendations.',
      color: 'from-[#14C8A8] to-[#0F6FFF]',
    },
    {
      icon: MapPin,
      title: 'Nearby Hospital Finder',
      description: 'Find the nearest hospitals, clinics, and healthcare facilities based on your location instantly.',
      color: 'from-[#0F6FFF] to-[#14C8A8]',
    },
    {
      icon: FileText,
      title: 'Medical Report Analysis',
      description: 'Upload your medical reports and get AI-powered insights and explanations in simple terms.',
      color: 'from-[#14C8A8] to-[#0F6FFF]',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F6FFF]/10 rounded-full blur-[120px]"></div>

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
            Powerful Features for Your <span className="text-gradient">Health</span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Everything you need to take control of your healthcare journey in one intelligent platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glassmorphism rounded-3xl p-8 cursor-pointer group"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
              <p className="text-text/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
