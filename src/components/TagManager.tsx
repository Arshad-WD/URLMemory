'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Tag as TagIcon, Check } from 'lucide-react'

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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80]" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 p-8 z-[81]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TagIcon className="w-6 h-6 text-indigo-500" /> Manage Tags
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tag Name</label>
                                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Work, Jobs, Read Later"
                                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map(color => (
                                        <button key={color} type="button" onClick={() => setSelectedColor(color)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: color }}>
                                            {selectedColor === color && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting || !newName}
                                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all">
                                {isSubmitting ? 'Creating...' : 'Create Tag'}
                            </motion.button>
                        </form>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                            {tags.length === 0 && <p className="text-center text-gray-500 py-4 italic text-sm">No tags yet</p>}
                            {tags.map(tag => (
                                <div key={tag.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color || '#6366f1' }} />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{tag.name}</span>
                                    </div>
                                    <button onClick={() => handleDelete(tag.id)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
