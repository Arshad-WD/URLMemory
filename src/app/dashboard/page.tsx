'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Link as LinkIcon, Bell, Trash2, ExternalLink, Clock, Sparkles, X, Search, 
  Check, Plus, Sun, Moon, LogOut, Bookmark, LayoutGrid, List, Star, Tag as TagIcon,
  FileText, CheckSquare, Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReminderModal from '@/components/ReminderModal'
import TagManager from '@/components/TagManager'

import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'

interface Tag {
  id: string
  name: string
  color: string | null
}

interface BookmarkData {
  id: string
  url: string
  title: string | null
  domain: string
  faviconUrl: string | null
  note: string | null
  isFavorite: boolean
  isPinned: boolean
  isReadLater: boolean
  status: 'PENDING' | 'DONE' | 'IGNORED'
  tags: Tag[]
  createdAt: string
  reminder?: {
    scheduledAt: string
    status: 'PENDING' | 'COMPLETED' | 'FAILED'
  }
}

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkData | null>(null)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTagManager, setShowTagManager] = useState(false)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinned' | 'readlater'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'DONE' | 'IGNORED'>('PENDING')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else if (prefersDark) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
    fetchBookmarks()
    fetchTags()
  }, [])

  useEffect(() => {
    if (showAddInput && inputRef.current) inputRef.current.focus()
  }, [showAddInput])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const fetchBookmarks = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedTagId) params.append('tagId', selectedTagId)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const res = await fetch(`/api/bookmarks?${params.toString()}`)
      const data = await res.json()
      if (res.status === 401) { router.push('/auth/login'); return }
      setBookmarks(Array.isArray(data) ? data : [])
    } catch { setBookmarks([]) }
    finally { setLoading(false) }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (res.ok) setTags(data)
    } catch (e) { console.error(e) }
  }

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl) return
    setError('')
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      })
      if (res.status === 401) { router.push('/auth/login'); return }
      if (res.ok) {
        const newItem = await res.json()
        setBookmarks([newItem, ...bookmarks])
        setNewUrl('')
        setShowAddInput(false)
        setSuccess('Saved!')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch { setError('Something went wrong') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' })
    if (res.ok) { setBookmarks(bookmarks.filter(b => b.id !== id)); setSuccess('Deleted') }
  }

  const handleUpdateBookmark = async (id: string, updates: Partial<BookmarkData>) => {
    // Optimistic update
    setBookmarks(bookmarks.map(b => b.id === id ? { ...b, ...updates } : b))
    
    const res = await fetch('/api/bookmarks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    
    if (res.ok) {
      if (updates.isFavorite !== undefined) setSuccess(updates.isFavorite ? 'Starred' : 'Unstarred')
      if (updates.status !== undefined) setSuccess(`Marked as ${updates.status}`)
    } else {
      fetchBookmarks() // Revert on error
    }
  }

  const handleToggleFavorite = (id: string) => {
    const bm = bookmarks.find(b => b.id === id)
    if (bm) handleUpdateBookmark(id, { isFavorite: !bm.isFavorite })
  }

  const handleTogglePin = (id: string) => {
    const bm = bookmarks.find(b => b.id === id)
    if (bm) handleUpdateBookmark(id, { isPinned: !bm.isPinned })
  }

  const handleUpdateStatus = (id: string, status: BookmarkData['status']) => {
    handleUpdateBookmark(id, { status })
  }

  const handleSetReminder = async (date: Date) => {
    if (!selectedBookmark) return
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarkId: selectedBookmark.id, scheduledAt: date.toISOString() })
    })
    if (res.ok) { fetchBookmarks(); setShowReminderModal(false); setSelectedBookmark(null); setSuccess('Reminder set!') }
  }

  const filteredBookmarks = bookmarks
    .filter(b => {
      if (filter === 'favorites') return b.isFavorite
      if (filter === 'pinned') return b.isPinned
      if (filter === 'readlater') return b.isReadLater
      return true
    })
    .filter(b => !selectedTagId || b.tags?.some((t: Tag) => t.id === selectedTagId))
    .filter(b => 
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.note?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const pendingReminders = bookmarks.filter(b => b.reminder?.status === 'PENDING').length
  const favoritesCount = bookmarks.filter(b => b.isFavorite).length

  const formatDate = (d: string) => {
    const date = new Date(d), now = new Date()
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatus = (r: BookmarkData['reminder']) => {
    if (!r) return null
    const now = new Date(), scheduled = new Date(r.scheduledAt)
    if (r.status === 'COMPLETED') return { l: 'Sent', c: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
    if (r.status === 'FAILED') return { l: 'Failed', c: 'bg-red-500/10 text-red-600 dark:text-red-400' }
    if (scheduled <= now) return { l: 'Due', c: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
    return { l: 'Scheduled', c: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-semibold">
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex">

        <DesktopSidebar 
          onAction={() => setShowAddInput(true)} 
          actionLabel="Add New Link"
        >
          <button onClick={() => setFilter('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${filter === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
            <Bookmark className="w-5 h-5" /> All Links
            <span className="ml-auto text-sm bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{bookmarks.length}</span>
          </button>
          <button onClick={() => setFilter('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${filter === 'favorites' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
            <Star className="w-5 h-5" /> Favorites
            <span className="ml-auto text-sm bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{favoritesCount}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" /> Reminders
            {pendingReminders > 0 && <span className="ml-auto text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full">{pendingReminders}</span>}
          </button>
          <button onClick={() => setShowTagManager(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <TagIcon className="w-5 h-5 text-indigo-500" /> Manage Tags
          </button>
        </DesktopSidebar>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
            <div className="px-4 lg:px-8 py-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="lg:hidden w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by title, domain, or notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-400'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-400'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tag Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button onClick={() => setSelectedTagId(null)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${!selectedTagId ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                  All Tags
                </button>
                {tags.map(tag => (
                  <button key={tag.id} onClick={() => setSelectedTagId(tag.id === selectedTagId ? null : tag.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedTagId === tag.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || '#6366f1' }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="p-4 lg:p-8 pb-32 lg:pb-8 space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-3xl flex items-center justify-center mb-6 rotate-6">
                  <Bookmark className="w-12 h-12 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{searchQuery ? 'No results' : filter === 'favorites' ? 'No favorites yet' : 'Empty Library'}</h2>
                <p className="text-gray-500 max-w-xs">{searchQuery ? 'Try different keywords' : 'Save job links, articles, or notes here'}</p>
              </motion.div>
            ) : (
              <>
                {/* Pinned Section */}
                {filteredBookmarks.some(b => b.isPinned) && (
                  <section>
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-indigo-500" /> Pinned
                    </h2>
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : ''}`}>
                      <AnimatePresence mode="popLayout">
                        {filteredBookmarks.filter(b => b.isPinned).map((bm, i) => (
                          <BookmarkCard key={bm.id} bm={bm} i={i} viewMode={viewMode} onUpdate={handleUpdateBookmark} onDelete={handleDelete} onReminder={() => { setSelectedBookmark(bm); setShowReminderModal(true) }} allTags={tags} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* Overdue Section */}
                {filteredBookmarks.some(b => b.reminder && new Date(b.reminder.scheduledAt) < new Date() && b.reminder.status === 'PENDING') && (
                   <section>
                    <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Bell className="w-4 h-4" /> Overdue
                    </h2>
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : ''}`}>
                      <AnimatePresence mode="popLayout">
                        {filteredBookmarks.filter(b => b.reminder && new Date(b.reminder.scheduledAt) < new Date() && b.reminder.status === 'PENDING').map((bm, i) => (
                          <BookmarkCard key={bm.id} bm={bm} i={i} viewMode={viewMode} onUpdate={handleUpdateBookmark} onDelete={handleDelete} onReminder={() => { setSelectedBookmark(bm); setShowReminderModal(true) }} allTags={tags} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* All or Remaining Section */}
                <section>
                   <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                      Recently Added
                   </h2>
                   <div className={`grid gap-4 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : ''}`}>
                    <AnimatePresence mode="popLayout">
                      {filteredBookmarks.filter(b => !b.isPinned).map((bm, i) => (
                        <BookmarkCard key={bm.id} bm={bm} i={i} viewMode={viewMode} onUpdate={handleUpdateBookmark} onDelete={handleDelete} onReminder={() => { setSelectedBookmark(bm); setShowReminderModal(true) }} allTags={tags} />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      <BottomNav onAddClick={() => setShowAddInput(true)} />

      {/* Add Modal */}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddInput && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddInput(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed inset-x-4 bottom-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-md z-50">
              <form onSubmit={handleAddBookmark} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Save a link</h3>
                  </div>
                  <button type="button" onClick={() => setShowAddInput(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input ref={inputRef} type="url" placeholder="https://example.com" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} disabled={isSubmitting}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting || !newUrl}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl disabled:opacity-50 shadow-lg shadow-indigo-500/25">
                  {isSubmitting ? 'Saving...' : 'Save to Library'}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ReminderModal isOpen={showReminderModal} onClose={() => { setShowReminderModal(false); setSelectedBookmark(null) }} onSave={handleSetReminder} bookmarkTitle={selectedBookmark?.title || null} />
      <TagManager isOpen={showTagManager} onClose={() => setShowTagManager(false)} tags={tags} onRefresh={fetchTags} />
    </div>
  )
}

function BookmarkCard({ bm, i, viewMode, onUpdate, onDelete, onReminder, allTags }: {
  bm: BookmarkData
  i: number
  viewMode: 'grid' | 'list'
  onUpdate: (id: string, updates: Partial<BookmarkData>) => void
  onDelete: (id: string) => void
  onReminder: () => void
  allTags: Tag[]
}) {
  const [showTagSelector, setShowTagSelector] = useState(false)
  const formatDate = (d: string) => {
    const date = new Date(d), now = new Date()
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatus = (r: BookmarkData['reminder']) => {
    if (!r) return null
    const now = new Date(), scheduled = new Date(r.scheduledAt)
    if (r.status === 'COMPLETED') return { l: 'Sent', c: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
    if (r.status === 'FAILED') return { l: 'Failed', c: 'bg-red-500/10 text-red-600 dark:text-red-400' }
    if (scheduled <= now) return { l: 'Due', c: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
    return { l: 'Scheduled', c: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' }
  }

  return (
    <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.02 }}
      className={`group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 ${viewMode === 'list' ? 'flex items-center p-4 gap-4' : 'p-5'}`}>
      <div className={`${viewMode === 'list' ? 'w-12 h-12' : 'w-14 h-14 mb-4'} rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 relative`}>
        {bm.faviconUrl ? <img src={bm.faviconUrl} alt="" className="w-7 h-7 object-contain" /> : <LinkIcon className="w-6 h-6 text-gray-400" />}
        <div className="absolute -top-1 -right-1 flex gap-1">
          {bm.isPinned && <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500" />}
          {bm.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{bm.domain}</span>
          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(bm.createdAt)}</span>
          {bm.reminder && getStatus(bm.reminder) && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatus(bm.reminder)!.c}`}>
              <Bell className="w-2.5 h-2.5" /> {getStatus(bm.reminder)!.l}
            </span>
          )}
          {bm.status !== 'PENDING' && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bm.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'}`}>
              {bm.status}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {bm.title || 'Untitled'}
        </h3>

        {bm.tags && bm.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {bm.tags.map(tag => (
              <span key={tag.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium border" style={{ borderColor: `${tag.color}40`, backgroundColor: `${tag.color}10`, color: tag.color || 'inherit' }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showTagSelector && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 py-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => {
                  const isAssigned = bm.tags?.some(t => t.id === tag.id)
                  return (
                    <button key={tag.id} onClick={() => {
                      const newTagIds = isAssigned 
                        ? bm.tags.filter(t => t.id !== tag.id).map(t => t.id)
                        : [...(bm.tags?.map(t => t.id) || []), tag.id]
                      onUpdate(bm.id, { tagIds: newTagIds } as any)
                    }} className={`px-2 py-1 rounded-full text-[9px] font-bold border transition-all ${isAssigned ? 'bg-indigo-500 text-white border-indigo-500' : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-700'}`}>
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={`flex items-center gap-1 overflow-x-auto no-scrollbar ${viewMode === 'list' ? '' : 'mt-4 pt-4 border-t border-gray-100 dark:border-slate-800'}`}>
          <a href={bm.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
          <button onClick={() => onUpdate(bm.id, { isPinned: !bm.isPinned })} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${bm.isPinned ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}>
            <Sparkles className={`w-3.5 h-3.5 ${bm.isPinned ? 'fill-indigo-500' : ''}`} />
          </button>
          <button onClick={() => onUpdate(bm.id, { isFavorite: !bm.isFavorite })} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${bm.isFavorite ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}>
            <Star className={`w-3.5 h-3.5 ${bm.isFavorite ? 'fill-yellow-500' : ''}`} />
          </button>
          <button onClick={() => setShowTagSelector(!showTagSelector)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${showTagSelector ? 'text-indigo-500 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'}`}>
            <TagIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={onReminder} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onUpdate(bm.id, { status: bm.status === 'DONE' ? 'PENDING' : 'DONE' })} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${bm.status === 'DONE' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(bm.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
