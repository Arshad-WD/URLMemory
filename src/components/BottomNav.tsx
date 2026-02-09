'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Plus, Bell, User, Sun, Moon, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  onAddClick: () => void
  activeTab?: 'home' | 'reminders' | 'profile'
}

export default function BottomNav({ onAddClick, activeTab = 'home' }: BottomNavProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else if (prefersDark) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'add', icon: Plus, label: 'Add', isAction: true },
    { id: 'reminders', icon: Bell, label: 'Reminders' },
  ]

  if (!mounted) return null

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-2 flex flex-col gap-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => item.id === 'add' && onAddClick()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition-all ${
                item.isAction 
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                  : activeTab === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </motion.button>
          ))}
        </div>
        
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-2 flex flex-col gap-2">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </motion.button>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="lg:hidden fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="relative max-w-sm mx-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-purple-500/30 rounded-[1.75rem] blur-xl opacity-60" />
          
          {/* Main nav container */}
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[1.75rem] border border-gray-200/60 dark:border-slate-700/60 shadow-2xl shadow-black/10 dark:shadow-black/30 px-4 py-2">
            <div className="flex items-center justify-around">
              {/* Home */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                  activeTab === 'home' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[9px] font-semibold">Home</span>
              </motion.button>

              {/* Add Button - Elevated */}
              <motion.button
                onClick={onAddClick}
                whileTap={{ scale: 0.9 }}
                className="relative -mt-6 p-4 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-500/40"
              >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </motion.button>

              {/* Reminders */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                  activeTab === 'reminders' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="text-[9px] font-semibold">Alerts</span>
              </motion.button>
            </div>
          </div>

          {/* Theme toggle - Mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="absolute -top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-yellow-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Profile Menu */}
      {showProfile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-24 right-4 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-2 min-w-[160px]"
        >
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </motion.div>
      )}
    </>
  )
}
