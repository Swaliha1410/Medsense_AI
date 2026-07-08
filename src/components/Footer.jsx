import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import Logo from './Logo'

const Footer = () => {
  const quickLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Testimonials', href: '#testimonials' },
  ]

  const legal = [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'HIPAA Compliance', href: '#hipaa' },
  ]

  const contact = [
    { icon: Mail, text: 'support@medsense.ai', href: 'mailto:support@medsense.ai' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: MapPin, text: 'San Francisco, CA', href: '#' },
  ]

  return (
    <footer className="bg-gradient-to-br from-[#F8FAFC] to-white pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0F6FFF]/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#14C8A8]/5 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Logo className="w-12 h-12" />
              <span className="text-2xl font-bold text-text">
                Med<span className="text-[#14C8A8]">sense</span>
              </span>
            </div>
            <p className="text-text/60 leading-relaxed mb-6">
              Your personal AI healthcare companion, providing intelligent health guidance and instant access to medical care.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center text-text/60 hover:text-[#0F6FFF] transition-colors"
                aria-label="Social Media"
              >
                <Heart className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center text-text/60 hover:text-[#0F6FFF] transition-colors"
                aria-label="Social Media"
              >
                <Mail className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center text-text/60 hover:text-[#0F6FFF] transition-colors"
                aria-label="Social Media"
              >
                <Phone className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-text mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text/60 hover:text-[#0F6FFF] transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-text mb-4">Legal</h3>
            <ul className="space-y-3">
              {legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text/60 hover:text-[#0F6FFF] transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-text mb-4">Contact</h3>
            <ul className="space-y-4">
              {contact.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-start gap-3 text-text/60 hover:text-[#0F6FFF] transition-colors group"
                  >
                    <item.icon className="w-5 h-5 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-text/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text/50 text-sm">
              © 2026 MedSense. All rights reserved.
            </p>
            <p className="text-text/50 text-sm">
              Made with <Heart className="w-4 h-4 inline text-[#0F6FFF] fill-[#0F6FFF]" /> for better healthcare
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
