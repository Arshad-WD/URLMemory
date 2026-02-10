'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Bookmark, FileText, CheckSquare, Users, ArrowRight, Globe, Lock, Zap, Layers } from 'lucide-react'
import LandingNav from '@/components/LandingNav'

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050506] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[20%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-blue-600/[0.08] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <LandingNav />

      <main className="relative z-10">

        {/* ─── Hero Section ─── */}
        <section className="pt-36 pb-24 px-4 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Open &amp; Free Forever
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-8">
                <span className="bg-gradient-to-b from-white via-white to-gray-600 bg-clip-text text-transparent">
                  Stop forgetting.
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Start remembering.
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed font-light">
                A beautifully minimal workspace to save your links, write notes, 
                manage tasks, and collaborate — all in one place.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/auth/signup"
                  className="group w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-base hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2"
                >
                  Start for Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/auth/login"
                  className="w-full sm:w-auto px-8 py-4 text-gray-400 hover:text-white rounded-full font-medium text-base transition-colors"
                >
                  I have an account →
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ─── Bento Grid Features ─── */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">
                Everything you need
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
                Four tools. <span className="text-gray-500">One home.</span>
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FadeUp delay={0.2}>
                <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-500 overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                      <Bookmark className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Smart Bookmarks</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">Save any URL with one click. We auto-fetch titles, favicons, and metadata so you never lose context.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Auto-Metadata', 'Favorites', 'Tags', 'Search'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                      <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Quick Notes</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">Capture thoughts the moment they strike. Simple, fast, and always accessible from any device.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Instant Capture', 'Rich Text', 'Room Notes'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-blue-500/20 transition-all duration-500 overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                      <CheckSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Task Lists</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">Organize what matters. Track personal tasks or collaborate with your team inside shared rooms.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Personal', 'Shared', 'Track Progress'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.5}>
                <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-violet-500/20 transition-all duration-500 overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
                      <Users className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Team Rooms</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">Create shared spaces with your friends or team. Share bookmarks, notes, and tasks in real-time.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Invite Members', 'Shared Resources', 'Roles'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">
                Simple by design
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-20 tracking-tight">
                Up and running <span className="text-gray-500">in seconds.</span>
              </h2>
            </FadeUp>

            <div className="space-y-16">
              {[
                { step: '01', title: 'Create your account', desc: 'Sign up with email or Google. No credit card, no catch — free forever.' },
                { step: '02', title: 'Save anything', desc: 'Paste a URL, jot a note, or add a task. Everything lives in your personal dashboard.' },
                { step: '03', title: 'Stay organized', desc: 'Use tags, favorites, and rooms to keep things tidy. Find anything instantly with search.' },
              ].map((item, i) => (
                <FadeUp key={item.step} delay={0.2 + i * 0.1}>
                  <div className="flex gap-8 items-start">
                    <span className="text-6xl md:text-8xl font-black text-white/[0.04] shrink-0 leading-none select-none">{item.step}</span>
                    <div className="pt-2 md:pt-4">
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-base md:text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Why Memory ─── */}
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
                Built different. <span className="text-gray-500">On purpose.</span>
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="w-5 h-5" />, title: 'Blazing Fast', desc: 'Built on Next.js with edge-ready performance. No loading spinners.' },
                { icon: <Lock className="w-5 h-5" />, title: 'Private by Default', desc: 'Your data is yours. Authenticate securely; we never sell your information.' },
                { icon: <Globe className="w-5 h-5" />, title: 'Works Everywhere', desc: 'Responsive design that feels native on phone, tablet, or desktop.' },
                { icon: <Layers className="w-5 h-5" />, title: 'No Clutter', desc: 'A clean interface that stays out of your way. Focus on what matters.' },
                { icon: <Sparkles className="w-5 h-5" />, title: 'Free Tier', desc: 'Full access to every feature, no paywalls or hidden limits.' },
                { icon: <Users className="w-5 h-5" />, title: 'Team Ready', desc: 'Invite others into shared rooms for collaborative projects.' },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={0.1 + i * 0.08}>
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors h-full">
                    <div className="text-gray-500 mb-4">{item.icon}</div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="py-32 px-4 md:px-8">
          <FadeUp className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mx-auto mb-8 shadow-2xl shadow-indigo-500/20 flex items-center justify-center rotate-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Your second brain awaits.
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
              Join for free and never lose a link, thought, or task again.
            </p>
            <Link 
              href="/auth/register"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-all"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeUp>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-white/80">Memory</span>
          </div>
          <p className="text-sm text-gray-700">Made with care. © 2026</p>
        </div>
      </footer>
    </div>
  )
}
