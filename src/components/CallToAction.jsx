import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MessageSquare, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { contact } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CallToAction = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [showForm, setShowForm]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [form, setForm]           = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await contact.submit(form)
      setSubmitted(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard')
    } else {
      setShowForm(true)
      setSubmitted(false)
    }
  }

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0F6FFF]/20 rounded-full blur-[150px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glassmorphism rounded-[40px] p-12 md:p-16 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] opacity-5 group-hover:opacity-10 transition-opacity duration-500" />

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-text mb-6"
            >
              Start Your Health Journey <span className="text-gradient">Today</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-text/60 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of users who trust MedSense for personalised health guidance,
              AI-powered insights, and instant access to healthcare facilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(15, 111, 255, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-10 py-4 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-2xl shadow-2xl text-lg flex items-center gap-3 group/btn cursor-pointer"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>

              <Link to="/chat">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block px-10 py-4 bg-white text-text font-semibold rounded-2xl shadow-lg text-lg flex items-center gap-3 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  Talk to AI
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-text/50"
            >
              {['No credit card required', 'Free to start', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#14C8A8]" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div key="form" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-[#14C8A8] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">You're on the list!</h3>
                  <p className="text-gray-500 mb-4">We'll be in touch soon.</p>
                  <p className="text-sm text-text/50 mb-6">Or create your account now:</p>
                  <div className="flex gap-3">
                    <Link to="/auth?mode=register" className="flex-1 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold text-center text-sm">Sign Up Free</Link>
                    <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-text/60">Close</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Get Started</h2>
                  <p className="text-gray-500 text-sm mb-6">We'll reach out to set up your account — or <Link to="/auth?mode=register" className="text-[#0F6FFF] hover:underline">sign up instantly</Link>.</p>
                  {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30" />
                    <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30" />
                    <textarea name="message" placeholder="Tell us about your healthcare needs (optional)" value={form.message} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 resize-none" />
                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60">
                      {loading ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default CallToAction
