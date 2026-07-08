import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      avatar: 'SJ',
      rating: 5,
      text: 'MedSense has transformed how I manage my health. The AI chat is incredibly helpful and the hospital finder saved me during an emergency.',
      gradient: 'from-[#0F6FFF] to-[#14C8A8]',
    },
    {
      name: 'Michael Chen',
      role: 'Healthcare Professional',
      avatar: 'MC',
      rating: 5,
      text: 'As a doctor, I recommend MedSense to my patients. The symptom checker is accurate and helps people make informed decisions about their health.',
      gradient: 'from-[#14C8A8] to-[#0F6FFF]',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Working Professional',
      avatar: 'ER',
      rating: 5,
      text: 'The 24/7 availability is a game-changer. I can get health advice anytime, and the medical report analysis feature helps me understand my lab results.',
      gradient: 'from-[#0F6FFF] to-[#14C8A8]',
    },
  ]

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0F6FFF]/10 rounded-full blur-[120px]"></div>

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
            What Our Users <span className="text-gradient">Say</span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Real stories from people who trust MedSense with their healthcare journey.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glassmorphism rounded-3xl p-8 cursor-pointer group relative overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-16 h-16 text-text" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#0F6FFF] text-[#0F6FFF]" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-text/70 leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-text">{testimonial.name}</h4>
                    <p className="text-sm text-text/50">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
