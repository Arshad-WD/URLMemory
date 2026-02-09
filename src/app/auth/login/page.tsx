'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
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
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0a0b0f] flex items-center justify-center p-4 transition-colors">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25 rotate-3"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-gray-100/80 dark:border-slate-700/50 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 p-8">
          {/* Google Login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-100/80 dark:bg-slate-900/50 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-100/80 dark:bg-slate-900/50 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
            >
              {loading ? 'Signing in...' : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
