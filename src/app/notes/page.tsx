'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Plus, Search, FileText, Trash2, Save, X, 
    Maximize2, Minimize2, Sparkles, Clock, Globe,
    LayoutGrid, List, ChevronRight, Share2, MoreVertical,
    Mic, MicOff
} from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import BottomNav from '@/components/BottomNav'

interface Note {
    id: string
    title: string | null
    content: string
    createdAt: string
    updatedAt: string
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        setMounted(true)
        fetchNotes()
        
        // Initialize Speech Recognition
        if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
            const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setNewContent(prev => prev + event.results[i][0].transcript + ' ')
                    } else {
                        interimTranscript += event.results[i][0].transcript
                    }
                }
            }

            recognitionRef.current.onend = () => setIsRecording(false)
        }
    }, [])

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
        } else {
            recognitionRef.current?.start()
            setIsRecording(true)
        }
    }

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes')
            const data = await res.json()
            setNotes(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newContent) return
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, content: newContent })
            })
            if (res.ok) {
                setNewTitle('')
                setNewContent('')
                setIsCreating(false)
                fetchNotes()
            }
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
        if (res.ok) fetchNotes()
    }

    const filteredNotes = notes.filter(n => 
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-32 lg:pb-0">
            
            <div className="flex">
                <DesktopSidebar onAction={() => setIsCreating(true)} actionLabel="New Cipher" />

                <main className="flex-1 lg:ml-72 min-h-screen">
                    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-3xl border-b border-white/5">
                        <div className="px-6 lg:px-12 h-24 flex items-center justify-between gap-8">
                            <div className="flex-1 max-w-2xl relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="SEARCH_CIPHER_LOGS..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-16 pr-8 py-4 rounded-full bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white/10 text-sm outline-none transition-all font-medium" 
                                />
                            </div>

                            <div className="hidden md:flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'}`}>
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'}`}>
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 lg:px-12 py-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48 gap-8">
                                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-glow" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.8em] animate-pulse italic">Accessing Archives</p>
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-48 text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/10">
                                    <FileText className="w-12 h-12 text-primary/30" />
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Archives Empty</h2>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Initialize first encrypted record</p>
                            </div>
                        ) : (
                            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                <AnimatePresence mode="popLayout">
                                    {filteredNotes.map((note, i) => (
                                        <motion.article 
                                            key={note.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            className="bento-card group flex flex-col h-[350px]"
                                        >
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setSelectedNote(note)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                                        <Maximize2 className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    <button onClick={() => handleDelete(note.id)} className="p-3 bg-white/5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {note.title || 'UNTITLED_LOG'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5 italic">
                                                    {note.content}
                                                </p>
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> {new Date(note.createdAt).toLocaleDateString()}
                                                </span>
                                                <button className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline">
                                                    Decrypt <ChevronRight className="w-3 h-3 inline ml-1" />
                                                </button>
                                            </div>
                                        </motion.article>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100]" />
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-x-6 bottom-12 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-3xl z-[101]">
                            <form onSubmit={handleCreate} className="bento-card p-10 lg:p-16 border-primary/20">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-4xl font-black italic tracking-tighter uppercase">New Cipher</h3>
                                    <button type="button" onClick={() => setIsCreating(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X /></button>
                                </div>
                                <div className="space-y-8">
                                    <input 
                                        type="text" placeholder="LOG_IDENTIFIER..." value={newTitle} 
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 px-8 py-4 rounded-2xl outline-none focus:border-primary/50 text-xl font-black italic tracking-tighter uppercase" 
                                    />
                                    <div className="relative group">
                                        <textarea 
                                            placeholder="INPUT_NEURAL_STREAM..." value={newContent} 
                                            onChange={(e) => setNewContent(e.target.value)}
                                            className="w-full h-64 bg-white/5 border border-white/10 p-8 rounded-[2rem] outline-none focus:border-primary/50 text-base font-medium italic resize-none leading-relaxed" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={toggleRecording}
                                            className={`absolute bottom-6 right-6 p-4 rounded-2xl transition-all shadow-2xl ${isRecording ? 'bg-accent text-accent-foreground animate-pulse' : 'bg-primary text-primary-foreground hover:scale-110'}`}
                                        >
                                            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        </button>
                                        {isRecording && (
                                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-accent">Recording_Active</span>
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" className="w-full btn-premium py-6 text-sm">
                                        Commit to Archive
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav onAddClick={() => setIsCreating(true)} />
        </div>
    )
}
