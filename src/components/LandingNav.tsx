'use client'

import Link from 'next/link'
import { Sparkles, Terminal, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'

export default function LandingNav() {
  const sessionObj = useSession()
  const session = sessionObj?.data

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 bg-card border-2 border-border shadow-[4px_4px_0px_0px_var(--color-border)]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center shadow-[4px_4px_0px_0px_var(--color-border)] transition-transform group-hover:rotate-6">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-xl text-foreground uppercase italic tracking-tighter">Vault<span className="text-primary">.OS</span></span>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">ABYSSAL_CORE</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-6">
          {session ? (
            <Link 
              href="/dashboard"
              className="btn-industrial px-6 py-2 text-[10px]"
            >
              GO_TO_TERMINAL
            </Link>
          ) : (
             <div className="flex items-center gap-4">
                <Link 
                  href="/auth/login"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hidden md:block"
                >
                  ESTABLISH_UPLINK
                </Link>
                <Link 
                  href="/auth/signup"
                  className="btn-industrial px-6 py-2 text-[10px]"
                >
                  INITIALIZE_UNIT
                </Link>
             </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
