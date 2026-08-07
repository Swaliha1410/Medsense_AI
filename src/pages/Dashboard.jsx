import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Activity, FileText, Pill, MapPin,
  Heart, Clock, AlertCircle, ArrowRight, Sparkles,
  Droplet, Moon, TrendingUp, Flame, Send, Mic,
  Award, CheckCircle, XCircle, TrendingDown, Brain,
  Stethoscope, Phone, Navigation, Zap, Target
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { healthScore, medicines, reports, chat, profile, ai as aiApi } from '../services/api'
import AIAvatar from '../components/dashboard/AIAvatar'
import AnimatedBackground from '../components/dashboard/AnimatedBackground'
import FloatingHealthWidget from '../components/dashboard/FloatingHealthWidget'
import HealthScoreCircle from '../components/dashboard/HealthScoreCircle'
import TimelineItem from '../components/dashboard/TimelineItem'
import AchievementBadge from '../components/dashboard/AchievementBadge'

export default function Dashboard() {
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
  const [aiAccuracy, setAiAccuracy] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }

    // Fetch all dashboard data
    Promise.all([
      healthScore.latest().catch(() => null),
      medicines.list('pending').catch(() => []),
      reports.list().catch(() => []),
      chat.list().catch(() => []),
      profile.get().catch(() => null),
      aiApi.getAccuracy().catch(() => null),
    ]).then(([scoreData, medsData, reportsData, chatData, profileData, accuracyData]) => {
      setScore(scoreData)
      setPendingMeds((medsData?.results || medsData || []).slice(0, 3))
      setRecentReports((reportsData?.results || reportsData || []).slice(0, 3))
      setRecentChats((chatData?.results || chatData || []).filter(m => m.role === 'user').slice(0, 3))
      setUserProfile(profileData)
      setAiAccuracy(accuracyData)
      setLoading(false)
    })
  }, [isLoggedIn, navigate])

  const getUserName = () => {
    if (user?.first_name) {
      return user.first_name
    }
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
    { time: '8 AM', label: 'Morning Medicine', status: 'completed', icon: CheckCircle },
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
          <div className="w-8 h-8 border-4 border-[#0F6FFF]/30 border-t-[#0F6FFF] rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Welcome back, {getUserName()}
          </h1>
          <p className="text-[#64748B]">How can MedSense help you today?</p>
        </motion.div>

        {/* Main AI Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] rounded-2xl p-8 mb-8 text-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-2xl font-bold">MedSense AI</h2>
              </div>
              <p className="text-white/90 mb-6 max-w-xl">
                How can I help you today?
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 bg-white text-[#0F6FFF] px-6 py-3 rounded-xl font-semibold hover:bg-white/95 transition-colors"
              >
                Start a Conversation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <MessageSquare className="w-20 h-20 opacity-20" />
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#0F6FFF]/30 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-base font-semibold text-[#0F172A] mb-2">
                  {action.title}
                </h4>
                <p className="text-sm text-[#64748B]">{action.description}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Health Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#0F172A]">Health Snapshot</h3>
              <Link
                to="/health-profile"
                className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                View Profile
              </Link>
            </div>

            {userProfile ? (
              <div className="space-y-4">
                {userProfile.blood_group && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0]">
                    <span className="text-sm text-[#64748B]">Blood Group</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {userProfile.blood_group}
                    </span>
                  </div>
                )}
                {userProfile.allergies && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0]">
                    <span className="text-sm text-[#64748B]">Allergies</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {userProfile.allergies}
                    </span>
                  </div>
                )}
                {pendingMeds.length > 0 && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0]">
                    <span className="text-sm text-[#64748B]">Active Medicines</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {pendingMeds.length}
                    </span>
                  </div>
                )}
                {score && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-[#64748B]">Health Score</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {score.score}/100
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-[#E2E8F0] mb-3" />
                <p className="text-sm text-[#64748B] mb-4">
                  No health data available
                </p>
                <Link
                  to="/health-profile"
                  className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
                >
                  Complete Your Profile
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#0F172A]">Recent Conversations</h3>
              <Link
                to="/chat-history"
                className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                View All
              </Link>
            </div>

            {recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.map((msg, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
                    onClick={() => navigate('/chat')}
                  >
                    <MessageSquare className="w-5 h-5 text-[#0F6FFF] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0F172A] line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-[#E2E8F0] mb-3" />
                <p className="text-sm text-[#64748B] mb-4">
                  No conversations yet
                </p>
                <Link
                  to="/chat"
                  className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
                >
                  Start Chatting
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#0F172A]">Recent Reports</h3>
              <Link
                to="/reports"
                className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                View All
              </Link>
            </div>

            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
                    onClick={() => navigate('/reports')}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-[#0F6FFF] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {report.title}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {new Date(report.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-[#E2E8F0] mb-3" />
                <p className="text-sm text-[#64748B] mb-4">
                  No reports uploaded
                </p>
                <Link
                  to="/reports"
                  className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
                >
                  Upload Report
                </Link>
              </div>
            )}
          </motion.div>

          {/* Nearby Hospitals Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#0F172A]">Nearby Hospitals</h3>
              <Link
                to="/hospitals"
                className="text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                View Map
              </Link>
            </div>

            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-[#0F6FFF] mb-3" />
              <p className="text-sm text-[#64748B] mb-4">
                Find healthcare facilities near you
              </p>
              <Link
                to="/hospitals"
                className="inline-flex items-center gap-2 text-sm text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                Open Hospital Finder
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* AI Model Accuracy Widget */}
        {aiAccuracy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mb-8 bg-white rounded-2xl p-6 border border-[#E2E8F0]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">AI Model Performance</h3>
                  <p className="text-xs text-[#64748B]">Live metrics from the MedSense AI engine</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#F0FDF4] text-[#22C55E] rounded-full text-xs font-semibold">Live</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Overall Accuracy',
                  value: aiAccuracy.overall_accuracy != null
                    ? `${Math.round(aiAccuracy.overall_accuracy * 100)}%`
                    : '—',
                  color: 'text-[#0F6FFF]',
                  bg: 'bg-[#F0F9FF]',
                },
                {
                  label: 'Top-3 Symptom Match',
                  value: aiAccuracy.symptom_top3_accuracy != null
                    ? `${Math.round(aiAccuracy.symptom_top3_accuracy * 100)}%`
                    : '—',
                  color: 'text-[#14C8A8]',
                  bg: 'bg-[#F0FDFA]',
                },
                {
                  label: 'Diseases Covered',
                  value: aiAccuracy.diseases_covered ?? '—',
                  color: 'text-[#8B5CF6]',
                  bg: 'bg-[#F5F3FF]',
                },
                {
                  label: 'Symptoms Indexed',
                  value: aiAccuracy.symptoms_indexed ?? '—',
                  color: 'text-[#F59E0B]',
                  bg: 'bg-[#FFFBEB]',
                },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-xs text-[#64748B] leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Health Insight + Emergency CTA */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Health Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-2xl p-6 border border-[#0F6FFF]/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0F6FFF] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                  Health Insight
                </h3>
                <p className="text-sm text-[#64748B]">
                  {score
                    ? `Your health score is ${score.score}/100. ${
                        score.score >= 80
                          ? 'Great job maintaining your health!'
                          : score.score >= 60
                          ? 'Consider scheduling a health check-up.'
                          : 'We recommend consulting with a healthcare professional.'
                      }`
                    : 'Complete your health profile to get personalized insights.'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#0F6FFF]/10">
              <p className="text-xs text-[#64748B] italic">
                This information is for informational purposes only and is not a medical diagnosis.
                Always consult a healthcare professional for medical advice.
              </p>
            </div>
          </motion.div>

          {/* Emergency CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] rounded-2xl p-6 border border-[#EF4444]/20"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                  Need urgent medical care?
                </h3>
                <p className="text-sm text-[#64748B] mb-4">
                  Find emergency care facilities near you immediately.
                </p>
                <Link
                  to="/hospitals?filter=emergency"
                  className="inline-flex items-center gap-2 bg-[#EF4444] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#DC2626] transition-colors text-sm"
                >
                  Find Emergency Care
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
