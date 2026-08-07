import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Mic, Plus, Bot, User, Loader2, Volume2,
  Copy, ThumbsUp, ThumbsDown, RotateCcw,
  Settings, Moon, Sun, Paperclip, Menu, X,
  Clock, MessageSquare, Trash2, Globe, Check,
  Activity, FileText, MapPin, Pill
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { chat as chatApi, ai as aiApi, reports as reportsApi } from '../services/api'

// Languages mirrored from Settings (must stay in sync with LanguageContext.jsx)
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Hindi', 'Mandarin', 'Portuguese']

// ── Tiny UUID generator (no external dep) ─────────────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// ── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '') { elements.push(<div key={key++} className="h-2" />); continue }
    if (/^[\s]*[•\-\*]\s+/.test(line)) {
      const content = line.replace(/^[\s]*[•\-\*]\s+/, '')
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-[#0F6FFF] mt-0.5 flex-shrink-0">•</span>
          <span>{inlineMarkdown(content, key++)}</span>
        </div>
      ); continue
    }
    if (/^[\s]*\d+\.\s+/.test(line)) {
      const num = line.match(/^[\s]*(\d+)\./)[1]
      const content = line.replace(/^[\s]*\d+\.\s+/, '')
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-[#0F6FFF] font-semibold flex-shrink-0">{num}.</span>
          <span>{inlineMarkdown(content, key++)}</span>
        </div>
      ); continue
    }
    if (/^#{2,3}\s+/.test(line)) {
      const content = line.replace(/^#{2,3}\s+/, '')
      elements.push(<p key={key++} className="font-semibold text-[#0F172A] mt-3 mb-1">{inlineMarkdown(content, key++)}</p>)
      continue
    }
    if (/^→/.test(line.trim())) {
      elements.push(<p key={key++} className="text-[#0F6FFF] text-sm my-0.5">{inlineMarkdown(line, key++)}</p>)
      continue
    }
    elements.push(<p key={key++} className="my-0.5 leading-relaxed">{inlineMarkdown(line, key++)}</p>)
  }
  return <div className="space-y-0">{elements}</div>
}

function inlineMarkdown(text, baseKey = 0) {
  const parts = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0, match, k = baseKey * 100
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>)
    if (match[2]) parts.push(<strong key={k++} className="font-semibold text-[#0F172A]">{match[2]}</strong>)
    else if (match[3]) parts.push(<em key={k++}>{match[3]}</em>)
    else if (match[4]) parts.push(<code key={k++} className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-xs font-mono text-[#0F6FFF]">{match[4]}</code>)
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>)
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

// ── Feature routing chip ──────────────────────────────────────────────────────
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

export default function Chat() {
  const { isLoggedIn, user, logout } = useAuth()
  const { language, changeLanguage }  = useLanguage()
  const navigate = useNavigate()

  // ── State ───────────────────────────────────────────────────────────────────
  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [listening, setListening]       = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [hoveredMessage, setHoveredMessage] = useState(null)

  // Session management
  const [currentSessionId, setCurrentSessionId] = useState(() => uuid())
  const [sessions, setSessions]         = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [loadingSession, setLoadingSession]   = useState(false)
  const [hoveredSession, setHoveredSession]   = useState(null)

  // Language picker
  const [langOpen, setLangOpen] = useState(false)

  // Report upload
  const [reportUploading, setReportUploading] = useState(false)
  const [reportFile, setReportFile]           = useState(null) // { name, previewMsg }

  const bottomRef    = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef     = useRef(null)
  const fileInputRef = useRef(null)
  const langRef      = useRef(null)

  // ── Load sessions list from backend ────────────────────────────────────────
  const fetchSessions = useCallback(() => {
    if (!isLoggedIn) return
    setSessionsLoading(true)
    chatApi.sessions()
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false))
  }, [isLoggedIn])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Speech recognition setup ────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false) }
    rec.onend    = () => setListening(false)
    recognitionRef.current = rec
  }, [])

  // Close language dropdown when clicking outside
  useEffect(() => {
    if (!langOpen) return
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [langOpen])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) { recognitionRef.current.stop() }
    else { recognitionRef.current.start(); setListening(true) }
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    window.speechSynthesis.speak(utt)
  }

  const copyToClipboard = (text) => navigator.clipboard.writeText(text)

  // Start a brand-new conversation
  const newChat = () => {
    setMessages([])
    setCurrentSessionId(uuid())
    setSidebarOpen(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Load an existing session's messages
  const loadSession = async (session_id) => {
    if (session_id === currentSessionId && messages.length > 0) {
      setSidebarOpen(false)
      return
    }
    setLoadingSession(true)
    setSidebarOpen(false)
    try {
      const data = await chatApi.list(session_id)
      const msgs = (data?.results || data || []).map((m) => ({
        id: m.id, role: m.role, content: m.content,
      }))
      setMessages(msgs)
      setCurrentSessionId(session_id)
    } catch (_) {}
    finally { setLoadingSession(false) }
  }

  // Delete an entire session
  const deleteSession = async (e, session_id) => {
    e.stopPropagation()
    try {
      await chatApi.removeSession(session_id)
      setSessions((prev) => prev.filter((s) => s.session_id !== session_id))
      // If deleting the active session, start fresh
      if (session_id === currentSessionId) newChat()
    } catch (_) {}
  }

  // Send a message
  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      const data = await aiApi.chat({ message: content, history, session_id: currentSessionId })
      const aiResponse = data.response || 'I could not generate a response. Please try again.'
      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: aiResponse }
      setMessages((prev) => [...prev, assistantMsg])
      // Refresh session list so the new session appears in sidebar
      fetchSessions()
    } catch (_) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        content: 'Sorry, I had trouble connecting to the AI server. Please make sure the Django backend is running on http://localhost:8000.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => sendMessage(suggestion.text)

  // ── Report upload handler ───────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setMessages((prev) => [...prev, {
        id: Date.now(), role: 'assistant',
        content: `**Unsupported file type:** Please upload a PDF, PNG, or JPG medical report.`,
      }])
      return
    }

    // Show "uploading" user bubble immediately
    const uploadMsg = {
      id: Date.now(), role: 'user',
      content: `📎 Report: **${file.name}**`,
    }
    setMessages((prev) => [...prev, uploadMsg])
    setReportUploading(true)
    setLoading(true)

    try {
      // 1. Upload to backend (creates MedicalReport record)
      const uploaded = await reportsApi.upload(file.name, file)

      // 2. Ask AI to analyse the stored report by its ID
      const analysis = await aiApi.analyzeReport({ report_id: uploaded.id })

      // 3. Extract ONLY medicines / prescriptions from the findings
      //    Everything else → redirect user to Medical Reports section
      const rxLines = []

      // Pull any medicine-related findings (look for keys like "medication",
      // "prescription", "drug", "treatment", "medicine" in parameter names)
      const RX_PATTERN = /medicine|medication|prescription|drug|treatment|tablet|capsule|syrup|dose|dosage|rx/i

      if (Array.isArray(analysis.findings) && analysis.findings.length > 0) {
        const rxFindings = analysis.findings.filter((f) => RX_PATTERN.test(f.parameter || ''))
        if (rxFindings.length > 0) {
          rxLines.push('**Prescribed Medicines:**')
          rxFindings.forEach((f) => {
            const dose = f.value ? ` — ${f.value}` : ''
            const note = f.interpretation ? ` *(${f.interpretation})*` : ''
            rxLines.push(`• **${f.parameter}**${dose}${note}`)
          })
        }
      }

      // Also surface any free-text advice that mentions medicines
      if (analysis.advice && RX_PATTERN.test(analysis.advice)) {
        rxLines.push('')
        rxLines.push(`**Prescription note:** ${analysis.advice}`)
      }

      // Always add the redirect prompt
      rxLines.push('')
      if (rxLines.length <= 2) {
        // No specific medicine data found — just redirect
        rxLines.unshift('Your report has been uploaded successfully.')
        rxLines.unshift('')
      }
      rxLines.push('---')
      rxLines.push('📋 For the **full detailed analysis** — including all findings, abnormal values, interpretations, and health insights — please visit the **Medical Reports** section.')

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: rxLines.join('\n'),
        // attach a special flag so the render can show a chip
        _reportId: uploaded.id,
      }
      setMessages((prev) => [...prev, aiMsg])

      // ── Persist both messages to chat history backend ──────────────────
      // (report upload bypasses aiApi.chat so we must save manually)
      if (isLoggedIn) {
        try {
          await chatApi.send({ role: 'user',      content: uploadMsg.content,  session_id: currentSessionId })
          await chatApi.send({ role: 'assistant', content: aiMsg.content,       session_id: currentSessionId })
        } catch (_) { /* non-fatal — history save failure should not block UI */ }
      }

      // Store file context, clear the pre-fill (no follow-up prompt needed here)
      setReportFile({ name: file.name, reportId: uploaded.id })
      setInput('')

      fetchSessions()
    } catch (err) {
      let errMsg = 'Sorry, I could not process this report.'
      try {
        const parsed = JSON.parse(err.message)
        if (parsed.error) errMsg = parsed.error
        if (parsed.extraction_failed) {
          errMsg = 'Could not extract text from this file. For scanned images, Tesseract OCR must be installed on the server.\n\nYou can still go to the **Medical Reports** section to view and analyse it there.'
        }
      } catch (_) {}
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: errMsg }])
      // Still try to save error exchange to history
      if (isLoggedIn) {
        try {
          await chatApi.send({ role: 'user',      content: `📎 Report: **${file.name}**`, session_id: currentSessionId })
          await chatApi.send({ role: 'assistant', content: errMsg,                          session_id: currentSessionId })
        } catch (_) {}
      }
      fetchSessions()
    } finally {
      setReportUploading(false)
      setLoading(false)
    }
  }

  // ── Sidebar content ─────────────────────────────────────────────────────────
  const renderSidebarContent = () => (
    <>
      {/* Header */}
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
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={newChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="mx-3 my-1 border-t border-[#E2E8F0]" />

      {/* Chat History Label */}
      <div className="px-6 py-2">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Recent Chats
        </p>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-[#94A3B8]" />
          </div>
        ) : !isLoggedIn ? (
          <p className="px-3 py-4 text-xs text-[#94A3B8] text-center">
            Sign in to see your chat history
          </p>
        ) : sessions.length === 0 ? (
          <p className="px-3 py-4 text-xs text-[#94A3B8] text-center">
            No past conversations yet
          </p>
        ) : (
          sessions.map((session) => (
            <motion.button
              key={session.session_id}
              whileHover={{ scale: 1.005 }}
              onClick={() => loadSession(session.session_id)}
              onMouseEnter={() => setHoveredSession(session.session_id)}
              onMouseLeave={() => setHoveredSession(null)}
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative ${
                session.session_id === currentSessionId
                  ? 'bg-[#EFF6FF] text-[#0F172A]'
                  : 'hover:bg-[#F8FAFC] text-[#475569]'
              }`}
            >
              {session.title?.startsWith('📎')
                ? <FileText className="w-4 h-4 flex-shrink-0 text-[#0F6FFF]" />
                : <MessageSquare className="w-4 h-4 flex-shrink-0 text-[#94A3B8]" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0F172A] truncate leading-snug">{session.title}</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">{relativeTime(session.last_message_at)}</p>
              </div>
              {hoveredSession === session.session_id && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={(e) => deleteSession(e, session.session_id)}
                  className="p-1 rounded hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-colors flex-shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </motion.button>
          ))
        )}
      </div>

      {/* User Footer */}
      <div className="px-3 py-3 border-t border-[#E2E8F0]">
        {isLoggedIn ? (
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#F8FAFC] rounded-lg cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#0F172A] truncate font-medium">{user?.username || 'User'}</p>
            </div>
            <Settings className="w-4 h-4 text-[#64748B] flex-shrink-0" />
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => { navigate('/auth'); setSidebarOpen(false) }}
            className="w-full py-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-lg text-sm font-medium"
          >
            Sign In
          </motion.button>
        )}
      </div>
    </>
  )

  // ── Shared input box ────────────────────────────────────────────────────────
  const renderInputBox = (ref) => (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Report badge — shown when a file has been attached */}
      {reportFile && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#F0F9FF] border border-[#0F6FFF]/20 rounded-xl">
          <FileText className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" />
          <span className="text-xs text-[#0F6FFF] truncate flex-1">{reportFile.name}</span>
          <button onClick={() => setReportFile(null)} className="text-[#94A3B8] hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <textarea
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
        placeholder="Ask anything about your health..."
        rows={1}
        className="w-full bg-transparent outline-none text-[#0F172A] placeholder:text-[#94A3B8] resize-none text-[15px] mb-4"
        style={{ minHeight: '40px', maxHeight: '200px' }}
      />
      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3">

          {/* ── Attach Report ──────────────────────────────────────────── */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={reportUploading}
            className={`flex items-center gap-2 transition-colors text-sm ${
              reportUploading
                ? 'text-[#0F6FFF] cursor-wait'
                : reportFile
                  ? 'text-[#0F6FFF]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
            title="Attach PDF or image report"
          >
            {reportUploading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Paperclip className="w-4 h-4" />
            }
            <span className="hidden sm:inline">
              {reportUploading ? 'Analysing…' : 'Attach Report'}
            </span>
          </motion.button>

          {/* ── Voice ──────────────────────────────────────────────────── */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`flex items-center gap-2 transition-colors text-sm ${
              listening ? 'text-red-500' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </motion.button>

          {/* ── Language picker ─────────────────────────────────────────── */}
          <div className="relative" ref={langRef}>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setLangOpen((o) => !o)}
              className={`flex items-center gap-2 transition-colors text-sm ${
                language !== 'English'
                  ? 'text-[#0F6FFF] font-medium'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
              title="Change language"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language !== 'English' ? language : 'Language'}</span>
            </motion.button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 left-0 z-50 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl py-1.5 min-w-[160px]"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { changeLanguage(lang); setLangOpen(false) }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-[#F8FAFC] ${
                        language === lang ? 'text-[#0F6FFF] font-semibold' : 'text-[#0F172A]'
                      }`}
                    >
                      <span>{lang}</span>
                      {language === lang && <Check className="w-3.5 h-3.5 text-[#0F6FFF]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="px-6 py-2 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] hover:from-[#FF7B32] hover:to-[#FF5A25] text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md"
        >
          Submit
        </motion.button>
      </div>
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
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

        {/* Loading overlay when switching sessions */}
        {loadingSession && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F6FFF]" />
          </div>
        )}

        {/* Chat Area */}
        {!loadingSession && (
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              /* ── Welcome / Empty state ─────────────────────────────────── */
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col items-center justify-center px-4 pb-20"
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                  <Logo className="w-20 h-20 mb-6" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-normal text-[#0F172A] mb-8 text-center"
                >
                  What can I help with?
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="w-full max-w-3xl"
                >
                  {renderInputBox(inputRef)}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-2 max-w-3xl mt-6"
                >
                  {SUGGESTIONS.map((s, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(s)}
                      className="px-4 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#0F6FFF] hover:bg-[#F8FAFC] rounded-lg transition-all text-sm text-[#0F172A] shadow-sm"
                    >
                      {s.text}
                    </motion.button>
                  ))}
                </motion.div>
                {/* Subtle grid background */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
                  <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#0F6FFF" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                </div>
              </motion.div>
            ) : (
              /* ── Messages view ─────────────────────────────────────────── */
              <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
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

                      {/* Bubble */}
                      <div className="flex-1 min-w-0">
                        <div className={`inline-block max-w-full px-4 py-3 rounded-3xl text-[15px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#0F6FFF] text-white'
                            : 'bg-white border border-[#E2E8F0] text-[#0F172A]'
                        }`}>
                          {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                        </div>

                        {/* Feature chips */}
                        {msg.role === 'assistant' && (() => {
                          const c = msg.content || ''
                          const chips = []
                          // Report redirect chip — always shown when message has a reportId
                          if (msg._reportId) {
                            chips.push({ icon: FileText, label: 'View Full Report Analysis', route: '/reports' })
                          }
                          if (/health analysis|analyze.*symptom|symptom.*check/i.test(c))
                            chips.push({ icon: Activity, label: 'Health Analysis', route: '/health-analysis' })
                          if (!msg._reportId && /medical report|upload.*report|report.*analysis/i.test(c))
                            chips.push({ icon: FileText, label: 'Medical Reports', route: '/reports' })
                          if (/hospital finder|find.*hospital|nearby.*hospital|nearby.*clinic/i.test(c))
                            chips.push({ icon: MapPin, label: 'Hospital Finder', route: '/hospitals' })
                          if (/medicine reminder|set.*reminder|manage.*medicine/i.test(c))
                            chips.push({ icon: Pill, label: 'Medicine Reminders', route: '/medicines' })
                          return chips.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {chips.map((chip, ci) => <FeatureChip key={ci} {...chip} onClick={(r) => navigate(r)} />)}
                            </div>
                          ) : null
                        })()}

                        {/* Message actions on hover */}
                        {msg.role === 'assistant' && hoveredMessage === msg.id && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2">
                            {[
                              { icon: Copy,       title: 'Copy',       fn: () => copyToClipboard(msg.content) },
                              { icon: Volume2,    title: 'Speak',      fn: () => speakText(msg.content) },
                              { icon: ThumbsUp,   title: 'Like',       fn: () => {} },
                              { icon: ThumbsDown, title: 'Dislike',    fn: () => {} },
                              { icon: RotateCcw,  title: 'Regenerate', fn: () => {} },
                            ].map(({ icon: Icon, title, fn }) => (
                              <motion.button key={title} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={fn}
                                className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                                title={title}
                              >
                                <Icon className="w-4 h-4" />
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
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
        )}

        {/* Bottom Input — only when messages exist */}
        {!loadingSession && messages.length > 0 && (
          <div className="border-t border-[#E2E8F0] bg-white px-4 py-4">
            <div className="max-w-3xl mx-auto">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {renderInputBox(null)}
              </motion.div>
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
