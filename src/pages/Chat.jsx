import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Plus, Trash2, Bot, User, Loader2, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { chat as chatApi } from '../services/api'

const SUGGESTIONS = [
  'I have a headache and fever',
  'What are symptoms of diabetes?',
  'Find a hospital near me',
  'How to manage high blood pressure?',
  'I need a medicine reminder',
]

export default function Chat() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm MedSense AI, your personal healthcare companion. How can I help you today? You can ask me about symptoms, medications, or finding nearby hospitals.",
    },
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [listening, setListening] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  // Load chat history from backend if logged in
  useEffect(() => {
    if (isLoggedIn) {
      setLoadingHistory(true)
      chatApi.list()
        .then((data) => {
          if (data?.results?.length || data?.length) {
            const history = (data.results || data).map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))
            if (history.length > 0) {
              setMessages([messages[0], ...history])
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false))
    }
  }, [isLoggedIn])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    window.speechSynthesis.speak(utt)
  }

  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    // Save user message to backend
    if (isLoggedIn) {
      chatApi.send({ role: 'user', content }).catch(() => {})
    }

    // Simulate AI response (replace with real AI API call later)
    setTimeout(async () => {
      const aiResponse = generateAIResponse(content)
      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: aiResponse }
      setMessages((prev) => [...prev, assistantMsg])
      setLoading(false)

      if (isLoggedIn) {
        chatApi.send({ role: 'assistant', content: aiResponse }).catch(() => {})
      }
    }, 1200)
  }

  const clearChat = () => {
    setMessages([messages[0]])
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-20 max-w-5xl mx-auto w-full px-4 py-6 gap-6">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 gap-3">
          <div className="glassmorphism rounded-2xl p-4">
            <h3 className="font-bold text-text mb-3 text-sm uppercase tracking-wide">Quick Prompts</h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-sm px-3 py-2 rounded-xl text-text/70 hover:bg-[#0F6FFF]/10 hover:text-[#0F6FFF] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear conversation
          </button>
          {!isLoggedIn && (
            <div className="glassmorphism rounded-2xl p-4 text-sm text-text/60">
              <p className="mb-2">💡 <strong>Log in</strong> to save your chat history.</p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-xs font-semibold"
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </aside>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col glassmorphism rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-text">MedSense AI</h2>
              <p className="text-xs text-[#14C8A8]">● Online — Healthcare Assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {loadingHistory && (
              <div className="text-center text-sm text-text/40 py-2">Loading history…</div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8]'
                      : 'bg-gray-200'
                  }`}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-4 h-4 text-white" />
                      : <User className="w-4 h-4 text-gray-600" />
                    }
                  </div>
                  <div className={`group max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] text-white rounded-tr-sm'
                      : 'bg-white shadow-sm text-text rounded-tl-sm'
                  }`}>
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="ml-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3 inline" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0F6FFF]" />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/30">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm px-4 py-2">
              <button
                onClick={() => navigate('/chat')}
                className="text-text/40 hover:text-[#0F6FFF] transition-colors"
                title="New chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about symptoms, medications, hospitals…"
                className="flex-1 text-sm outline-none text-text bg-transparent py-2"
              />
              <button
                onClick={toggleListening}
                className={`transition-colors ${listening ? 'text-red-500 animate-pulse' : 'text-text/40 hover:text-[#0F6FFF]'}`}
                title={listening ? 'Stop listening' : 'Voice input'}
              >
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-xs text-text/30 mt-2">
              MedSense AI provides general health info, not medical diagnoses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple rule-based AI responses (replace with real API integration)
function generateAIResponse(input) {
  const lower = input.toLowerCase()
  if (lower.includes('headache') || lower.includes('fever'))
    return "Headache and fever can have many causes including viral infections, flu, or dehydration. Rest, stay hydrated, and take paracetamol if needed. If fever exceeds 39°C or persists more than 3 days, please see a doctor. Would you like me to find nearby hospitals?"
  if (lower.includes('hospital'))
    return "I can help you find nearby hospitals! Head over to our Hospital Finder page for a full map view. I can also recommend based on your symptoms — what condition do you need treatment for?"
  if (lower.includes('diabetes'))
    return "Common symptoms of diabetes include frequent urination, excessive thirst, unexplained weight loss, fatigue, and blurry vision. If you're experiencing these, please consult a healthcare provider for proper testing."
  if (lower.includes('blood pressure') || lower.includes('hypertension'))
    return "To manage high blood pressure: reduce salt intake, exercise regularly (30 min/day), limit alcohol, quit smoking, manage stress, and take prescribed medication. Regular monitoring is key."
  if (lower.includes('medicine') || lower.includes('reminder'))
    return "I can help set up medicine reminders! Head to your Dashboard to add reminders with dosage times and I'll keep track for you."
  if (lower.includes('hello') || lower.includes('hi'))
    return "Hello! I'm MedSense AI. I'm here to help with health questions, symptom checking, and finding nearby hospitals. What can I help you with today?"
  return "Thank you for sharing that. Based on what you've described, I'd recommend consulting with a healthcare professional for an accurate assessment. I can help you find nearby hospitals or clinics if needed. Is there more you'd like to know?"
}
