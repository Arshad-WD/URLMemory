'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, X, Save, FileText, ChevronRight, Hash, Clock, MoreVertical } from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import BottomNav from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'
import MagneticEffect from '@/components/MagneticEffect'

interface Note {
  id: string
  title: string | null
  content: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme } = useTheme()
  
  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes')
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch notes', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (res.ok) {
        const newNote = await res.json()
        setNotes([newNote, ...notes])
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create note', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (res.ok) {
        const updatedNote = await res.json()
        setNotes(notes.map(n => n.id === id ? updatedNote : n))
        setEditingId(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update note', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('DELETE_CONFIRMATION_REQUIRED?')) return

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete note', error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setTitle(note.title || '')
    setContent(note.content)
    setIsCreating(true)
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setIsCreating(false)
    setEditingId(null)
  }

  const filteredNotes = notes.filter(note => 
    (note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/10">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => {
            resetForm()
            setIsCreating(true)
          }} 
          actionLabel="New Note"
        />
        
        <div className="flex-1 lg:ml-72 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-2 border-border pb-6 pt-10 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <FileText className="text-primary-foreground w-6 h-6" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">Cipher<span className="text-primary">.LOG</span></h1>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none flex items-center gap-2 bg-card border-2 border-border px-4 py-2 shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="SEARCH_INDEX..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-industrial border-none bg-transparent"
                  />
                </div>
                <MagneticEffect strength={0.2}>
                  <button
                    onClick={() => {
                        resetForm()
                        setIsCreating(true)
                    }}
                    className="btn-industrial p-3"
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </button>
                </MagneticEffect>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-12">
            {/* Note Creation/Editing UI */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8"
                  onClick={resetForm}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 40 }}
                    className="w-full max-w-4xl bg-card border-2 border-border shadow-[12px_12px_0px_0px_var(--color-border)] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8">
                        <input
                          type="text"
                          placeholder="TITLE_HEADER (OPTIONAL)"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-transparent text-3xl font-black placeholder:text-muted-foreground/20 outline-none text-foreground uppercase italic tracking-tighter"
                        />
                        <button onClick={resetForm} className="p-2 border-2 border-transparent hover:border-border transition-all">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <textarea
                        placeholder="BEGIN_DATA_STREAMING..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-transparent min-h-[400px] outline-none resize-none text-lg text-foreground placeholder:text-muted-foreground/20 leading-relaxed font-mono"
                        autoFocus
                      />
                    </div>
                    <div className="px-8 py-6 bg-muted/30 border-t-2 border-border flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ENCRYPTION: AES-256</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">STATUS: BUFFERING</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                          disabled={isSubmitting || !content.trim()}
                          className="btn-industrial px-8 py-3 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-5 h-5" />
                          <span>{isSubmitting ? 'WORKING...' : (editingId ? 'OVERWRITE' : 'COMMIT')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div
                    layout
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bento-card group p-8 cursor-pointer relative"
                    onClick={() => startEditing(note)}
                  >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                            DOC_{note.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h3 className={`text-xl font-black uppercase italic tracking-tight mb-4 group-hover:text-primary transition-colors truncate ${!note.title ? 'text-muted-foreground/30' : 'text-foreground'}`}>
                      {note.title || 'UNTITLED_RECORD'}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-6 font-mono opacity-80 group-hover:opacity-100 transition-opacity whitespace-pre-wrap">
                      {note.content}
                    </p>

                    <div className="mt-8 pt-6 border-t border-border flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(note.id)
                        }}
                        className="p-2 border-2 border-transparent hover:border-red-500/20 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {!loading && filteredNotes.length === 0 && (
              <div className="text-center py-40 border-2 border-dashed border-border">
                <div className="w-24 h-24 bg-muted/40 flex items-center justify-center mx-auto mb-8 border-2 border-border rotate-12">
                  <FileText className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-4">
                  {searchQuery ? 'ZERO_MATCHES' : 'CLEAN_SLATE'}
                </h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">
                  {searchQuery ? 'SEARCH_QUERY_UNRESOLVED' : 'AWAITING_INPUT_STREAM'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="btn-industrial px-8 py-3 mt-8"
                  >
                    INITIALIZE_NEW_DOC
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <BottomNav onAddClick={() => setIsCreating(true)} />
    </div>
  )
}
