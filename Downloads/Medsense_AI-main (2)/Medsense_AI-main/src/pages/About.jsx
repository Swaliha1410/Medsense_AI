import { motion } from 'framer-motion'
import { 
  Heart, Shield, Mail, Lightbulb, Search, Code, Cpu, Zap,
  Users, Eye, Smile, Target, ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Social Media Icons
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
      image: 'https://via.placeholder.com/150',
      linkedin: '#',
      github: 'https://github.com/Swaliha1410',
      email: 'swaliha@medsense.ai'
    },
    {
      name: 'Arbaz Khan',
      role: 'AI/ML Developer',
      image: 'https://via.placeholder.com/150',
      linkedin: '#',
      github: '#',
      email: 'arbaz@medsense.ai'
    },
    {
      name: 'Mohd. Faizan',
      role: 'UI/UX Designer',
      image: 'https://via.placeholder.com/150',
      linkedin: '#',
      github: '#',
      email: 'faizan@medsense.ai'
    }
  ]

  const journey = [
    { icon: Lightbulb, title: 'The Idea', desc: 'We conceived an AI solution to make healthcare accessible.' },
    { icon: Search, title: 'Research', desc: 'Deep research on healthcare challenges and AI capabilities.' },
    { icon: Code, title: 'Development', desc: 'Building a versatile solution and a great platform.' },
    { icon: Cpu, title: 'AI Integration', desc: 'Bringing advanced AI models for insightful healthcare.' },
    { icon: Zap, title: 'MedSense', desc: 'Empowering intelligent healthcare for tomorrow.' }
  ]

  const values = [
    { icon: Lightbulb, title: 'Innovation', desc: 'Pushing AI limits in healthcare insights.' },
    { icon: Heart, title: 'Care', desc: 'People above all – empathy in every feature.' },
    { icon: Shield, title: 'Privacy', desc: 'Best-in-class data security.' },
    { icon: Users, title: 'Accessibility', desc: 'Healthcare knowledge for all.' },
    { icon: Smile, title: 'Trust', desc: 'Building trust through transparency.' }
  ]

  const technologies = [
    'React', 'Django', 'Tailwind', 'Python', 'AI / ML', 'Google API', 'Gemini API', 'Framer Motion'
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4">
                <div className="w-1.5 h-1.5 bg-[#0F6FFF] rounded-full" />
                <span className="text-xs font-bold text-[#0F6FFF]">ABOUT MEDSENSE</span>
              </div>
              
              <h1 className="text-5xl font-bold mb-6">
                Building the Future of<br />
                <span className="text-[#0F6FFF]">AI-Powered </span>
                <span className="text-[#14C8A8]">Healthcare</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                MedSense combines the power of Artificial Intelligence with human-centric care to make healthcare insights faster and accessible for everyone.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => window.location.href = '/chat'}
                className="px-6 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold"
              >
                Explore Features
              </motion.button>
            </motion.div>

            {/* Right Image with floating icons */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative">
                {/* Main family image with blue glow effect */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600"
                    alt="Family Healthcare"
                    className="rounded-3xl w-full relative z-10"
                  />
                  {/* Blue glow effect at bottom */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-24 bg-gradient-to-t from-[#0F6FFF]/30 to-transparent blur-2xl" />
                </div>

                {/* Floating medical icons around the image */}
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-8 right-8 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Shield className="w-6 h-6 text-[#0F6FFF]" />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute top-16 left-8 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 text-[#14C8A8]" />
                </motion.div>

                <motion.div
                  animate={{ y: [-8, 12, -8], rotate: [0, 8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-20 right-12 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.div>

                <motion.div
                  animate={{ y: [12, -8, 12], rotate: [0, -8, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, delay: 1.5 }}
                  className="absolute top-1/2 right-4 w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Cpu className="w-6 h-6 text-[#0F6FFF]" />
                </motion.div>

                <motion.div
                  animate={{ y: [-12, 8, -12] }}
                  transition={{ duration: 4.2, repeat: Infinity, delay: 0.8 }}
                  className="absolute bottom-32 left-4 w-9 h-9 bg-white rounded-lg shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-[#14C8A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Doctor image with floating icons */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600"
                alt="Doctor with patients"
                className="rounded-3xl shadow-xl relative z-10"
              />
              
              {/* Floating medical icons */}
              <motion.div
                animate={{ y: [-8, 8, -8], x: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-12 left-4 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center"
              >
                <Heart className="w-5 h-5 text-red-400" />
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                className="absolute top-8 right-8 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </motion.div>

              <motion.div
                animate={{ y: [-6, 10, -6], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute bottom-16 left-8 w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-[#0F6FFF]" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full mb-4 shadow-sm">
                <span className="text-xs font-bold text-[#0F172A]">OUR STORY</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Healthcare should be<br />
                <span className="text-[#0F6FFF]">Intelligent. </span>
                <span className="text-[#14C8A8]">Accessible. </span>
                <span className="text-gray-900">Human.</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We trust MedSense with our most precious asset – our health. Our AI-powered platform is built to make smart healthcare decisions easy, fast, and most importantly, accessible to everyone when they need it most.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4">
              <span className="text-xs font-bold text-[#0F6FFF]">OUR JOURNEY</span>
            </div>
            <h2 className="text-4xl font-bold">How We Built AI for Healthcare</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {journey.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-[#0F6FFF]" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <Target className="w-12 h-12 text-[#0F6FFF] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To empower individuals with AI-driven healthcare guidance that is fast, accurate, and accessible to quality care for all.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <Eye className="w-12 h-12 text-[#14C8A8] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To become the world's most trusted AI healthcare companion for every individual.
            </p>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4">
              <span className="text-xs font-bold text-[#0F6FFF]">MEET THE TEAM DRIVING OUR MISSION</span>
            </div>
            <h2 className="text-4xl font-bold">Our Team</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{member.role}</p>
                <div className="flex justify-center gap-3">
                  <a href={member.linkedin} className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <LinkedinIcon className="w-5 h-5 text-blue-600" />
                  </a>
                  <a href={member.github} className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <GithubIcon className="w-5 h-5 text-gray-700" />
                  </a>
                  <a href={`mailto:${member.email}`} className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-teal-600" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4">
              <span className="text-xs font-bold text-[#0F6FFF]">OUR CORE VALUES</span>
            </div>
            <h2 className="text-4xl font-bold">Principles We Follow</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-md text-center"
              >
                <value.icon className="w-10 h-10 text-[#0F6FFF] mx-auto mb-3" />
                <h3 className="font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full mb-4">
              <span className="text-xs font-bold text-[#0F6FFF]">TECHNOLOGIES WE USE</span>
            </div>
            <h2 className="text-4xl font-bold">Built With Modern Tech</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="bg-white px-6 py-3 rounded-full shadow-md"
              >
                <span className="font-semibold">{tech}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-100 to-teal-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Together, We're Building Smarter Healthcare
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join us on our journey to transform healthcare through AI.
          </p>
          <Link to="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold inline-flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
