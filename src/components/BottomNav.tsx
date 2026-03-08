'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, FileText, CheckSquare, Users, Sun, Moon, Terminal } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import MagneticEffect from './MagneticEffect'
import { useTheme } from './ThemeProvider'

interface BottomNavProps {
  onAddClick: () => void
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'DASHBOARD', path: '/dashboard' },
    { id: 'notes', icon: FileText, label: 'NOTES', path: '/notes' },
    { id: 'add', icon: Plus, label: 'DEPLOY', isAction: true },
    { id: 'todos', icon: CheckSquare, label: 'TASKS', path: '/todos' },
    { id: 'rooms', icon: Users, label: 'UNITS', path: '/rooms' },
  ]

  const activeTab = pathname.startsWith('/dashboard') || pathname === '/' ? 'dashboard' :
                  pathname.startsWith('/notes') ? 'notes' :
                  pathname.startsWith('/todos') ? 'todos' :
                  pathname.startsWith('/rooms') ? 'rooms' : ''

  return (
    <>
      {/* Theme Toggle Mobile */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="lg:hidden fixed top-5 right-5 z-50 w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-foreground hover:border-primary transition-all active:translate-y-1"
        aria-label="Toggle theme"
        style={{ boxShadow: '4px 4px 0px 0px var(--color-border)' }}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-primary" strokeWidth={3} /> : <Moon className="w-5 h-5 text-primary" strokeWidth={3} />}
      </motion.button>

      {/* Mobile Bottom Nav */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="lg:hidden fixed bottom-8 left-5 right-5 z-50"
      >
        <div className="max-w-md mx-auto relative bg-card border-2 border-border p-2 shadow-[8px_8px_0px_0px_var(--color-border)]">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              if (item.isAction) {
                return (
                    <div key={item.id} className="relative -mt-10">
                        <MagneticEffect strength={0.4}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onAddClick}
                                className="w-16 h-16 bg-primary border-4 border-card text-primary-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all"
                            >
                                <Plus className="w-8 h-8" strokeWidth={4} />
                            </motion.button>
                        </MagneticEffect>
                    </div>
                )
              }

              const isActive = activeTab === item.id
              return (
                <MagneticEffect key={item.id}>
                    <button
                    onClick={() => router.push(item.path!)}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all ${
                        isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    >
                    <item.icon className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 3 : 2} />
                    {isActive && (
                        <motion.div
                        layoutId="active-nav"
                        className="absolute -bottom-1 w-1.5 h-1.5 bg-primary animate-technical-blink"
                        />
                    )}
                    </button>
                </MagneticEffect>
              )
            })}
          </div>
        </div>
      </motion.nav>
    </>
  )
}
