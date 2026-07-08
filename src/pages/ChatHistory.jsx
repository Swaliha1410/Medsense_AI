import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, User, Trash2, MessageSquare, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { chat as chatApi } from '../services/api'

export default function ChatHistory() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth'); return }
    chatApi.list()
      .then((data) => setMessages(data?.results || data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  const deleteMessage = async (id) => {
    await chatApi.remove(id)
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = msg.timestamp
      ? new Date(msg.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Unknown date'
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text">Chat <span className="text-gradient">History</span></h1>
            <p className="text-text/60 mt-1">Your previous AI conversations</p>
          </div>
          <Link to="/chat" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold text-sm">
            <MessageSquare className="w-4 h-4" /> New Chat
          </Link>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-text/40">Loading history…</div>
        ) : messages.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-text/20" />
            <h3 className="text-xl font-bold text-text/40 mb-2">No chat history yet</h3>
            <p className="text-text/30 mb-6">Start a conversation with MedSense AI</p>
            <Link to="/chat" className="px-6 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold">
              Start Chatting
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).reverse().map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-4 h-4 text-text/30" />
                  <span className="text-sm font-semibold text-text/40 uppercase tracking-wide">{date}</span>
                  <div className="flex-1 h-px bg-text/10" />
                </div>
                <div className="space-y-3">
                  {msgs.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'assistant' ? 'bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8]' : 'bg-gray-200'
                      }`}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] text-white rounded-tr-sm'
                          : 'bg-white shadow-sm text-text rounded-tl-sm'
                      }`}>
                        {msg.content}
                        {msg.timestamp && (
                          <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-text/30'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
