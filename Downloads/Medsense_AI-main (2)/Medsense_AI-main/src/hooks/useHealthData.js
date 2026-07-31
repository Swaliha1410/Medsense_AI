import { useState, useEffect } from 'react'

const STORAGE_KEY = 'medsense_health_data'

const getDefaultData = () => ({
  waterGlasses: 0,
  waterGoal: 8,
  steps: 0,
  stepsGoal: 8000,
  sleepHours: 0,
  medicines: [
    { id: 1, name: 'Vitamin D', time: '8:00 AM', period: 'Morning', taken: false },
    { id: 2, name: 'Blood Pressure Med', time: '2:00 PM', period: 'Afternoon', taken: false },
    { id: 3, name: 'Calcium', time: '9:00 PM', period: 'Night', taken: false },
  ],
  lastWaterTime: null,
  streak: 0,
  lastStreakDate: null,
  badges: {
    hydrationMaster: false,
    medicineHero: false,
    walkingChampion: false,
    sleepExpert: false,
    healthyWeek: false,
  },
  lastResetDate: new Date().toDateString(),
})

export const useHealthData = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Reset daily data if it's a new day
      const today = new Date().toDateString()
      if (parsed.lastResetDate !== today) {
        return {
          ...parsed,
          waterGlasses: 0,
          steps: 0,
          medicines: parsed.medicines.map(m => ({ ...m, taken: false })),
          lastResetDate: today,
        }
      }
      return parsed
    }
    return getDefaultData()
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Water functions
  const addWater = () => {
    setData(prev => ({
      ...prev,
      waterGlasses: Math.min(prev.waterGlasses + 1, prev.waterGoal),
      lastWaterTime: new Date().toISOString(),
    }))
  }

  const removeWater = () => {
    setData(prev => ({
      ...prev,
      waterGlasses: Math.max(prev.waterGlasses - 1, 0),
    }))
  }

  // Medicine functions
  const toggleMedicine = (id) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.map(m =>
        m.id === id ? { ...m, taken: !m.taken } : m
      ),
    }))
  }

  // Steps functions
  const addSteps = (amount = 500) => {
    setData(prev => ({
      ...prev,
      steps: Math.min(prev.steps + amount, prev.stepsGoal * 2),
    }))
  }

  const resetSteps = () => {
    setData(prev => ({ ...prev, steps: 0 }))
  }

  // Sleep function
  const setSleep = (hours) => {
    setData(prev => ({ ...prev, sleepHours: Math.max(0, Math.min(24, hours)) }))
  }

  // Badge unlock
  const unlockBadge = (badgeName) => {
    setData(prev => ({
      ...prev,
      badges: { ...prev.badges, [badgeName]: true },
    }))
  }

  // Calculate health score
  const calculateHealthScore = () => {
    const waterScore = (data.waterGlasses / data.waterGoal) * 25
    const medicineScore = (data.medicines.filter(m => m.taken).length / data.medicines.length) * 25
    const stepsScore = (data.steps / data.stepsGoal) * 25
    const sleepScore = data.sleepHours >= 7 && data.sleepHours <= 9 ? 25 : 
                       data.sleepHours >= 6 && data.sleepHours <= 10 ? 15 : 10
    
    return Math.round(waterScore + medicineScore + stepsScore + sleepScore)
  }

  // Update streak
  const updateStreak = () => {
    const today = new Date().toDateString()
    const allMedicinesTaken = data.medicines.every(m => m.taken)
    const waterGoalMet = data.waterGlasses >= data.waterGoal
    const stepsGoalMet = data.steps >= data.stepsGoal

    if (allMedicinesTaken && waterGoalMet && stepsGoalMet) {
      if (data.lastStreakDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const newStreak = data.lastStreakDate === yesterday ? data.streak + 1 : 1
        
        setData(prev => ({
          ...prev,
          streak: newStreak,
          lastStreakDate: today,
        }))

        // Unlock weekly badge
        if (newStreak >= 7) {
          unlockBadge('healthyWeek')
        }
      }
    }
  }

  // Check and unlock badges
  useEffect(() => {
    if (data.waterGlasses >= data.waterGoal && !data.badges.hydrationMaster) {
      unlockBadge('hydrationMaster')
    }
    if (data.medicines.every(m => m.taken) && !data.badges.medicineHero) {
      unlockBadge('medicineHero')
    }
    if (data.steps >= data.stepsGoal && !data.badges.walkingChampion) {
      unlockBadge('walkingChampion')
    }
    if (data.sleepHours >= 7 && data.sleepHours <= 9 && !data.badges.sleepExpert) {
      unlockBadge('sleepExpert')
    }
    updateStreak()
  }, [data.waterGlasses, data.medicines, data.steps, data.sleepHours])

  return {
    data,
    addWater,
    removeWater,
    toggleMedicine,
    addSteps,
    resetSteps,
    setSleep,
    calculateHealthScore,
    unlockBadge,
  }
}
