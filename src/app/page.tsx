'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Bookmark, FileText, CheckSquare, Users, ArrowRight, Globe, Lock, Zap, Layers, ShieldCheck, Activity, Terminal } from 'lucide-react'
import LandingNav from '@/components/LandingNav'
import MagneticEffect from '@/components/MagneticEffect'

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
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
      {/* Abyssal Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]">
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <LandingNav />

      <main className="relative z-10">

        {/* ─── Hero Section: MISSION_CONTROL ─── */}
        <section className="pt-48 pb-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 border-2 border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                <div className="w-2 h-2 bg-primary animate-pulse" />
                SYSTEM_STATUS: OPERATIONAL // V.2.4.0
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-8">
                <FadeUp delay={0.1}>
                  <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black italic tracking-tighter leading-[0.85] mb-8 uppercase">
                    Unified<br />
                    <span className="text-primary italic">Intelligence.</span>
                  </h1>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mb-12 font-black uppercase tracking-widest leading-tight">
                    The premium industrial workspace for your bookmarks, 
                    records, and shared missions. No fluff. Just raw utility.
                  </p>
                </FadeUp>
              </div>
              
              <div className="lg:col-span-4 pb-4">
                <FadeUp delay={0.3}>
                  <div className="flex flex-col gap-4">
                    <MagneticEffect strength={0.2}>
                      <Link 
                        href="/auth/signup"
                        className="btn-industrial py-6 text-xl flex items-center justify-center gap-4 group"
                      >
                        INITIALIZE_ACCOUNT <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                      </Link>
                    </MagneticEffect>
                    <Link 
                      href="/auth/login"
                      className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all text-center py-4 border-2 border-transparent hover:border-border"
                    >
                      ESTABLISH_UPLINK_PROTOCOL →
                    </Link>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bento Core Features ─── */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <FadeUp>
                <div className="max-w-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">CORE_SUITE</p>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                    FOUR_TOOLS.<br /><span className="text-muted-foreground/30">ONE_COMMAND_CENTER.</span>
                  </h2>
                </div>
              </FadeUp>
              <FadeUp delay={0.1}>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground rotate-90 md:rotate-0 origin-left">
                  SCROLL_FOR_INTEL
                </div>
              </FadeUp>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <FadeUp delay={0.2} className="md:col-span-12 lg:col-span-7">
                <div className="bento-card p-12 h-full group">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="w-16 h-16 bg-primary flex items-center justify-center border-2 border-foreground shadow-[6px_6px_0px_0px_var(--color-border)] mb-10">
                        <Bookmark className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
                      </div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">RESOURCE_INDEXING</h3>
                      <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] leading-relaxed max-w-md">Metadata-enriched bookmarking system. Capture URLs, preserve favicons, and maintain context across all terminal instances.</p>
                    </div>
                    <div className="mt-12 flex gap-3 flex-wrap">
                      {['AUTO_SCRAPE', 'FAV_VAULT', 'TAG_FLTR', 'SEARCH_IDX'].map(tag => (
                        <span key={tag} className="px-3 py-1 border-2 border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.3} className="md:col-span-12 lg:col-span-5">
                <div className="bento-card p-12 h-full bg-primary/5 group border-primary/20">
                    <div className="w-16 h-16 bg-muted border-2 border-border flex items-center justify-center mb-10">
                      <FileText className="w-8 h-8 text-primary" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">DATA_RECORDS</h3>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] leading-relaxed">High-vis shared notepad for critical mission intel. Instant capture, synced across coalition units.</p>
                </div>
              </FadeUp>

              <FadeUp delay={0.4} className="md:col-span-12 lg:col-span-5">
                <div className="bento-card p-12 h-full group">
                    <div className="w-16 h-16 bg-muted border-2 border-border flex items-center justify-center mb-10">
                      <CheckSquare className="w-8 h-8 text-primary" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">OBJECTIVE_TRACKING</h3>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] leading-relaxed">Command personal and shared tasks. Real-time status updates for coordinated execution.</p>
                </div>
              </FadeUp>

              <FadeUp delay={0.5} className="md:col-span-12 lg:col-span-7">
                <div className="bento-card p-12 h-full bg-card shadow-[12px_12px_0px_0px_var(--color-primary)] border-primary group">
                    <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 bg-primary flex items-center justify-center text-primary-foreground border-2 border-foreground shadow-[6px_6px_0px_0px_var(--color-border)]">
                          <Users className="w-8 h-8" strokeWidth={3} />
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">NEW_FEATURE</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">SEALED_ROOMS</h3>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] leading-relaxed max-w-md">Encrypted team environments for private collaboration. Shared resource pools, unit roles, and mission audit logs.</p>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ─── System Architecture ─── */}
        <section className="py-32 px-6 border-y-2 border-border bg-card/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto">
            <FadeUp>
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-24 text-center">
                INDUSTRIAL_BUILD.<br /><span className="text-muted-foreground/30">BUILT_FOR_STABILITY.</span>
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: <Zap className="w-6 h-6" />, title: 'LOW_LATENCY', desc: 'Edge-rendered Next.js architecture ensuring zero-second initialization of critical data core loads.' },
                { icon: <ShieldCheck className="w-6 h-6" />, title: 'SECURE_VAULT', desc: 'Encrypted user session management. Your memory is sovereign. We never access your index data.' },
                { icon: <Activity className="w-6 h-6" />, title: 'ACTIVE_SYNC', desc: 'Real-time collaborative updates across all coalition terminals. Synchronized objective tracking.' },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={0.1 + i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 border-2 border-border bg-card flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--color-border)] text-primary">
                        {item.icon}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-4 italic">{item.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed px-4">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final Dispatch CTA ─── */}
        <section className="py-48 px-6 text-center">
          <FadeUp className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-primary flex items-center justify-center border-4 border-foreground mx-auto mb-12 shadow-[12px_12px_0px_0px_var(--color-border)] rotate-12 group-hover:rotate-0 transition-transform">
              <Terminal className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
            </div>
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-8">
              SECURE_YOUR_INTEL.
            </h2>
            <p className="text-muted-foreground text-sm font-black uppercase tracking-[0.4em] mb-12 max-w-md mx-auto leading-relaxed">
              Initialize your local cluster today.
              Join the unified memory grid.
            </p>
            <MagneticEffect strength={0.3}>
                <Link 
                    href="/auth/signup"
                    className="btn-industrial px-12 py-6 text-2xl group flex items-center justify-center gap-6 mx-auto w-fit"
                >
                    INITIALIZE_CLUSTER <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" strokeWidth={4} />
                </Link>
            </MagneticEffect>
          </FadeUp>
        </section>
      </main>

      {/* ─── Terminal Footer ─── */}
      <footer className="border-t-2 border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-black uppercase italic tracking-tighter text-2xl">URM<span className="text-primary">.MEM</span></span>
          </div>
          <div className="flex gap-12">
            <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">OPERATIONAL_NODE</p>
                <div className="text-[10px] font-black uppercase tracking-widest">ABYSSAL_WEST_US_01</div>
            </div>
            <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">ENCRYPTION_LAYER</p>
                <div className="text-[10px] font-black uppercase tracking-widest">AES_256_GCM</div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">MADE_IN_THE_ABYSS © 2026</p>
        </div>
      </footer>
    </div>
  )
}
