import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, MicOff, Plus, Bot, User, Loader2, Volume2, 
  Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreVertical,
  Settings, LogOut, Moon, Sun, Paperclip, Menu, X,
  Compass, Layout, Folder, Clock, MessageSquare, Search,
  Activity, FileText, MapPin, Pill
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { chat as chatApi, ai as aiApi } from '../services/api'

// ── Markdown renderer ─────────────────────────────────────────────────────────
// Converts the AI's plain-text markdown into React elements.
// Handles: **bold**, *italic*, bullet lists (•, -, *), numbered lists,
// `code`, section headers (###), and line breaks.
function renderMarkdown(text) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Bullet list item: starts with •, -, or *
    if (/^[\s]*[•\-\*]\s+/.test(line)) {
      const content = line.replace(/^[\s]*[•\-\*]\s+/, '')
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-[#0F6FFF] mt-0.5 flex-shrink-0">•</span>
          <span>{inlineMarkdown(content, key++)}</span>
        </div>
      )
      continue
    }

    // Numbered list item: starts with "1." "2." etc.
    if (/^[\s]*\d+\.\s+/.test(line)) {
      const num = line.match(/^[\s]*(\d+)\./)[1]
      const content = line.replace(/^[\s]*\d+\.\s+/, '')
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-[#0F6FFF] font-semibold flex-shrink-0">{num}.</span>
          <span>{inlineMarkdown(content, key++)}</span>
        </div>
      )
      continue
    }

    // Section header (### or ##)
    if (/^#{2,3}\s+/.test(line)) {
      const content = line.replace(/^#{2,3}\s+/, '')
      elements.push(
        <p key={key++} className="font-semibold text-[#0F172A] mt-3 mb-1">
          {inlineMarkdown(content, key++)}
        </p>
      )
      continue
    }

    // Feature route link lines (e.g. "→ Health Analysis page")
    if (/^→/.test(line.trim())) {
      elements.push(
        <p key={key++} className="text-[#0F6FFF] text-sm my-0.5">
          {inlineMarkdown(line, key++)}
        </p>
      )
      continue
    }

    // Normal paragraph line
    elements.push(
      <p key={key++} className="my-0.5 leading-relaxed">
        {inlineMarkdown(line, key++)}
      </p>
    )
  }

  return <div className="space-y-0">{elements}</div>
}

// Process inline markdown: **bold**, *italic*, `code`
function inlineMarkdown(text, baseKey = 0) {
  const parts = []
  // Combined regex: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let match
  let k = baseKey * 100

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > last) {
      parts.push(<span key={k++}>{text.slice(last, match.index)}</span>)
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={k++} className="font-semibold text-[#0F172A]">{match[2]}</strong>)
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={k++}>{match[3]}</em>)
    } else if (match[4]) {
      // `code`
      parts.push(<code key={k++} className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-xs font-mono text-[#0F6FFF]">{match[4]}</code>)
    }
    last = match.index + match[0].length
  }

  // Remaining text
  if (last < text.length) {
    parts.push(<span key={k++}>{text.slice(last)}</span>)
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

// Feature routing chip — shown when AI suggests a page
function FeatureChip({ icon: Icon, label, route, onClick }) {
  return (
    <button
      onClick={() => onClick(route)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#0F6FFF]/20 text-[#0F6FFF] rounded-full text-xs font-medium transition-colors mt-2"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

const SUGGESTIONS = [
  { text: 'Check Symptoms' },
  { text: 'Analyze Medical Report' },
  { text: 'Find Nearby Hospital' },
  { text: 'Voice Consultation' },
]

const SIDEBAR_SECTIONS = [
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'templates', label: 'Templates', icon: 'layout' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'history', label: 'History', icon: 'clock' },
]

const RECENT_CHATS = [
  { id: 1, title: 'Headache symptoms', time: '2h ago' },
  { id: 2, title: 'Hospital finder', time: '5h ago' },
  { id: 3, title: 'Blood pressure advice', time: '1d ago' },
]

export default function Chat() {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState('history')
  const [hoveredMessage, setHoveredMessage] = useState(null)
  
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)

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
              setMessages(history)
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      // Build compact history (last 6 messages) for context
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Call real AI engine
      const data = await aiApi.chat({ message: content, history })
      const aiResponse = data.response || 'I could not generate a response. Please try again.'

      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: aiResponse }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      // Fallback: show error message in chat
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          'Sorry, I had trouble connecting to the AI server. Please make sure the Django backend is running on http://localhost:8000.',
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const newChat = () => {
    setMessages([])
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion.text)
  }

  const getSectionIcon = (iconName) => {
    const icons = {
      compass: Compass,
      layout: Layout,
      folder: Folder,
      clock: Clock,
    }
    const IconComponent = icons[iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null
  }

  const renderSidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <Logo className="w-7 h-7" />
          <span className="font-semibold text-[#0F172A] text-base">MedSense</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X className="w-5 h-5 text-[#64748B]" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pt-3 pb-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            newChat()
            setSidebarOpen(false)
          }}
          className="w-full flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Sidebar Sections */}
      <div className="px-3 py-2 space-y-1">
        {SIDEBAR_SECTIONS.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              activeSection === section.id
                ? 'bg-[#F8FAFC] text-[#0F172A]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
            }`}
          >
            {getSectionIcon(section.icon)}
            <span>{section.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-[#E2E8F0]" />

      {/* Today Label */}
      <div className="px-3 py-2">
        <p className="px-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
          Today
        </p>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {RECENT_CHATS.map((chat) => (
          <motion.button
            key={chat.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSidebarOpen(false)}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-all text-left relative"
          >
            <MessageSquare className="w-4 h-4 text-[#64748B] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#0F172A] truncate">{chat.title}</p>
            </div>
            <MoreVertical className="w-4 h-4 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Give me some ideas */}
      <div className="px-3 py-3 border-t border-[#E2E8F0]">
        <button className="w-full text-left px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors">
          Give me some ideas
        </button>
      </div>

      {/* User Profile Footer */}
      <div className="px-3 py-3 border-t border-[#E2E8F0]">
        {isLoggedIn ? (
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#F8FAFC] rounded-lg cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#0F172A] truncate font-medium">
                {user?.username || 'User'}
              </p>
            </div>
            <Settings className="w-4 h-4 text-[#64748B] flex-shrink-0" />
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              navigate('/auth')
              setSidebarOpen(false)
            }}
            className="w-full py-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-lg text-sm font-medium"
          >
            Sign In
          </motion.button>
        )}
      </div>
    </>
  )

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E2E8F0] flex-shrink-0">
        {renderSidebarContent()}
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E2E8F0]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-6 h-6 text-[#0F172A]" />
          </button>
          <Logo className="w-8 h-8" />
          <div className="w-6" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Welcome State or Messages */}
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center px-4 pb-20"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Logo className="w-20 h-20 mb-6" />
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl font-normal text-[#0F172A] mb-8 text-center"
              >
                What can I help with?
              </motion.h1>

              {/* Centered Input Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full max-w-3xl"
              >
                {/* White Glass Card Input */}
                <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-5">
                  {/* Input Field */}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Ask anything about your health..."
                    rows={1}
                    className="w-full bg-transparent outline-none text-[#0F172A] placeholder:text-[#94A3B8] resize-none text-[15px] mb-4"
                    style={{ minHeight: '40px', maxHeight: '200px' }}
                  />

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    {/* Left Side Buttons */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
                        title="Attach Report"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="hidden sm:inline">Attach Report</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleListening}
                        className={`flex items-center gap-2 transition-colors text-sm ${
                          listening
                            ? 'text-red-500'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                        title="Voice"
                      >
                        <Mic className="w-4 h-4" />
                        <span className="hidden sm:inline">Voice</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
                        title="Language"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span className="hidden sm:inline">Language</span>
                      </motion.button>
                    </div>

                    {/* Right Side Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="px-6 py-2 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] hover:from-[#FF7B32] hover:to-[#FF5A25] text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md"
                    >
                      Submit
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Suggestion Chips - Below Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-2 max-w-3xl mt-6"
              >
                {SUGGESTIONS.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#0F6FFF] hover:bg-[#F8FAFC] rounded-lg transition-all text-sm text-[#0F172A] shadow-sm"
                  >
                    {suggestion.text}
                  </motion.button>
                ))}
              </motion.div>

              {/* Subtle Background Pattern */}
              <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1" fill="#0F6FFF" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </motion.div>
          ) : (
            // Messages View
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
              {loadingHistory && (
                <div className="text-center text-sm text-[#64748B] py-2">Loading history…</div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredMessage(msg.id)}
                    onHoverEnd={() => setHoveredMessage(null)}
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center">
                          <Logo className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center text-white text-sm font-semibold">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`inline-block max-w-full px-4 py-3 rounded-3xl text-[15px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0F6FFF] text-white'
                          : 'bg-white border border-[#E2E8F0] text-[#0F172A]'
                      }`}>
                        {msg.role === 'assistant'
                          ? renderMarkdown(msg.content)
                          : msg.content
                        }
                      </div>

                      {/* Feature routing chips — shown when AI mentions a page */}
                      {msg.role === 'assistant' && (() => {
                        const c = msg.content || ''
                        const chips = []
                        if (/health analysis|analyze.*symptom|symptom.*check/i.test(c))
                          chips.push({ icon: Activity, label: 'Health Analysis', route: '/health-analysis' })
                        if (/medical report|upload.*report|report.*analysis/i.test(c))
                          chips.push({ icon: FileText, label: 'Medical Reports', route: '/reports' })
                        if (/hospital finder|find.*hospital|nearby.*hospital|nearby.*clinic/i.test(c))
                          chips.push({ icon: MapPin, label: 'Hospital Finder', route: '/hospitals' })
                        if (/medicine reminder|set.*reminder|manage.*medicine/i.test(c))
                          chips.push({ icon: Pill, label: 'Medicine Reminders', route: '/medicines' })
                        return chips.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {chips.map((chip, ci) => (
                              <FeatureChip key={ci} {...chip} onClick={(r) => navigate(r)} />
                            ))}
                          </div>
                        ) : null
                      })()}

                      {/* Message Actions (on hover) */}
                      {msg.role === 'assistant' && hoveredMessage === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 mt-2"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(msg.content)}
                            className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => speakText(msg.content)}
                            className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                            title="Speak"
                          >
                            <Volume2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                            title="Like"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                            title="Dislike"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center">
                    <Logo className="w-5 h-5" />
                  </div>
                  <div className="bg-white border border-[#E2E8F0] px-4 py-3 rounded-3xl">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0F6FFF]" />
                  </div>
                </motion.div>
              )}
              
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Area - Only show when there are messages */}
        {messages.length > 0 && (
          <div className="border-t border-[#E2E8F0] bg-white px-4 py-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative"
              >
                {/* White Glass Card Input */}
                <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-5">
                  {/* Input Field */}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Ask anything about your health..."
                    rows={1}
                    className="w-full bg-transparent outline-none text-[#0F172A] placeholder:text-[#94A3B8] resize-none text-[15px] mb-4"
                    style={{ minHeight: '40px', maxHeight: '200px' }}
                  />

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    {/* Left Side Buttons */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
                        title="Attach Report"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="hidden sm:inline">Attach Report</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleListening}
                        className={`flex items-center gap-2 transition-colors text-sm ${
                          listening
                            ? 'text-red-500'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                        title="Voice"
                      >
                        <Mic className="w-4 h-4" />
                        <span className="hidden sm:inline">Voice</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
                        title="Language"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span className="hidden sm:inline">Language</span>
                      </motion.button>
                    </div>

                    {/* Right Side Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="px-6 py-2 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] hover:from-[#FF7B32] hover:to-[#FF5A25] text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md"
                    >
                      Submit
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Disclaimer */}
              <p className="text-center text-xs text-[#94A3B8] mt-3">
                MedSense can make mistakes. Check important info.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// AI responses are now powered by the MedSense AI engine via /api/ai/chat/
