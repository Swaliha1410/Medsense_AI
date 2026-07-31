import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, MicOff, Plus, Bot, User, Loader2, Volume2, 
  Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreVertical,
  Settings, LogOut, Moon, Sun, Paperclip, Menu, X,
  Compass, Layout, Folder, Clock, MessageSquare, Search
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { chat as chatApi } from '../services/api'

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
                        {msg.content}
                      </div>

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

// Simple rule-based AI responses (replace with real API integration)
function generateAIResponse(input) {
  const lower = input.toLowerCase()
  
  if (lower.includes('check symptoms') || lower.includes('symptoms'))
    return "I can help you check your symptoms. Please describe what you're experiencing, including when symptoms started, their severity, and any other relevant details."
  
  if (lower.includes('medical report') || lower.includes('analyze'))
    return "I can help analyze medical reports. Please share the details or upload the document, and I'll provide insights based on the information provided."
  
  if (lower.includes('headache') || lower.includes('fever'))
    return "Headache and fever can have many causes including viral infections, flu, or dehydration. Rest, stay hydrated, and take paracetamol if needed. If fever exceeds 39°C or persists more than 3 days, please see a doctor."
  
  if (lower.includes('hospital') || lower.includes('find nearby'))
    return "I can help you find nearby hospitals. You can visit our Hospital Finder page for a full map view, or tell me your location and the type of care you need."
  
  if (lower.includes('voice consultation'))
    return "Voice consultation is available! You can use the microphone button to speak your health concerns, and I'll provide guidance based on what you share."
  
  if (lower.includes('health tips') || lower.includes('tip'))
    return "Here are some daily health tips: Stay hydrated (8 glasses of water), exercise 30 minutes daily, eat balanced meals with fruits and vegetables, get 7-8 hours of sleep, and manage stress through meditation or hobbies."
  
  if (lower.includes('diabetes'))
    return "Common symptoms of diabetes include frequent urination, excessive thirst, unexplained weight loss, fatigue, and blurry vision. If you're experiencing these, please consult a healthcare provider for proper testing."
  
  if (lower.includes('blood pressure') || lower.includes('hypertension'))
    return "To manage high blood pressure: reduce salt intake, exercise regularly (30 min/day), limit alcohol, quit smoking, manage stress, and take prescribed medication. Regular monitoring is essential."
  
  if (lower.includes('medicine') || lower.includes('reminder'))
    return "I can help set up medicine reminders! Head to your Dashboard to add reminders with dosage times, and I'll keep track for you."
  
  if (lower.includes('hello') || lower.includes('hi'))
    return "Hello! I'm MedSense AI, your healthcare companion. I'm here to help with health questions, symptom checking, and finding nearby hospitals. What can I help you with today?"
  
  return "Thank you for sharing that. Based on what you've described, I'd recommend consulting with a healthcare professional for an accurate assessment. I can help you find nearby hospitals or clinics if needed. Is there anything else you'd like to know?"
}
