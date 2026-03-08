
'use client'

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Sparkles, Plus, FileText, CheckSquare, Users, Sun, Moon, LogOut, LayoutDashboard 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { useTheme } from './ThemeProvider'
import MagneticEffect from './MagneticEffect'

interface DesktopSidebarProps {
  children?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}

export default function DesktopSidebar({ children, onAction, actionLabel }: DesktopSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && (pathname === '/dashboard' || pathname === '/')) return true
    return pathname.startsWith(path)
  }

  const navLinks = [
    { label: 'DASHBOARD', path: '/dashboard', icon: LayoutDashboard },
    { label: 'NOTES', path: '/notes', icon: FileText },
    { label: 'TODOS', path: '/todos', icon: CheckSquare },
    { label: 'ROOMS', path: '/rooms', icon: Users },
  ]

  if (!mounted) return null

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 flex-col bg-card border-r-2 border-border z-40 shadow-[4px_0px_0px_0px_var(--color-border)]">
      {/* Header */}
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center shadow-[4px_4px_0px_0px_var(--color-border)] transition-transform group-hover:rotate-6">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground uppercase italic leading-none">Vault<span className="text-primary">.OS</span></h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">v3.0.0_INTERNAL</p>
          </div>
        </div>
      </div>

      {/* Main Action Button */}
      {onAction && actionLabel && (
        <div className="px-6 mb-8">
          <MagneticEffect strength={0.2}>
            <button 
                onClick={onAction}
                className="btn-industrial w-full flex items-center justify-center gap-2 py-3"
            >
                <Plus className="w-4 h-4" strokeWidth={3} /> {actionLabel.toUpperCase()}
            </button>
          </MagneticEffect>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
        {children && (
          <div className="px-2">
             {children}
          </div>
        )}

        <div>
            <p className="px-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">MODULES_SYSLINK</p>
            <div className="space-y-4">
            {navLinks.map((link) => (
                <MagneticEffect key={link.path} strength={0.1}>
                    <button 
                    onClick={() => router.push(link.path)} 
                    className={`w-full flex items-center justify-between px-4 py-3 border-2 transition-all ${
                        isActive(link.path) 
                        ? 'bg-primary border-primary text-primary-foreground font-black shadow-[4px_4px_0px_0px_var(--color-foreground)]' 
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                    >
                    <div className="flex items-center gap-3">
                        <link.icon className={`w-4 h-4 ${isActive(link.path) ? 'text-primary-foreground' : 'text-primary'}`} strokeWidth={isActive(link.path) ? 4 : 2.5} />
                        <span className="text-[11px] font-black tracking-widest">{link.label}</span>
                    </div>
                    {isActive(link.path) && (
                        <div className="w-2 h-2 bg-primary-foreground animate-technical-blink" />
                    )}
                    </button>
                </MagneticEffect>
            ))}
            </div>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-6 border-t-2 border-border space-y-3">
        <MagneticEffect strength={0.1}>
            <button 
            onClick={toggleTheme} 
            className="w-full flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-foreground transition-all"
            >
            <div className="w-8 h-8 border-2 border-border flex items-center justify-center">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" strokeWidth={3} /> : <Moon className="w-4 h-4 text-primary" strokeWidth={3} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'dark' ? 'MODE_LIGHT' : 'MODE_DARK'}</span>
            </button>
        </MagneticEffect>
        
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-500 transition-all"
        >
          <div className="w-8 h-8 border-2 border-transparent flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">WIPE_SESSION</span>
        </button>
      </div>
    </aside>
  )
}
