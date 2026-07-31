import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Activity, FileText, Pill, MapPin,
  Heart, Clock, AlertCircle, ArrowRight, Sparkles,
  Droplet, Moon, TrendingUp, Flame, Send, Mic,
  Award, CheckCircle, Phone, Navigation, Zap, Brain,
  Target, Stethoscope, Users, Calendar, TrendingDown
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { healthScore, medicines, reports, chat, profile } from '../services/api'
import AIAvatar from '../components/dashboard/AIAvatar'
import AnimatedBackground from '../components/dashboard/AnimatedBackground'
import FloatingHealthWidget from '../components/dashboard/FloatingHealthWidget'
import HealthScoreCircle from '../components/dashboard/HealthScoreCircle'
import TimelineItem from '../components/dashboard/TimelineItem'
import AchievementBadge from '../components/dashboard/AchievementBadge'

export default function DashboardPremium() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

  const [score, setScore] = useState(null)
  const [pendingMeds, setPendingMeds] = useState([])
  const [recentReports, setRecentReports] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }

    Promise.all([
      healthScore.latest().catch(() => null),
      medicines.list('pending').catch(() => []),
      reports.list().catch(() => []),
      chat.list().catch(() => []),
      profile.get().catch(() => null),
    ]).then(([scoreData, medsData, reportsData, chatData, profileData]) => {
      setScore(scoreData)
      setPendingMeds((medsData?.results || medsData || []).slice(0, 3))
      setRecentReports((reportsData?.results || reportsData || []).slice(0, 3))
      setRecentChats((chatData?.results || chatData || []).filter(m => m.role === 'user').slice(0, 3))
      setUserProfile(profileData)
      setLoading(false)
    })
  }, [isLoggedIn, navigate])

  const getUserName = () => {
    if (user?.first_name) return user.first_name
    return user?.username || 'User'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/chat', { state: { initialMessage: searchQuery } })
    }
  }

  const handleSuggestionClick = (suggestion) => {
    navigate('/chat', { state: { initialMessage: suggestion } })
  }

  const quickSuggestions = [
    'I have fever',
    'Check my report',
    'Find nearby hospital',
    'Medicine reminder',
    'Drink water'
  ]

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Chat with your healthcare companion',
      link: '/chat',
      gradient: 'from-[#2F80FF] to-[#22C7A9]',
    },
    {
      icon: Activity,
      title: 'Health Analysis',
      description: 'Understand your symptoms',
      link: '/health-analysis',
      gradient: 'from-[#8B5CF6] to-[#2F80FF]',
    },
    {
      icon: FileText,
      title: 'Medical Reports',
      description: 'Upload and analyze reports',
      link: '/reports',
      gradient: 'from-[#22C7A9] to-[#8B5CF6]',
    },
    {
      icon: Pill,
      title: 'Medicines',
      description: 'Track your medications',
      link: '/medicines',
      gradient: 'from-[#2F80FF] to-[#22C7A9]',
    },
    {
      icon: MapPin,
      title: 'Hospital Finder',
      description: 'Find care facilities near you',
      link: '/hospitals',
      gradient: 'from-[#22C7A9] to-[#2F80FF]',
    },
  ]

  const timelineEvents = [
    { time: '8 AM', label: 'Morning Medicine', status: 'completed', icon: Pill },
    { time: '10 AM', label: 'Drink Water', status: 'completed', icon: Droplet },
    { time: '1 PM', label: 'Lunch', status: 'pending', icon: Clock },
    { time: '4 PM', label: 'Walk', status: 'pending', icon: TrendingUp },
    { time: '8 PM', label: 'Evening Medicine', status: 'pending', icon: Pill },
    { time: '10 PM', label: 'Sleep', status: 'pending', icon: Moon },
  ]

  const achievements = [
    { icon: Flame, title: '12 Day Streak', unlocked: true, color: 'from-orange-500 to-red-500' },
    { icon: Droplet, title: 'Hydration Master', unlocked: true, color: 'from-blue-500 to-cyan-500' },
    { icon: Pill, title: 'Medicine Hero', unlocked: true, color: 'from-purple-500 to-pink-500' },
    { icon: Moon, title: 'Sleep Champ', unlocked: false, color: 'from-indigo-500 to-purple-500' },
  ]

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-[#2F80FF]/30 border-t-[#2F80FF] rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Animated Background */}
      <AnimatedBackground />
      
      <div className="relative z-10 p-6 max-w-[1600px] mx-auto">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Left Side - Search and Greeting */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-bold text-[#0F172A] mb-3"
              >
                {getGreeting()}, {getUserName()} 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-[#64748B]"
              >
                Let's take care of your health today.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-[#64748B] mt-2"
              >
                Talk to MedSense AI, analyze reports, track medicines and find the right care near you.
              </motion.p>
            </div>

            {/* AI Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="relative"
            >
              <div className="relative backdrop-blur-xl bg-white/80 border-2 border-[#E2E8F0] rounded-3xl p-2 shadow-2xl hover:shadow-3xl transition-all group focus-within:border-[#2F80FF]">
                <div className="flex items-center gap-3 px-4">
                  <Brain className="w-6 h-6 text-[#2F80FF] flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="How can I help you today?"
                    className="flex-1 py-4 text-lg bg-transparent border-none outline-none text-[#0F172A] placeholder-[#94A3B8]"
                  />
                  <button
                    type="button"
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#2F80FF] flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="submit"
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2F80FF] to-[#22C7A9] flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Suggestion Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              {quickSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-2xl backdrop-blur-sm bg-white/60 border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-white hover:text-[#2F80FF] hover:border-[#2F80FF] transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Right Side - AI Avatar */}
          <div className="relative h-[500px]">
            <AIAvatar />
          </div>
        </motion.div>

        {/* FLOATING HEALTH WIDGETS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <FloatingHealthWidget
            icon={Droplet}
            title="Water Intake"
            value="6 / 8"
            subtitle="glasses"
            color="blue"
            delay={0}
          />
          <FloatingHealthWidget
            icon={Pill}
            title="Medicine"
            value="2 / 3"
            subtitle="taken today"
            color="purple"
            delay={0.1}
          />
          <FloatingHealthWidget
            icon={Moon}
            title="Sleep"
            value="7h 20m"
            subtitle="last night"
            color="purple"
            delay={0.2}
          />
          <FloatingHealthWidget
            icon={TrendingUp}
            title="Daily Steps"
            value="5,420"
            subtitle="/ 8,000"
            color="teal"
            delay={0.3}
          />
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-[#E2E8F0] hover:border-[#2F80FF] hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <action.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h4 className="text-base font-bold text-[#0F172A] mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-[#64748B]">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT COLUMN - Health Score + Timeline */}
          <div className="space-y-6">
            {/* AI HEALTH SCORE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
            >
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">AI Health Score</h3>
              <HealthScoreCircle score={score?.score || 82} />
            </motion.div>

            {/* TODAY'S TIMELINE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
            >
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Today's Timeline</h3>
              <div className="space-y-0">
                {timelineEvents.map((event, index) => (
                  <TimelineItem key={index} {...event} index={index} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* MIDDLE COLUMN - AI Insights + Reports */}
          <div className="space-y-6">
            {/* AI INSIGHTS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-teal-50/80 rounded-3xl p-8 border border-blue-200/50 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2F80FF] to-[#22C7A9] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">AI Insights</h3>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <p className="text-sm text-[#0F172A] font-medium">
                    👋 Good morning! Yesterday you drank only 5 glasses.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <p className="text-sm text-[#0F172A] font-medium">
                    💊 Don't forget your Vitamin D supplement.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                  className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <p className="text-sm text-[#0F172A] font-medium">
                    😴 Your sleep improved by 15% this week!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <p className="text-sm text-[#0F172A] font-medium">
                    🏥 Nearest pharmacy is open till 10 PM.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* RECENT REPORTS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#0F172A]">Recent Reports</h3>
                <Link
                  to="/reports"
                  className="text-sm text-[#2F80FF] hover:text-[#22C7A9] font-semibold transition-colors"
                >
                  View All
                </Link>
              </div>

              {recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 + index * 0.1 }}
                      onClick={() => navigate('/reports')}
                      className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all cursor-pointer group border border-transparent hover:border-[#2F80FF]/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F80FF] to-[#22C7A9] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] truncate">
                              {report.title}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {new Date(report.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#64748B] group-hover:text-[#2F80FF] group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-[#2F80FF]" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-4">
                    No reports uploaded yet
                  </p>
                  <Link
                    to="/reports"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2F80FF] to-[#22C7A9] text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Upload Report
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Conversations + Hospital */}
          <div className="space-y-6">
            {/* RECENT CONVERSATIONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#0F172A]">Recent Conversations</h3>
                <Link
                  to="/chat-history"
                  className="text-sm text-[#2F80FF] hover:text-[#22C7A9] font-semibold transition-colors"
                >
                  View All
                </Link>
              </div>

              {recentChats.length > 0 ? (
                <div className="space-y-3">
                  {recentChats.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + index * 0.1 }}
                      onClick={() => navigate('/chat')}
                      className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer group border border-transparent hover:border-[#2F80FF]/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#2F80FF] flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0F172A] line-clamp-2 mb-1">
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-[#64748B]">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </p>
                            <span className="text-xs text-[#2F80FF] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              Continue →
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-[#8B5CF6]" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-4">
                    No conversations yet
                  </p>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2F80FF] text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Start Chatting
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* HOSPITAL FINDER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#0F172A]">Nearby Hospitals</h3>
                <Link
                  to="/hospitals"
                  className="text-sm text-[#2F80FF] hover:text-[#22C7A9] font-semibold transition-colors"
                >
                  View Map
                </Link>
              </div>

              <div className="relative h-48 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden mb-4">
                {/* Mini Map Illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-[#2F80FF] animate-bounce" />
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#22C55E]">
                  5 nearby
                </div>
              </div>

              <Link
                to="/hospitals"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#22C7A9] to-[#2F80FF] text-white font-semibold hover:shadow-lg transition-all group"
              >
                <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                Open Hospital Finder
              </Link>
            </motion.div>

            {/* ACHIEVEMENTS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-[#E2E8F0] shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-[#F59E0B]" />
                <h3 className="text-xl font-bold text-[#0F172A]">Achievements</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <AchievementBadge
                    key={index}
                    {...achievement}
                    delay={2.2 + index * 0.05}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* EMERGENCY BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3 }}
          className="backdrop-blur-xl bg-gradient-to-r from-red-50/80 to-orange-50/80 rounded-3xl p-8 border-2 border-red-200/50 shadow-xl mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center flex-shrink-0 shadow-lg"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                    "0 0 40px rgba(239, 68, 68, 0.5)",
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <AlertCircle className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                  Need urgent medical care?
                </h3>
                <p className="text-base text-[#64748B]">
                  Find emergency care facilities and get immediate assistance.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/hospitals?filter=emergency"
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-bold hover:shadow-2xl transition-all whitespace-nowrap"
              >
                <MapPin className="w-5 h-5" />
                Emergency Hospital
              </Link>
              <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-[#EF4444] text-[#EF4444] font-bold hover:bg-[#EF4444] hover:text-white transition-all whitespace-nowrap">
                <Phone className="w-5 h-5" />
                Call Ambulance
              </button>
            </div>
          </div>
        </motion.div>

        {/* FLOATING AI ASSISTANT BUTTON */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, type: "spring" }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link to="/chat">
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2F80FF] to-[#22C7A9] flex items-center justify-center shadow-2xl cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 30px rgba(47, 128, 255, 0.4)",
                  "0 0 50px rgba(47, 128, 255, 0.6)",
                  "0 0 30px rgba(47, 128, 255, 0.4)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </Link>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.7 }}
            className="absolute right-20 bottom-4 px-4 py-2 rounded-2xl bg-[#0F172A] text-white text-sm font-medium whitespace-nowrap shadow-lg pointer-events-none"
          >
            Need help? Ask MedSense AI
            <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[#0F172A]"></div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
