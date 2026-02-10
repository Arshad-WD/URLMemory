'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Sparkles, Plus, Bookmark, Star, Bell, Tag as TagIcon, 
  FileText, CheckSquare, Users, Sun, Moon, LogOut 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'

interface DesktopSidebarProps {
  children?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}

export default function DesktopSidebar({ children, onAction, actionLabel }: DesktopSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (prefersDark) {
      setTheme('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  if (!mounted) return null

  // Helper to determine if a path is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && (pathname === '/dashboard' || pathname === '/')) return true
    return pathname.startsWith(path)
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 rotate-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Memory</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your link library</p>
          </div>
        </div>
      </div>

      {/* Main Action Button */}
      {onAction && actionLabel && (
        <div className="p-4">
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={onAction}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-5 h-5" /> {actionLabel}
          </motion.button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {/* Page Specific Actions/Filters (injected via children) */}
        {children && (
          <div className="mb-6 space-y-1">
             {children}
          </div>
        )}

         <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Apps</p>

        {/* Global Apps Navigation */}
        <div className="space-y-1">
          
          <button 
            onClick={() => router.push('/dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/dashboard') 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-5 h-5" /> Dashboard
          </button>

          <button 
            onClick={() => router.push('/notes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/notes') 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className={`w-5 h-5 ${isActive('/notes') ? 'text-emerald-500' : 'text-gray-500'}`} /> Notes
          </button>

          <button 
            onClick={() => router.push('/todos')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/todos') 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className={`w-5 h-5 ${isActive('/todos') ? 'text-blue-500' : 'text-gray-500'}`} /> Todos
          </button>

          <button 
            onClick={() => router.push('/rooms')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/rooms') 
                ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className={`w-5 h-5 ${isActive('/rooms') ? 'text-violet-500' : 'text-gray-500'}`} /> Rooms
          </button>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
        <button 
          onClick={toggleTheme} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
