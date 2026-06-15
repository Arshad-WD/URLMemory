'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BrainCircuit, ShieldCheck, Zap, ArrowRight, Bookmark, 
  Sparkles, Activity, Globe, Cpu, Lock, Network
} from 'lucide-react'
import LandingNav from '@/components/LandingNav'
import MagneticEffect from '@/components/MagneticEffect'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-primary/30">
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 lg:pt-64 lg:pb-48">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-10">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Neural Indexing Online</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.85] mb-12 uppercase">
                The <span className="text-primary animate-glow">Nexus</span> <br /> 
                of Knowledge
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-medium italic leading-relaxed max-w-xl mb-16 opacity-80">
                A sovereign intelligence platform designed to capture, synthesize, and synchronize the web's vast information stream.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/auth/signup">
                  <button className="btn-premium px-10 py-5 text-sm w-full sm:w-auto">
                    Initiate Sequence <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="#architecture">
                  <button className="px-10 py-5 rounded-full border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all w-full sm:w-auto italic">
                    View Architecture
                  </button>
                </Link>
              </div>

              <div className="mt-20 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">NVIDIA NIM</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">RSA-4096</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Global Sync</span>
                </div>
              </div>
            </motion.div>

            {/* Visual Element */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" 
                     style={{ backgroundImage: 'conic-gradient(transparent, var(--color-primary), transparent)' }} />
                
                <div className="absolute inset-10 bento-card flex items-center justify-center p-0 border-primary/10 overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="relative z-10 text-center p-12">
                     <BrainCircuit className="w-24 h-24 text-primary mx-auto mb-8 animate-glow" />
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Neural Core</h3>
                     <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Active Synthesis</p>
                  </div>
                </div>

                {/* Orbiting Elements */}
                {[0, 120, 240].map((deg, i) => (
                  <motion.div 
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="w-16 h-16 bento-card p-0 flex items-center justify-center border-primary/30" style={{ transform: `translate(250px) rotate(-${deg}deg)` }}>
                       <Zap className="w-6 h-6 text-primary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="intelligence" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <div className="bento-card group h-full">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-6 group-hover:text-primary transition-colors">Neural Indexing</h3>
                    <p className="text-xl text-muted-foreground font-medium italic leading-relaxed mb-10">
                      Mixtral 8x22b powered content extraction. Capture any URI, and our neural bus automatically synthesizes knowledge for instant recall.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {['AUTO_SUMMARIZE', 'SEMANTIC_TAGS', 'DEEP_INSIGHT'].map(tag => (
                        <span key={tag} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black tracking-[0.2em]">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-64 aspect-square bento-card p-0 overflow-hidden border-primary/20">
                    <div className="h-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                       <Activity className="w-20 h-20 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-4">
              <div className="bento-card h-full flex flex-col justify-between border-accent/20 group">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 border border-accent/20">
                  <ShieldCheck className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6 group-hover:text-accent transition-colors">Sealed Vaults</h3>
                  <p className="text-muted-foreground font-medium italic leading-relaxed">
                    Sovereign encryption protocols. Your knowledge base is locked behind RSA-4096 telemetry.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="bento-card h-full group">
                <Globe className="w-12 h-12 text-primary mb-8" />
                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6 group-hover:text-primary transition-colors">Global Network</h3>
                <p className="text-muted-foreground font-medium italic leading-relaxed">
                  Real-time collaborative telemetry across all coalition nodes. Zero-latency objective tracking.
                </p>
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="bento-card h-full bg-primary/5 border-primary/20 flex flex-col md:flex-row items-center gap-12">
                 <div className="flex-1 order-2 md:order-1">
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6">Coalition Units</h3>
                    <p className="text-muted-foreground font-medium italic leading-relaxed">
                      Deploy private rooms for tactical research squads. Share links, notes, and tasks in an encrypted perimeter.
                    </p>
                 </div>
                 <div className="w-full md:w-48 aspect-video bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center order-1 md:order-2">
                    <Network className="w-12 h-12 text-primary/40" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bento-card py-24 border-primary/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-12">Ready for <br /> <span className="text-primary">Uplink?</span></h2>
            <p className="text-xl text-muted-foreground italic mb-16 max-w-2xl mx-auto">
              Join the neural network and elevate your knowledge management to professional tactical levels.
            </p>
            <Link href="/auth/signup">
              <button className="btn-premium px-16 py-6 text-base mx-auto">
                Begin Initialization
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
               <BrainCircuit className="w-5 h-5 text-primary-foreground" />
             </div>
             <span className="text-lg font-black uppercase italic tracking-tighter">Nexus.OS</span>
          </div>
          <div className="flex gap-12">
            {['Architecture', 'Tactical', 'Privacy', 'Network'].map(link => (
              <a key={link} href="#" className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">© 2026 NEXUS_BRAIN_V4.0 // SYSTEM_STABLE</p>
        </div>
      </footer>
    </div>
  )
}
