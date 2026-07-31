import React from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, Shield, Globe, Mail, ArrowRight, FileText, Cpu, Activity,
  Lightbulb, Search, Code, Zap, Users, Target, Eye, Lock, Smile
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Logo from '../components/Logo'

// Custom Social Media Icons
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

export default function About() {
  const teamMembers = [
    {
      name: 'Swaliha Shaikh',
      role: 'Project Lead & Full Stack Developer',
      image: 'https://via.placeholder.com/200',
      linkedin: '#',
      github: 'https://github.com/Swaliha1410',
      email: 'swaliha@medsense.ai'
    },
    {
      name: 'Arbaz Khan',
      role: 'AI/ML Developer',
      image: 'https://via.placeholder.com/200',
      linkedin: '#',
      github: '#',
      email: 'arbaz@medsense.ai'
    },
    {
      name: 'Mohd. Faizan',
      role: 'UI/UX Designer',
      image: 'https://via.placeholder.com/200',
      linkedin: '#',
      github: '#',
      email: 'faizan@medsense.ai'
    }
  ]

  const journey = [
    { icon: Lightbulb, title: 'The Idea', desc: 'We conceived an AI solution to make healthcare more accessible for everyone.' },
    { icon: Search, title: 'Research', desc: 'Deep research on healthcare challenges and AI capabilities.' },
    { icon: Code, title: 'Development', desc: 'Building a versatile solution and a great platform.' },
    { icon: Cpu, title: 'AI Integration', desc: 'Bring wise advanced AI models for insightful healthcare.' },
    { icon: Zap, title: 'MedSense', desc: 'Empowering intelligent healthcare for a healthier tomorrow.' }
  ]

  const values = [
    { icon: Lightbulb, title: 'Innovation', desc: 'Pushing the limits of what\'s possible with AI in healthcare insights.', color: 'yellow' },
    { icon: Heart, title: 'Care', desc: 'We put people above all – every feature reflects empathy.', color: 'pink' },
    { icon: Shield, title: 'Privacy', desc: 'We protect your data with best-in-class security.', color: 'blue' },
    { icon: Users, title: 'Accessibility', desc: 'Making healthcare knowledge accessible for all.', color: 'teal' },
    { icon: Smile, title: 'Trust', desc: 'We build trust through transparency.', color: 'green' }
  ]

  const technologies = [
    { name: 'React', icon: '⚛️' },
    { name: 'Django', icon: '🐍' },
    { name: 'Tailwind', icon: '🎨' },
    { name: 'Python', icon: '🐍' },
    { name: 'AI / ML', icon: '🤖' },
    { name: 'Google API', icon: '🗺️' },
    { name: 'Gemini API', icon: '✨' },
    { name: 'Framer Motion', icon: '🎭' }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />

      {/* Hero Section with Image */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-6">
                <div className="w-1.5 h-1.5 bg-[#0F6FFF] rounded-full" />
                <span className="text-xs font-semibold text-[#0F6FFF] uppercase tracking-wide">About MedSense</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 leading-tight">
                Building the Future of<br />
                <span className="text-[#0F6FFF]">AI-Powered </span>
                <span className="text-[#14C8A8]">Healthcare</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                MedSense combines the power of Artificial Intelligence with human-centric care to make healthcare insights faster and more accessible for everyone.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/chat'}
                className="px-8 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold shadow-lg"
              >
                Explore Features
              </motion.button>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600"
                  alt="Healthcare"
                  className="rounded-2xl w-full"
                />
                {/* Floating medical icons */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-red-500" />
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  <Shield className="w-6 h-6 text-blue-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">About MedSense</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-6 leading-tight">
                Building the Future of<br />
                <span className="text-[#0F6FFF]">AI-Powered </span>
                <span className="text-[#14C8A8]">Healthcare</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                MedSense combines Artificial Intelligence with modern healthcare to provide intelligent health guidance, 
                symptom analysis, and smart hospital recommendations—all in one seamless platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* OUR STORY - Full Width Clean Design */}
        <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0F9FF]">
          {/* Subtle animated background elements */}
          <div className="absolute inset-0">
            {/* Soft gradient circles */}
            <motion.div
              className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#0F6FFF]/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#14C8A8]/5 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                x: [0, -50, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F6FFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }} />
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid lg:grid-cols-5 gap-10 items-center"
            >
              {/* Icon Section */}
              <div className="lg:col-span-1 flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", duration: 1, delay: 0.2 }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                  className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-gray-100"
                >
                  <FileText className="w-16 h-16 text-[#0F6FFF]" />
                </motion.div>
              </div>

              {/* Text Content */}
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                    <div className="w-2 h-2 bg-[#0F6FFF] rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-[#0F6FFF] uppercase tracking-wide">Our Story</span>
                  </div>

                  {/* Heading */}
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-[#0F172A]">
                    Transforming Healthcare Through
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8]">
                      Intelligence & Compassion
                    </span>
                  </h2>

                  {/* Description */}
                  <div className="space-y-5 text-lg md:text-xl leading-relaxed text-gray-700">
                    <p>
                      MedSense was born from a simple yet powerful vision: <strong className="text-[#0F172A] font-semibold">to make healthcare more intelligent, accessible, and user-friendly for everyone.</strong>
                    </p>
                    <p>
                      By combining cutting-edge <strong className="text-[#0F172A] font-semibold">conversational AI</strong> with precise <strong className="text-[#0F172A] font-semibold">location-based healthcare services</strong>, we bridge the gap between medical concerns and the right care. Our platform empowers users to understand their health conditions better and connect with appropriate medical facilities—faster, smarter, and with complete confidence.
                    </p>
                    <p>
                      We believe that <strong className="text-[#0F172A] font-semibold">technology should enhance human care, not replace it.</strong> Every feature we build is designed with empathy, ensuring that healthcare guidance reaches those who need it most, exactly when they need it.
                    </p>
                  </div>

                  {/* Stats boxes */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-3 gap-4 mt-8"
                  >
                    {[
                      { label: 'AI-Powered', icon: Cpu, color: 'blue' },
                      { label: 'Always Available', icon: Globe, color: 'teal' },
                      { label: 'Secure & Private', icon: Shield, color: 'purple' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 text-center group hover:shadow-lg transition-all"
                      >
                        <item.icon className={`w-8 h-8 text-${item.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                        <p className="text-sm font-semibold text-[#0F172A]">{item.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>


        {/* MISSION & VISION */}
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-teal-50 to-white rounded-3xl p-8 shadow-md border border-teal-100 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Our Mission</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To empower people with AI-driven healthcare guidance that is fast, reliable, and accessible anytime, anywhere.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 shadow-md border border-blue-100 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Our Vision</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To become a trusted AI healthcare companion that helps millions make informed health decisions with confidence.
              </p>
            </motion.div>
          </div>
        </section>

        {/* MEET OUR TEAM */}
        <section className="py-16 px-6 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Our Team</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-4"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">
                Meet the Minds Behind <span className="text-[#14C8A8]">MedSense</span>
              </h2>
              <p className="text-gray-600">
                Three passionate innovators working together to build smarter healthcare through Artificial Intelligence.
              </p>
            </motion.div>

            {/* Team Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-center group"
                >
                  {/* Profile Image */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-[#0F172A] mb-1">{member.name}</h3>
                  
                  {/* Role */}
                  <p className="text-sm text-gray-500 mb-6">{member.role}</p>

                  {/* Social Icons */}
                  <div className="flex justify-center gap-3">
                    <motion.a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3 }}
                      className="w-9 h-9 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4 text-blue-600" />
                    </motion.a>
                    <motion.a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3 }}
                      className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <GithubIcon className="w-4 h-4 text-gray-700" />
                    </motion.a>
                    <motion.a
                      href={`mailto:${member.email}`}
                      whileHover={{ y: -3 }}
                      className="w-9 h-9 bg-teal-100 hover:bg-teal-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Mail className="w-4 h-4 text-teal-600" />
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* OUR VALUES & TECHNOLOGIES - Side by Side */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Our Values */}
            <div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-8">Our Values</h2>
              <div className="grid grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center group hover:shadow-lg transition-all"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-12 h-12 bg-${value.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}
                    >
                      <value.icon className={`w-6 h-6 text-${value.color}-600`} />
                    </motion.div>
                    <h3 className="font-bold text-[#0F172A] text-sm mb-1">{value.title}</h3>
                    <p className="text-xs text-gray-600">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-8">
                Technologies Behind <span className="text-[#14C8A8]">MedSense</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {technologies.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <span className="text-sm font-medium text-gray-700">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-100 via-teal-50 to-blue-50 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-xl"
            >
              {/* Decorative elements */}
              <div className="absolute top-8 left-8 w-16 h-16 bg-blue-200/30 rounded-full blur-2xl" />
              <div className="absolute bottom-8 right-8 w-20 h-20 bg-teal-200/30 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                  Together, We're Building Smarter Healthcare
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join us on our journey to transform healthcare through Artificial Intelligence.
                </p>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Contact Us
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
