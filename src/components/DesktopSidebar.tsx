'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BrainCircuit, LayoutDashboard, FileText, CheckSquare, 
  Users, Settings, Plus, LogOut, ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import MagneticEffect from './MagneticEffect'

interface DesktopSidebarProps {
  children?: ReactNode
  onAction?: () => void
  actionLabel?: string
}

export default function DesktopSidebar({ children, onAction, actionLabel = "Capture" }: DesktopSidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Intelligence', href: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Cipher Logs', href: '/notes' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Objectives', href: '/todos' },
    { icon: <Users className="w-5 h-5" />, label: 'Coalitions', href: '/rooms' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-background border-r border-white/5 z-50">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 mb-12 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
            <BrainCircuit className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter">Nexus.OS</span>
        </Link>

        {onAction && (
          <MagneticEffect strength={0.1}>
            <button 
              onClick={onAction}
              className="w-full btn-premium mb-12 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span>{actionLabel}</span>
            </button>
          </MagneticEffect>
        )}

        <nav className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mb-6 px-4">Core Modules</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        {children}
        
        <div className="h-px bg-white/5" />
        
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/5">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Dark Protocol</span>
           <button 
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="w-12 h-6 bg-white/10 rounded-full relative p-1 transition-colors hover:bg-white/20"
           >
              <motion.div 
                animate={{ x: theme === 'dark' ? 24 : 0 }}
                className="w-4 h-4 bg-primary rounded-full shadow-glow" 
              />
           </button>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
        </button>

        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all cursor-default">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent opacity-40 group-hover:opacity-100 transition-opacity" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-tighter">Operator_01</p>
              <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest mt-0.5">Secure Link</p>
           </div>
        </div>
      </div>
    </aside>
  )
}
