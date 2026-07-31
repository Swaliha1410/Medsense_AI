import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Droplet, Pill, Activity, Moon, Heart, TrendingUp, 
  AlertCircle, Plus, Minus, Clock, ArrowUp, ArrowDown
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useHealthData } from '../hooks/useHealthData'

export default function DashboardFunctional() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const {
    data,
    addWater,
    removeWater,
    toggleMedicine,
    addSteps,
    setSleep,
    calculateHealthScore,
  } = useHealthData()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
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

  const healthScore = calculateHealthScore()
  
  const waterPercent = Math.round((data.waterGlasses / data.waterGoal) * 100)
  const stepsPercent = Math.round((data.steps / data.stepsGoal) * 100)
  const medicinePercent = Math.round((data.medicines.filter(m => m.taken).length / data.medicines.length) * 100)

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreStatus = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  if (!isLoggedIn) {
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
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="p-8 max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 mb-1">
              {getGreeting()}, {getUserName()}
            </h1>
            <p className="text-slate-500">Here is your health overview for today</p>
          </div>

          {/* Health Score Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Health Score Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Overall Health Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${getHealthScoreColor(healthScore)}`}>
                      {healthScore}
                    </span>
                    <span className="text-2xl text-slate-400">/100</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{getHealthScoreStatus(healthScore)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Droplet className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-slate-900">{waterPercent}%</p>
                  <p className="text-xs text-slate-500">Hydration</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Pill className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-slate-900">{medicinePercent}%</p>
                  <p className="text-xs text-slate-500">Medication</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Activity className="w-5 h-5 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-slate-900">{stepsPercent}%</p>
                  <p className="text-xs text-slate-500">Activity</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-slate-900">{data.sleepHours}h</p>
                  <p className="text-xs text-slate-500">Sleep</p>
                </div>
              </div>
            </div>

            {/* Daily Streak Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-sm text-white">
              <p className="text-sm font-medium text-blue-100 mb-2">Daily Streak</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">{data.streak}</span>
                <span className="text-xl text-blue-100">days</span>
              </div>
              <p className="text-sm text-blue-100">Keep going! You're doing great</p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-100">This week</span>
                  <span className="font-semibold">{Math.min(data.streak, 7)}/7 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Water Intake */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Droplet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Water Intake</h3>
                    <p className="text-sm text-slate-500">Daily hydration tracking</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{data.waterGlasses}</p>
                  <p className="text-xs text-slate-500">of {data.waterGoal} glasses</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500">0</span>
                  <span className="text-xs font-medium text-blue-600">{waterPercent}%</span>
                  <span className="text-xs text-slate-500">{data.waterGoal}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <button 
                  onClick={removeWater} 
                  disabled={data.waterGlasses === 0}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-slate-700 text-sm"
                >
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={addWater} 
                  disabled={data.waterGlasses >= data.waterGoal}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Activity</h3>
                    <p className="text-sm text-slate-500">Steps today</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{data.steps.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">of {data.stepsGoal.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${Math.min(stepsPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500">0</span>
                  <span className="text-xs font-medium text-green-600">{stepsPercent}%</span>
                  <span className="text-xs text-slate-500">{data.stepsGoal.toLocaleString()}</span>
                </div>
              </div>

              {/* Add Steps Button */}
              <button 
                onClick={() => addSteps(500)}
                className="w-full py-2.5 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium text-sm"
              >
                Add 500 Steps
              </button>
            </div>

          </div>

          {/* Medication & Sleep Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Medication Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Pill className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Medication Schedule</h3>
                    <p className="text-sm text-slate-500">
                      {data.medicines.filter(m => m.taken).length} of {data.medicines.length} taken
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-900">{medicinePercent}%</span>
              </div>

              {/* Medicine List */}
              <div className="space-y-3">
                {data.medicines.map(medicine => (
                  <button
                    key={medicine.id}
                    onClick={() => toggleMedicine(medicine.id)}
                    className={`w-full p-4 rounded-lg border transition-all ${
                      medicine.taken 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          medicine.taken 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'border-slate-300'
                        }`}>
                          {medicine.taken && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-medium ${medicine.taken ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {medicine.name}
                          </p>
                          <p className="text-xs text-slate-500">{medicine.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {medicine.time}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Tracking */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Sleep Duration</h3>
                    <p className="text-sm text-slate-500">Last night's sleep</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{data.sleepHours}h</p>
                  <p className="text-xs text-slate-500">
                    {data.sleepHours >= 7 && data.sleepHours <= 9 ? 'Optimal' : 
                     data.sleepHours < 7 ? 'Too short' : 'Too long'}
                  </p>
                </div>
              </div>

              {/* Sleep Quality Indicator */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Sleep Quality</span>
                  <span className={`text-xs font-semibold ${
                    data.sleepHours >= 7 && data.sleepHours <= 9 ? 'text-green-600' :
                    data.sleepHours >= 6 && data.sleepHours <= 10 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {data.sleepHours >= 7 && data.sleepHours <= 9 ? 'Excellent' :
                     data.sleepHours >= 6 && data.sleepHours <= 10 ? 'Good' :
                     'Poor'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Recommended: 7-9 hours per night
                </div>
              </div>

              {/* Sleep Duration Slider */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={data.sleepHours}
                  onChange={(e) => setSleep(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500">0h</span>
                  <span className="text-xs text-slate-500">6h</span>
                  <span className="text-xs text-slate-500">12h</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  )
}
