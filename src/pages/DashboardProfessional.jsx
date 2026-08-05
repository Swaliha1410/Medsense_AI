import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Droplet, Pill, Activity, Moon, Heart, TrendingUp, Brain,
  ChevronRight, Plus, Minus, CheckCircle, Clock, MapPin,
  MessageSquare, FileText, Calendar, Award, Bell
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useHealthData } from '../hooks/useHealthData'

export default function DashboardProfessional() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const {
    data,
    addWater,
    removeWater,
    toggleMedicine,
    addSteps,
    resetSteps,
    setSleep,
    calculateHealthScore,
  } = useHealthData()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const healthScore = calculateHealthScore()
  
  const getScoreLabel = () => {
    if (healthScore >= 80) return { label: 'Excellent', color: 'text-green-600' }
    if (healthScore >= 60) return { label: 'Good', color: 'text-blue-600' }
    return { label: 'Needs Attention', color: 'text-orange-600' }
  }

  const scoreStatus = getScoreLabel()
  const waterRemaining = data.waterGoal - data.waterGlasses
  const pendingMeds = data.medicines.filter(m => !m.taken)
  const stepsRemaining = data.stepsGoal - data.steps

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {getGreeting()}, <span className="text-blue-600">{getUserName()}!</span> 👋
              </h1>
              <p className="text-slate-600">Here's your health summary for today.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-semibold text-slate-900">{formatTime(currentTime)}</div>
                <div className="text-sm text-slate-500">{formatDate(currentTime)}</div>
              </div>
              <button className="relative p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border border-slate-200">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {getUserName()[0]?.toUpperCase()}
              </div>
            </div>
          </div>
