
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, X, Save, FileText, ChevronRight, Hash, Clock, MoreVertical } from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import BottomNav from '@/components/BottomNav'

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
    if (!content.trim()) return

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
    }
  }

  const handleUpdate = async (id: string) => {
    if (!content.trim()) return

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
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

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
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 pb-24 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => {
            resetForm()
            setIsCreating(true)
          }} 
          actionLabel="Create Note"
        />
        
        <div className="flex-1 lg:ml-72 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-gray-100 dark:border-slate-900/50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Notes
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium pt-0.5">
                  Your creative space
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-slate-900/80 px-4 py-2 rounded-2xl border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-48 text-gray-600 dark:text-slate-300 placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => {
                      resetForm()
                      setIsCreating(true)
                  }}
                  className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Note Creation/Editing UI */}
            <AnimatePresence>
              {isCreating && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={resetForm}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                          <input
                            type="text"
                            placeholder="Title (Optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-2xl font-bold placeholder:text-gray-300 dark:placeholder:text-slate-700 outline-none w-full text-gray-900 dark:text-slate-100"
                          />
                          <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 bg-gray-50 dark:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <textarea
                          placeholder="Start writing..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full bg-transparent min-h-[300px] outline-none resize-none text-lg text-gray-600 dark:text-slate-300 placeholder:text-gray-300 dark:placeholder:text-slate-700 leading-relaxed"
                          autoFocus
                        />
                      </div>
                      <div className="px-8 py-6 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-4 text-gray-400">
                          <button className="hover:text-indigo-600 transition-colors"><Hash className="w-5 h-5" /></button>
                          <button className="hover:text-indigo-600 transition-colors"><Clock className="w-5 h-5" /></button>
                        </div>
                        <button
                          onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-semibold shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                          <Save className="w-5 h-5" />
                          {editingId ? 'Update Note' : 'Create Note'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div
                    layout
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-white dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 border border-gray-100 dark:border-slate-900 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                    onClick={() => startEditing(note)}
                  >
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                      {note.title ? (
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-3 truncate group-hover:text-indigo-600 transition-colors text-lg">
                          {note.title}
                        </h3>
                      ) : (
                        <h3 className="font-medium text-gray-400 dark:text-slate-500 mb-3 italic">
                          Untitled Note
                        </h3>
                      )}
                      
                      <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-5 whitespace-pre-wrap">
                        {note.content}
                      </p>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50/50 dark:border-slate-800/10">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(note.id)
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {!loading && filteredNotes.length === 0 && (
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-900/50 rounded-[32px] flex items-center justify-center mx-auto mb-6 rotate-12 group-hover:rotate-0 transition-transform">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  {searchQuery ? 'No matching notes' : 'Your thoughts await'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-xs mx-auto font-medium">
                  {searchQuery ? 'Try searching for something else.' : 'Click the button above to capture your first note.'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="mt-8 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                  >
                    Create a Note
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
