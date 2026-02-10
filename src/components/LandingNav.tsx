'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'

export default function LandingNav() {
  const sessionObj = useSession()
  const session = sessionObj?.data

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 bg-white/5 dark:bg-slate-900/5 backdrop-blur-xl border border-white/10 dark:border-slate-800/10 rounded-2xl md:rounded-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">Memory</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {session ? (
            <Link 
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg md:rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </Link>
          ) : (
             <div className="flex items-center gap-2">
                <Link 
                  href="/auth/login"
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium text-sm hover:text-slate-900 dark:hover:text-white transition-colors hidden md:block"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg md:rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                >
                  Get Started
                </Link>
             </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
