'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Tag, Lightbulb, Clock, Globe, ExternalLink, MessageSquare } from 'lucide-react'

interface AiInsightsModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    title: string | null
    url: string
    aiSummary: string | null
    aiTags: string[]
    aiInsight?: string | null
    domain: string
  } | null
}

export default function AiInsightsModal({ isOpen, onClose, data }: AiInsightsModalProps) {
  if (!data) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:h-auto max-h-[80vh] z-[101] overflow-hidden"
          >
            <div className="h-full bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 animate-glow">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Nexus Analysis</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">AI Enrichment v1.5</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Title & Meta */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{data.domain}</span>
                    </div>
                    <h1 className="text-2xl font-black leading-tight italic tracking-tighter mb-4">{data.title || 'Untitled Resource'}</h1>
                    <a href={data.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                        {data.url} <ExternalLink className="w-3 h-3" />
                    </a>
                </section>

                {/* Summary Box */}
                <section className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Executive Summary</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                        {data.aiSummary || "AI is still processing this content. Check back in a moment."}
                    </p>
                </section>

                {/* Tags */}
                <section>
                     <div className="flex items-center gap-3 mb-4">
                        <Tag className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Suggested Classifications</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.aiTags.length > 0 ? data.aiTags.map(tag => (
                            <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-primary/30 transition-all cursor-default">
                                #{tag}
                            </span>
                        )) : <span className="text-xs text-muted-foreground">No tags generated yet.</span>}
                    </div>
                </section>

                {/* Insights (Placeholder for 'insight' from JSON) */}
                <section>
                     <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="w-4 h-4 text-accent" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Quick Insight</h3>
                    </div>
                    <div className="p-6 bg-accent/5 border border-accent/10 rounded-3xl">
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                            {data.aiInsight || `This resource contains key information regarding the domain of ${data.domain}.`}
                        </p>
                    </div>
                </section>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Processed Just Now</span>
                </div>
                <button className="px-6 py-2 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-all">
                    Add to Collection
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
