import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, MessageSquare, Activity, FileText, 
  Pill, MapPin, User, Settings, LogOut 
} from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/chat' },
  { icon: Activity, label: 'Health Analysis', path: '/health-analysis' },
  { icon: FileText, label: 'Medical Reports', path: '/reports' },
  { icon: Pill, label: 'Medicines', path: '/medicines' },
  { icon: MapPin, label: 'Hospital Finder', path: '/hospitals' },
]

const BOTTOM_NAV = [
  { icon: User, label: 'Health Profile', path: '/health-profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E2E8F0] h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#E2E8F0]">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo className="w-10 h-10" />
          <span className="text-xl font-bold text-[#0F172A]">
            Med<span className="text-[#14C8A8]">Sense</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active
                  ? 'bg-[#F0F9FF] text-[#0F6FFF]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-[#0F6FFF]' : 'text-[#94A3B8] group-hover:text-[#0F6FFF]'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}

        {/* Divider */}
        <div className="py-3">
          <div className="border-t border-[#E2E8F0]" />
        </div>

        {/* Bottom Navigation */}
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active
                  ? 'bg-[#F0F9FF] text-[#0F6FFF]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-[#0F6FFF]' : 'text-[#94A3B8] group-hover:text-[#0F6FFF]'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-[#E2E8F0]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
