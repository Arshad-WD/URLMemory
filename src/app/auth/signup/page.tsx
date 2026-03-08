'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle, ShieldCheck, ChevronRight, Activity } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'REGISTRATION_FAILED: SYSTEM_REJECTION')
        return
      }
      
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 1500)
    } catch (err) {
      setError('SYSTEM_ERROR: UNABLE_TO_INITIALIZE_UNIT')
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">REGISTRATION</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-1">UNIT_INITIALIZATION_PROTOCOL</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-2 border-border p-10 shadow-[12px_12px_0px_0px_var(--color-border)] relative">
          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-primary flex items-center justify-center mx-auto mb-8 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-border)]">
                <CheckCircle className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-4">UNIT_SYNCHRONIZED</h3>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">REDIRECTING_TO_AUTH_PORTAL...</p>
            </motion.div>
          ) : (
            <>
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
              
              <form className="space-y-8" onSubmit={handleSignup}>
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
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">SET_SECURITY_KEY</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="input-industrial w-full pl-14 py-4 uppercase italic tracking-tighter"
                      placeholder="MIN_6_CHRS"
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
                  {loading ? 'INITIALIZING...' : (
                    <span className="flex items-center justify-center gap-4">INITIALIZE_UNIT <ArrowRight className="w-6 h-6" strokeWidth={3} /></span>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-12 pt-10 border-t-2 border-border text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              ALREADY_IDENTIFIED?{' '}
              <Link href="/auth/login" className="text-primary hover:italic transition-all inline-flex items-center gap-1">
                ACCESS_PORTAL <ChevronRight className="w-3 h-3" />
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
