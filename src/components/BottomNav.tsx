'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, FileText, CheckSquare, 
  Users, Plus, BrainCircuit 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BottomNavProps {
  onAddClick?: () => void
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'INTEL', href: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'LOGS', href: '/notes' },
    { icon: <Plus className="w-6 h-6" />, label: 'CAPTURE', isAction: true },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'OBJECTIVES', href: '/todos' },
    { icon: <Users className="w-5 h-5" />, label: 'UNITS', href: '/rooms' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8">
      <div className="bg-card/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl flex items-center justify-between p-2 relative overflow-hidden">
        {/* Subtle animated scanline inside nav */}
        <motion.div 
            animate={{ x: ['100%', '-100%'] }} 
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-24 h-full bg-primary/5 blur-xl pointer-events-none" 
        />

        {navItems.map((item, i) => {
          if (item.isAction) {
            return (
              <button 
                key={i}
                onClick={onAddClick}
                className="relative -top-6 w-16 h-16 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-transform"
              >
                <Plus className="w-8 h-8" strokeWidth={3} />
              </button>
            )
          }

          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href || '#'} 
              className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 relative group"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-active:scale-90'}`}>
                {item.icon}
              </div>
              <span className={`text-[8px] font-black tracking-widest uppercase transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute -bottom-2 w-8 h-1 bg-primary rounded-full shadow-glow" 
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
