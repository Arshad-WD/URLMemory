'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, Menu, X, ChevronRight, Zap } from 'lucide-react'

export default function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative flex items-center justify-between px-8 py-4 rounded-full border transition-all duration-500 ${isScrolled ? 'bg-card/80 backdrop-blur-2xl border-white/10 shadow-2xl shadow-black/50' : 'bg-transparent border-transparent'}`}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <BrainCircuit className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors">Nexus.OS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {['Intelligence', 'Architecture', 'Network', 'Coalition'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-colors">
              Uplink
            </Link>
            <Link href="/auth/register" className="btn-premium py-3 px-6 text-[9px]">
              Initialize Core <Zap className="w-3 h-3" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-6 right-6 mt-4 p-8 bg-card/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl md:hidden z-50"
          >
            <div className="flex flex-col gap-8">
              {['Intelligence', 'Architecture', 'Network', 'Coalition'].map((item) => (
                <Link 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between group"
                >
                  <span className="text-lg font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors">{item}</span>
                  <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="text-center py-4 text-sm font-black uppercase tracking-widest text-muted-foreground">Uplink</Link>
                <Link href="/auth/register" className="btn-premium w-full">Initialize Core</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
