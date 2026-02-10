'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, FileText, CheckSquare, Users, Sun, Moon } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface BottomNavProps {
  onAddClick: () => void
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'notes', icon: FileText, label: 'Notes', path: '/notes' },
    { id: 'add', icon: Plus, label: 'Add', isAction: true },
    { id: 'todos', icon: CheckSquare, label: 'Todos', path: '/todos' },
    { id: 'rooms', icon: Users, label: 'Rooms', path: '/rooms' },
  ]

  const getActiveTab = () => {
    if (pathname === '/dashboard' || pathname === '/') return 'home'
    if (pathname.startsWith('/notes')) return 'notes'
    if (pathname.startsWith('/todos')) return 'todos'
    if (pathname.startsWith('/rooms')) return 'rooms'
    return ''
  }

  const activeTab = getActiveTab()

  if (!mounted) return null

  return (
    <>
      {/* Theme Toggle - Floating button, positioned to avoid header overlap */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="lg:hidden fixed top-[72px] right-4 z-50 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>

      {/* Mobile Bottom Nav - Premium Floating Design */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="lg:hidden fixed bottom-6 left-6 right-6 z-50 pointer-events-none"
      >
        <div className="pointer-events-auto max-w-md mx-auto">
          <div className="relative">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl rounded-3xl" />
            
            {/* Glass Container */}
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40 px-2 py-2.5">
              <div className="flex items-center justify-between px-2">
                
                {navItems.map((item) => {
                  if (item.isAction) {
                    return (
                        <div key={item.id} className="relative -mt-8 mx-2">
                             <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onAddClick}
                                className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full text-white shadow-xl shadow-indigo-500/40 border-4 border-white dark:border-slate-900"
                            >
                                <Plus className="w-7 h-7" strokeWidth={2.5} />
                            </motion.button>
                        </div>
                    )
                  }

                  const isActive = activeTab === item.id
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => router.push(item.path!)}
                      whileTap={{ scale: 0.9 }}
                      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                      }`}
                    >
                      <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  )
}
