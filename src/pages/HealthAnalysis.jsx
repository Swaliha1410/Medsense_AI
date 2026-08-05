import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Mic, Loader, AlertTriangle, CheckCircle,
  Clock, TrendingUp, MapPin, MessageSquare, ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { ai as aiApi } from '../services/api'

export default function HealthAnalysis() {
  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('today')
  const [severity, setSeverity] = useState('mild')
  const [age, setAge] = useState('')
  const [conditions, setConditions] = useState('')
  const [allergies, setAllergies] = useState('')
  const [medications, setMedications] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser')
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }

    recognition.start()
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()

    if (!symptoms.trim()) {
      alert('Please describe your symptoms')
      return
    }

    setAnalyzing(true)
    setError('')

    try {
      const data = await aiApi.analyzeSymptoms({
        symptoms,
        age,
        severity,
        duration,
        existing_conditions: conditions,
        medications,
        allergies,
      })

      // Map AI engine response to the shape the result UI expects
      setResult({
        concerns:           data.concerns || [],
        identifiedSymptoms: data.identified_symptoms || [],
        guidance:           data.guidance || '',
        recommendations:    data.recommendations || [],
        warningSigns:       data.warning_signs || [],
        seekCare:           data.seek_care || '',
        treatments:         data.treatments || [],
        severityLevel:      data.severity_level || severity,
        topMatch:           data.top_match || null,
        disclaimer:         data.disclaimer || '',
      })
    } catch (err) {
      setError(
        'Could not connect to the AI server. Make sure the Django backend is running on http://localhost:8000.'
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const handleNewAnalysis = () => {
    setResult(null)
    setError('')
    setSymptoms('')
    setDuration('today')
    setSeverity('mild')
    setAge('')
    setConditions('')
    setAllergies('')
    setMedications('')
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Health Analysis
          </h1>
          <p className="text-[#64748B]">
            Describe your symptoms and get AI-powered health insights and possible next steps
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            /* Analysis Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden"
            >
              <form onSubmit={handleAnalyze} className="p-8">
                {/* Main Symptom Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                    What symptoms are you experiencing?
                  </label>
                  <div className="relative">
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe your symptoms in detail..."
                      rows={5}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30 focus:border-[#0F6FFF] resize-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isListening
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#0F6FFF] hover:text-white'
                      }`}
                      title="Voice input"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#64748B] mt-2">
                    Click the microphone icon to use voice input
                  </p>
                </div>

                {/* Duration & Severity */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                      Duration
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['today', 'few_days', 'weeks', 'more'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setDuration(option)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            duration === option
                              ? 'bg-[#0F6FFF] text-white'
                              : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0F9FF]'
                          }`}
                        >
                          {option === 'today'
                            ? 'Today'
                            : option === 'few_days'
                            ? 'Few Days'
                            : option === 'weeks'
                            ? 'Weeks'
                            : 'More'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                      Severity
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['mild', 'moderate', 'severe'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSeverity(level)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            severity === level
                              ? level === 'severe'
                                ? 'bg-[#EF4444] text-white'
                                : level === 'moderate'
                                ? 'bg-[#F59E0B] text-white'
                                : 'bg-[#22C55E] text-white'
                              : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0F9FF]'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#0F172A] mb-3">
                    Optional Information (helps improve analysis)
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                    />
                    <input
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="Existing conditions"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                    />
                    <input
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Allergies"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                    />
                    <input
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="Current medications"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white py-4 rounded-xl font-semibold text-base hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing Your Symptoms...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      Analyze My Symptoms
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* Analysis Results */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Possible Health Concerns */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-[#0F6FFF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                      Possible Health Concerns
                    </h3>
                    <p className="text-sm text-[#64748B] mb-4">
                      These are potential causes based on your symptoms. This is not a confirmed diagnosis.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.concerns.map((concern, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-[#F0F9FF] text-[#0F6FFF] rounded-xl text-sm font-medium"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms Identified */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#0F6FFF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                      Symptoms Identified
                    </h3>
                    <ul className="space-y-2">
                      {result.identifiedSymptoms.map((symptom, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-[#0F172A]"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF]" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* General Guidance */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                  General Guidance
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {result.guidance}
                </p>
                {result.topMatch && result.topMatch.disease && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#EFF6FF] text-[#1D4ED8] rounded-full text-xs font-medium">
                      Top match: {result.topMatch.disease}
                    </span>
                    {result.topMatch.icd_code && (
                      <span className="px-3 py-1 bg-[#F0FDF4] text-[#15803D] rounded-full text-xs font-medium">
                        ICD: {result.topMatch.icd_code}
                      </span>
                    )}
                    {result.topMatch.category && (
                      <span className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-medium">
                        {result.topMatch.category}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Treatment Information */}
              {result.treatments && result.treatments.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                    Treatment Information
                  </h3>
                  <div className="space-y-5">
                    {result.treatments.slice(0, 2).map((tx, i) => (
                      <div key={i} className="border border-[#E2E8F0] rounded-xl p-4">
                        <h4 className="font-semibold text-[#0F172A] mb-3">{tx.disease}</h4>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          {tx.first_line && (
                            <div>
                              <span className="font-medium text-[#0F6FFF]">First-line: </span>
                              <span className="text-[#475569]">{tx.first_line}</span>
                            </div>
                          )}
                          {tx.specialist && (
                            <div>
                              <span className="font-medium text-[#0F6FFF]">See: </span>
                              <span className="text-[#475569]">{tx.specialist}</span>
                            </div>
                          )}
                          {tx.home_remedies && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-[#22C55E]">Home remedies: </span>
                              <span className="text-[#475569]">{tx.home_remedies}</span>
                            </div>
                          )}
                          {tx.lifestyle && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-[#F59E0B]">Lifestyle: </span>
                              <span className="text-[#475569]">{tx.lifestyle}</span>
                            </div>
                          )}
                          {tx.prognosis && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-[#64748B]">Outlook: </span>
                              <span className="text-[#475569]">{tx.prognosis}</span>
                            </div>
                          )}
                          {tx.duration && (
                            <div>
                              <span className="font-medium text-[#64748B]">Duration: </span>
                              <span className="text-[#475569]">{tx.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-[#94A3B8]">
                    ⚠️ Do not self-medicate based on this information. Consult a doctor before starting any treatment.
                  </p>
                </div>
              )}

              {/* Recommended Next Steps */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                      Recommended Next Steps
                    </h3>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-[#0F172A]">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Warning Signs */}
              <div className="bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] rounded-2xl p-6 border border-[#EF4444]/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444] flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                      Warning Signs
                    </h3>
                    <ul className="space-y-2">
                      {result.warningSigns.map((sign, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="text-sm text-[#0F172A]">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* When to Seek Medical Care */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]">
                <div className="flex items-start gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#64748B] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                      When to Seek Medical Care
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {result.seekCare}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Disclaimer */}
              <div className="bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#0F172A] mb-2">
                      Medical Disclaimer
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {result.disclaimer ||
                        'This AI-generated analysis is for informational purposes only and is not a medical diagnosis. Always seek the advice of your physician or other qualified health provider.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  to="/hospitals"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  <MapPin className="w-5 h-5" />
                  Find Nearby Care
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#0F6FFF] text-[#0F6FFF] px-6 py-4 rounded-xl font-semibold hover:bg-[#F0F9FF] transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Talk to MedSense
                </Link>
              </div>

              {/* New Analysis Button */}
              <button
                onClick={handleNewAnalysis}
                className="w-full bg-[#F8FAFC] text-[#64748B] px-6 py-3 rounded-xl font-medium hover:bg-[#F0F9FF] hover:text-[#0F6FFF] transition-colors"
              >
                Analyze New Symptoms
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
