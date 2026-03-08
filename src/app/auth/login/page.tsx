'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Activity, ChevronRight } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.error) {
        setError('AUTHENTICATION_FAILED: INVALID_CREDENTIALS')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('SYSTEM_ERROR: UNABLE_TO_ESTABLISH_SESSION')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Terminal Header */}
        <div className="bg-card border-2 border-border border-b-0 p-8 flex items-center justify-between shadow-[8px_8px_0px_0px_var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary flex items-center justify-center border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
              <ShieldCheck className="text-primary-foreground w-7 h-7" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">ACCESS_PORTAL</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-1">UPLINK_PROTOCOL: SECURE</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">LIVE_SESSION</span>
          </div>
        </div>

        <div className="bg-card border-2 border-border p-10 shadow-[12px_12px_0px_0px_var(--color-border)] relative">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 flex items-center gap-4"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-[11px] font-black uppercase tracking-tighter text-red-500">{error}</p>
            </motion.div>
          )}
          
          <form className="space-y-8" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">COMMAND_EMAIL</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  className="input-industrial w-full pl-14 py-4 uppercase italic tracking-tighter"
                  placeholder="name@system.terminal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">SECURITY_KEY</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="input-industrial w-full pl-14 py-4 uppercase italic tracking-tighter"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-industrial w-full py-5 text-lg"
            >
              {loading ? 'SYNCHRONIZING...' : (
                <span className="flex items-center justify-center gap-4">ESTABLISH_SESSION <ArrowRight className="w-6 h-6" strokeWidth={3} /></span>
              )}
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-12">
            <div className="flex items-center gap-6 mb-8">
              <div className="flex-1 h-0.5 bg-border" />
              <span className="text-[10px] font-black italic text-muted-foreground/40 px-2 tracking-[0.4em]">ALT_UPLINK</span>
              <div className="flex-1 h-0.5 bg-border" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-4 py-4 px-6 border-2 border-border hover:border-primary bg-background transition-all font-black uppercase text-[12px] tracking-widest disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'EXECUTING...' : 'DISPATCH_VIA_GOOGLE'}
            </button>
          </div>

          <div className="mt-12 pt-10 border-t-2 border-border text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              NO_IDENTIFIER_FOUND?{' '}
              <Link href="/auth/signup" className="text-primary hover:italic transition-all inline-flex items-center gap-1">
                INITIALIZE_NEW_UNIT <ChevronRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* System Info Footer */}
        <div className="mt-8 flex justify-between px-2 opacity-30">
            <div className="flex gap-4">
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">IP: 192.168.1.XXX</span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">NODE: ABYSSAL_CORE_7</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">VERSION: 2.4.0_STABLE</span>
        </div>
      </motion.div>
    </div>
  )
}
