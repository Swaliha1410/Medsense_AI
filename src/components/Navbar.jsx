import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, MessageSquare, MapPin, History, Settings, User, LogOut, ChevronDown } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'Features',       href: '/#features' },
  { label: 'AI Assistant',   href: '/chat' },
  { label: 'Hospital Finder',href: '/hospitals' },
  { label: 'About',          href: '/about' },
]

const USER_MENU = [
  { label: 'Dashboard',    href: '/dashboard',      icon: LayoutDashboard },
  { label: 'AI Chat',      href: '/chat',            icon: MessageSquare },
  { label: 'Chat History', href: '/chat-history',    icon: History },
  { label: 'Hospital Finder', href: '/hospitals',    icon: MapPin },
  { label: 'Health Profile',href: '/health-profile', icon: User },
  { label: 'Settings',     href: '/settings',        icon: Settings },
]

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [userDropdown,  setUserDropdown]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false)
    setUserDropdown(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (href) => location.pathname === href

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen ? 'glassmorphism shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Logo className="w-10 h-10" />
              <span className="text-2xl font-bold text-text">
                Med<span className="text-[#14C8A8]">sense</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                link.href.startsWith('/#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-text/70 hover:text-text font-medium transition-colors tracking-wide"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`text-sm font-medium transition-colors tracking-wide ${
                      isActive(link.href) ? 'text-[#0F6FFF]' : 'text-text/70 hover:text-text'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* Auth Area */}
            <div className="hidden md:flex items-center space-x-3">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center text-white font-bold text-sm">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-text">
                      {user?.first_name || user?.username}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-text/40 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-xs font-semibold text-text/40 uppercase tracking-wide">Signed in as</p>
                          <p className="text-sm font-bold text-text truncate">{user?.email || user?.username}</p>
                        </div>
                        {USER_MENU.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/70 hover:text-text hover:bg-gray-50 transition-colors"
                          >
                            <item.icon className="w-4 h-4 text-[#0F6FFF]" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-5 py-2.5 text-sm text-text font-medium hover:text-[#0F6FFF] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth?mode=register"
                    className="px-6 py-2.5 text-sm bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-text/70 hover:text-text transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-1 border-t border-white/20 mt-4">
                  {NAV_LINKS.map((link) => (
                    link.href.startsWith('/#') ? (
                      <a key={link.label} href={link.href} className="block px-4 py-3 text-sm font-medium text-text/70 hover:text-[#0F6FFF] rounded-xl hover:bg-[#0F6FFF]/5 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link key={link.label} to={link.href} className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive(link.href) ? 'text-[#0F6FFF] bg-[#0F6FFF]/10' : 'text-text/70 hover:text-[#0F6FFF] hover:bg-[#0F6FFF]/5'}`}>
                        {link.label}
                      </Link>
                    )
                  ))}
                  <div className="pt-3 border-t border-white/20 space-y-2">
                    {isLoggedIn ? (
                      <>
                        {USER_MENU.map((item) => (
                          <Link key={item.label} to={item.href} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text/70 hover:text-[#0F6FFF] rounded-xl hover:bg-[#0F6FFF]/5 transition-colors">
                            <item.icon className="w-4 h-4 text-[#0F6FFF]" /> {item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/auth" className="block px-4 py-3 text-sm font-medium text-center border border-gray-200 rounded-xl text-text hover:border-[#0F6FFF] transition-colors">Login</Link>
                        <Link to="/auth?mode=register" className="block px-4 py-3 text-sm font-semibold text-center bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl">Get Started</Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Backdrop for user dropdown */}
      {userDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />
      )}
    </>
  )
}
