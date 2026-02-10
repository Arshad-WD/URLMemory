
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react'
import Link from 'next/link'
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24">

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
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Notes
          </h1>
          <button
            onClick={() => {
                resetForm()
                setIsCreating(true)
            }}
            className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Create/Edit Modal or Overlay could be better, but inline expanding for now */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-4"
            >
              <div className="flex justify-between items-start mb-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent text-lg font-semibold placeholder:text-gray-400 dark:placeholder:text-slate-600 outline-none w-full"
                />
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                placeholder="Take a note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent min-h-[120px] outline-none resize-none text-gray-600 dark:text-slate-300 placeholder:text-gray-400 dark:placeholder:text-slate-600"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {notes.map((note) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-800 transition-all cursor-pointer"
                onClick={() => startEditing(note)}
              >
                {note.title && (
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 truncate">
                    {note.title}
                  </h3>
                )}
                <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                   <span className="text-xs text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString()}
                   </span>
                   <button
                     onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                     }}
                     className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!loading && notes.length === 0 && !isCreating && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No notes yet</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Tap the + button to create one</p>
          </div>
        )}
      </main>
        </div>
      </div>

      <BottomNav onAddClick={() => setIsCreating(true)} />
    </div>
  )
}

function FileText({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
