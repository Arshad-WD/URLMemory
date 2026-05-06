'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Tag as TagIcon, Check, Sparkles, Hash } from 'lucide-react'

interface Tag {
    id: string
    name: string
    color: string | null
}

interface TagManagerProps {
    isOpen: boolean
    onClose: () => void
    tags: Tag[]
    onRefresh: () => void
}

const COLORS = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', 
    '#8b5cf6', '#3b82f6', '#06b6d4', '#4ade80', '#fbbf24'
]

export default function TagManager({ isOpen, onClose, tags, onRefresh }: TagManagerProps) {
    const [newName, setNewName] = useState('')
    const [selectedColor, setSelectedColor] = useState(COLORS[0])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName) return
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, color: selectedColor })
            })
            if (res.ok) {
                setNewName('')
                onRefresh()
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' })
        if (res.ok) onRefresh()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[120]" />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 30 }} 
                        className="fixed left-4 right-4 bottom-8 lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-xl bg-card/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/10 p-10 lg:p-12 z-[121]"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 animate-glow">
                                    <Hash className="w-8 h-8 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Taxonomy Core</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">Neural Category Index</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                <X className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-10 mb-12">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2">Identify New Category</label>
                                <div className="relative group">
                                    <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)} 
                                        placeholder="INPUT_TAG_IDENTIFIER..."
                                        className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/5 border border-white/5 focus:border-primary/40 focus:bg-white/10 outline-none text-sm font-black uppercase italic tracking-tighter transition-all" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2">Spectral Assignment</label>
                                <div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                                    {COLORS.map(color => (
                                        <button 
                                            key={color} 
                                            type="button" 
                                            onClick={() => setSelectedColor(color)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-125 hover:rotate-12 relative overflow-hidden" 
                                            style={{ backgroundColor: color }}
                                        >
                                            {selectedColor === color && (
                                                <div className="absolute inset-0 bg-white/20 flex items-center justify-center backdrop-blur-[2px]">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                disabled={isSubmitting || !newName}
                                className="w-full py-5 bg-primary text-primary-foreground font-black rounded-3xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-xs italic disabled:opacity-50"
                            >
                                {isSubmitting ? 'Syncing Taxonomy...' : 'Commit New Category'}
                            </button>
                        </form>

                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 no-scrollbar border-t border-white/5 pt-8">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mb-6">Existing Classifications</p>
                            {tags.length === 0 && (
                                <div className="text-center py-10 opacity-30 italic uppercase text-[10px] tracking-widest">
                                    Zero Classifications Detected
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tags.map(tag => (
                                    <div key={tag.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: tag.color || '#6366f1', boxShadow: `0 0 15px ${tag.color || '#6366f1'}66` }} />
                                            <span className="font-black uppercase italic tracking-tight text-sm">{tag.name}</span>
                                        </div>
                                        <button onClick={() => handleDelete(tag.id)} className="p-2.5 text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
