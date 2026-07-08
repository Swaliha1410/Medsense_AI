import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Brain, Lightbulb, Hospital } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageCircle,
      title: 'Describe Symptoms',
      description: 'Tell us about your health concerns in your own words, just like talking to a friend.',
    },
    {
      icon: Brain,
      title: 'AI Understands',
      description: 'Our advanced AI analyzes your symptoms and medical history to understand your situation.',
    },
    {
      icon: Lightbulb,
      title: 'Personalized Guidance',
      description: 'Receive tailored health recommendations and insights based on your unique needs.',
    },
    {
      icon: Hospital,
      title: 'Find Nearby Hospital',
      description: 'Get instant access to nearby hospitals and healthcare facilities for your condition.',
    },
  ]

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#14C8A8]/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-text mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Get personalized healthcare guidance in four simple steps.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0F6FFF] via-[#14C8A8] to-[#0F6FFF] -translate-y-1/2"></div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className="text-center relative"
              >
                {/* Number Badge */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] text-white font-bold flex items-center justify-center text-lg shadow-lg z-20"
                >
                  {index + 1}
                </motion.div>

                {/* Card */}
                <div className="glassmorphism rounded-3xl p-8 h-full">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-text mb-3">{step.title}</h3>
                  <p className="text-text/60 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
