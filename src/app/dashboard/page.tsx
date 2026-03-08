'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Link as LinkIcon, Bell, Trash2, ExternalLink, Clock, Sparkles, X, Search, 
  Check, Plus, Sun, Moon, LogOut, Bookmark, LayoutGrid, List, Star, Tag as TagIcon,
  FileText, CheckSquare, Users, GripVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReminderModal from '@/components/ReminderModal'
import TagManager from '@/components/TagManager'

import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import MagneticEffect from '@/components/MagneticEffect'

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

import { useTheme } from '@/components/ThemeProvider'

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme()
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
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinned' | 'readlater'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'DONE' | 'IGNORED'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    fetchBookmarks()
    fetchTags()
  }, [])

  useEffect(() => {
    if (mounted) fetchBookmarks()
  }, [statusFilter, selectedTagId, mounted])

  useEffect(() => {
    if (showAddInput && inputRef.current) inputRef.current.focus()
  }, [showAddInput])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

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

    <div className="min-h-screen bg-background pb-24 selection:bg-primary/10 transition-colors">
      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-xl shadow-emerald-500/20 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex">

        <DesktopSidebar 
          onAction={() => setShowAddInput(true)} 
          actionLabel="Add Link"
        >
          <div className="space-y-1">
            <button onClick={() => setFilter('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${filter === 'all' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
              <Bookmark className="w-5 h-5" strokeWidth={2.5} /> 
              <span className="text-sm">All Links</span>
              <span className="ml-auto text-[10px] bg-muted px-2 py-0.5 rounded-full">{bookmarks.length}</span>
            </button>
            <button onClick={() => setFilter('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${filter === 'favorites' ? 'bg-amber-500/5 text-amber-500' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
              <Star className="w-5 h-5" strokeWidth={2.5} /> 
              <span className="text-sm">Favorites</span>
              <span className="ml-auto text-[10px] bg-muted px-2 py-0.5 rounded-full">{favoritesCount}</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <Bell className="w-5 h-5" strokeWidth={2.5} /> 
              <span className="text-sm">Reminders</span>
              {pendingReminders > 0 && <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{pendingReminders}</span>}
            </button>
            <button onClick={() => setShowTagManager(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <TagIcon className="w-5 h-5 text-primary" strokeWidth={2.5} /> 
              <span className="text-sm">Tags</span>
            </button>
          </div>
        </DesktopSidebar>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-3xl border-b border-border">
            <div className="px-6 h-20 flex items-center justify-between gap-6">
              <div className="flex-1 max-w-xl">
                 <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   <input 
                     type="text" 
                     placeholder="Search library..." 
                     value={searchQuery} 
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-muted/30 border border-transparent focus:border-primary/20 focus:bg-background text-sm outline-none transition-all shadow-inner" 
                   />
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/50">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowAddInput(true)}
                  className="lg:hidden p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header with Filters */}
            <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between bg-background/40">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <button onClick={() => setSelectedTagId(null)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${!selectedTagId ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'}`}>
                    All
                  </button>
                  {tags.map(tag => (
                    <button key={tag.id} onClick={() => setSelectedTagId(tag.id === selectedTagId ? null : tag.id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${selectedTagId === tag.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'}`}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color || 'var(--primary)' }} />
                      {tag.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pl-4 border-l border-border">
                  {(['all', 'PENDING', 'DONE'] as const).map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${statusFilter === s ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'}`}>
                      {s === 'all' ? 'Status' : s}
                    </button>
                  ))}
                </div>
            </div>
          </header>

          <div className="p-6 pb-32 lg:pb-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Loading Library</p>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 bg-muted/60 rounded-[40px] flex items-center justify-center mb-8 rotate-12 transition-transform">
                  <Bookmark className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">{searchQuery ? 'No results' : 'Empty Library'}</h2>
                <p className="text-sm text-muted-foreground max-w-xs font-bold uppercase tracking-wider text-[10px] leading-loose">{searchQuery ? 'Try different keywords' : 'Save your favorite spots on the web'}</p>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* Pinned Section */}
                {filteredBookmarks.some(b => b.isPinned) && (
                  <section>
                    <header className="flex items-center gap-3 mb-6">
                       <Sparkles className="w-4 h-4 text-amber-500" />
                       <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Pinned Links</h2>
                       <div className="h-px flex-1 bg-border/50" />
                    </header>
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                      <AnimatePresence mode="popLayout">
                        {filteredBookmarks.filter(b => b.isPinned).map((bm, i) => (
                          <BookmarkCard key={bm.id} bm={bm} i={i} viewMode={viewMode} onUpdate={handleUpdateBookmark} onDelete={handleDelete} onReminder={() => { setSelectedBookmark(bm); setShowReminderModal(true) }} allTags={tags} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* Main List Section */}
                <section>
                   <header className="flex items-center gap-3 mb-6">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                       <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{filter === 'all' ? 'Your Library' : filter}</h2>
                       <div className="h-px flex-1 bg-border/50" />
                   </header>
                   <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                        <AnimatePresence mode="popLayout" initial={false}>
                        {filteredBookmarks.filter(b => !b.isPinned).map((bm, i) => (
                                <BookmarkCard 
                                    key={bm.id}
                                    bm={bm} 
                                    i={i} 
                                    viewMode={viewMode} 
                                    onUpdate={handleUpdateBookmark} 
                                    onDelete={handleDelete} 
                                    onReminder={() => { setSelectedBookmark(bm); setShowReminderModal(true) }} 
                                    allTags={tags} 
                                />
                        ))}
                        </AnimatePresence>
                    </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav onAddClick={() => setShowAddInput(true)} />

      {/* Add Modal */}
      <AnimatePresence>
        {showAddInput && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddInput(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-colors" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed inset-x-4 bottom-8 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-md z-50">
              <form onSubmit={handleAddBookmark} className="glass-card rounded-[32px] shadow-2xl border border-white/20 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-6">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-foreground">Save Link</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Add to your library</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowAddInput(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      ref={inputRef} 
                      type="url" 
                      placeholder="https://awesome-site.com" 
                      value={newUrl} 
                      onChange={(e) => setNewUrl(e.target.value)} 
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border border-transparent focus:border-primary/20 focus:bg-background outline-none text-foreground font-medium transition-all" 
                    />
                  </div>
                  {error && (
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-rose-500 uppercase tracking-wider pl-1">
                      {error}
                    </motion.p>
                  )}
                  <button 
                    disabled={isSubmitting || !newUrl}
                    type="submit"
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl disabled:opacity-50 shadow-xl shadow-primary/30 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? 'Syncing...' : 'Save to Library'}
                  </button>
                </div>
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
    if (days === 0) return 'T-0D'
    if (days === 1) return 'T-1D'
    if (days < 7) return `T-${days}D`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatus = (r: BookmarkData['reminder']) => {
    if (!r) return null
    const now = new Date(), scheduled = new Date(r.scheduledAt)
    if (r.status === 'COMPLETED') return { l: 'SENT', c: 'bg-emerald-500 text-white' }
    if (r.status === 'FAILED') return { l: 'FAIL', c: 'bg-red-500 text-white' }
    if (scheduled <= now) return { l: 'DUE', c: 'bg-primary text-primary-foreground animate-technical-blink' }
    return { l: 'SCHD', c: 'bg-muted-foreground/20 text-muted-foreground' }
  }

  return (
    <MagneticEffect strength={0.03}>
        <motion.article 
            layout 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            transition={{ delay: i * 0.03 }}
            className={`group bento-card ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'flex flex-col h-full'}`}
        >
            <div className={`relative ${viewMode === 'list' ? 'w-16 h-16' : 'w-full aspect-video mb-4'} bg-muted/40 border-2 border-border overflow-hidden flex items-center justify-center`}>
                {bm.faviconUrl ? (
                    <img src={bm.faviconUrl} alt="" className="w-8 h-8 object-contain z-10" />
                ) : (
                    <LinkIcon className="w-8 h-8 text-muted-foreground/40 z-10" />
                )}
                {/* Technical background pattern local to card */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(var(--color-foreground) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                
                <div className="absolute top-2 right-2 flex gap-1 z-20">
                    {bm.isPinned && <div className="w-2 h-2 bg-primary animate-technical-blink shadow-[0_0_8px_var(--color-primary)]" />}
                    {bm.isFavorite && <Star className="w-4 h-4 text-primary fill-primary" />}
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[120px]">
                        {bm.domain}
                    </span>
                    <span className="text-[10px] font-black text-primary px-1 border border-primary/20">
                        {formatDate(bm.createdAt)}
                    </span>
                </div>

                <h3 className="text-sm font-black mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {bm.title || 'UNTITLED_RESOURCE'}
                </h3>

                <div className="flex flex-wrap gap-1 mt-auto pb-4">
                    {bm.tags?.map(tag => (
                        <span key={tag.id} className="text-[9px] font-bold px-1.5 py-0.5 border border-foreground/10 bg-foreground/[0.03]">
                            #{tag.name.toUpperCase()}
                        </span>
                    ))}
                    {bm.reminder && getStatus(bm.reminder) && (
                        <span className={`status-indicator ${getStatus(bm.reminder)!.c}`}>
                            {getStatus(bm.reminder)!.l}
                        </span>
                    )}
                </div>

                <div className="pt-4 border-t-2 border-border flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                        <MagneticEffect strength={0.2}>
                            <button onClick={() => onUpdate(bm.id, { isFavorite: !bm.isFavorite })} className={`p-1.5 border-2 transition-all ${bm.isFavorite ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}>
                                <Star className={`w-3.5 h-3.5 ${bm.isFavorite ? 'fill-primary' : ''}`} />
                            </button>
                        </MagneticEffect>
                        <MagneticEffect strength={0.2}>
                            <a href={bm.url} target="_blank" rel="noreferrer" className="p-1.5 border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </MagneticEffect>
                    </div>

                    <button 
                        onClick={() => onDelete(bm.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.article>
    </MagneticEffect>
  )
}
