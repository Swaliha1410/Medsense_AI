import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Zap, Users, MessageSquare, MapPin, FileText, Activity, ChevronDown, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Logo from '../components/Logo'

const FAQ_ITEMS = [
  { q: 'Is MedSense a replacement for a real doctor?', a: 'No. MedSense provides AI-powered health guidance and information, but it is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.' },
  { q: 'How does the AI chat work?', a: 'Our AI is trained on a large medical knowledge base. You describe your symptoms or ask health questions in plain language, and the AI provides relevant information and guidance based on established medical knowledge.' },
  { q: 'Is my health data safe?', a: 'Yes. All data is encrypted in transit and at rest. We never sell your data to third parties. You can delete your account and all associated data at any time from Settings.' },
  { q: 'How accurate is the symptom checker?', a: 'Our AI achieves high accuracy on common conditions, but no AI is 100% accurate. We always recommend confirming AI suggestions with a healthcare professional, especially for serious symptoms.' },
  { q: 'Can I use MedSense for free?', a: 'Yes! MedSense offers a free tier with full access to AI chat, hospital finder, and basic health tracking. Premium features like unlimited report analysis are available on our Pro plan.' },
]

function FaqItem({ item }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left group">
        <span className="font-medium text-text group-hover:text-[#0F6FFF] transition-colors text-sm">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-text/40 transition-transform flex-shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-sm text-text/60 pb-4 leading-relaxed">
          {item.a}
        </motion.p>
      )}
    </div>
  )
}

export default function About() {
  const features = [
    { icon: MessageSquare, title: 'AI Chat', desc: 'Conversational health guidance powered by advanced AI models trained on medical literature.' },
    { icon: Activity,      title: 'Symptom Checker', desc: 'Analyze symptoms with AI and get actionable insights about potential conditions.' },
    { icon: MapPin,        title: 'Hospital Finder', desc: 'Locate nearby hospitals and clinics with real-time availability and wait times.' },
    { icon: FileText,      title: 'Report Analysis', desc: 'Upload medical reports and get AI-generated plain-language summaries.' },
  ]

  const values = [
    { icon: Heart,   title: 'Patient First',    desc: 'Every feature is designed with patient wellbeing as the top priority.' },
    { icon: Shield,  title: 'Privacy & Safety', desc: 'HIPAA-aligned data handling with end-to-end encryption.' },
    { icon: Zap,     title: 'AI Innovation',    desc: 'Continuously improving our models with the latest medical research.' },
    { icon: Users,   title: 'Accessibility',    desc: 'Healthcare guidance available to everyone, in multiple languages, 24/7.' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0F6FFF]/10 rounded-full blur-[100px]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto relative z-10">
          <div className="flex justify-center mb-6">
            <Logo className="w-20 h-20" />
          </div>
          <h1 className="text-5xl font-bold text-text mb-4">
            About <span className="text-gradient">MedSense</span>
          </h1>
          <p className="text-xl text-text/60 leading-relaxed">
            MedSense is an AI-powered healthcare companion designed to make quality health guidance accessible to everyone — anytime, anywhere.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-text mb-6">Our Mission</h2>
            <p className="text-lg text-text/60 leading-relaxed max-w-2xl mx-auto">
              We believe that everyone deserves access to accurate, timely health information. MedSense bridges the gap between patients and healthcare knowledge by combining cutting-edge AI with an intuitive, human-centered design.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl font-bold text-text text-center mb-12">
            What We <span className="text-gradient">Offer</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glassmorphism rounded-3xl p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-text mb-2">{f.title}</h3>
                <p className="text-sm text-text/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl font-bold text-text text-center mb-12">
            Our <span className="text-gradient">Values</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glassmorphism rounded-3xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center flex-shrink-0">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-text mb-1">{v.title}</h3>
                  <p className="text-sm text-text/60 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl font-bold text-text text-center mb-12">
            Frequently Asked <span className="text-gradient">Questions</span>
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glassmorphism rounded-3xl px-8 py-4">
            {FAQ_ITEMS.map((item, i) => <FaqItem key={i} item={item} />)}
          </motion.div>
        </div>
      </section>

      {/* Contact / Help */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-text mb-4">Need Help?</h2>
            <p className="text-text/60 mb-8">Our support team is available 24/7.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:support@medsense.ai" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold">
                <Mail className="w-4 h-4" /> Email Support
              </a>
              <Link to="/chat" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-text rounded-xl font-semibold hover:shadow-md transition-shadow">
                <MessageSquare className="w-4 h-4 text-[#0F6FFF]" /> Ask AI
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
