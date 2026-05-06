'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Link as LinkIcon, Bell, Trash2, ExternalLink, Clock, Sparkles, X, Search, 
  Check, Plus, Sun, Moon, LogOut, Bookmark, LayoutGrid, List, Star, Tag as TagIcon,
  FileText, CheckSquare, Users, GripVertical, BrainCircuit, Info, Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReminderModal from '@/components/ReminderModal'
import TagManager from '@/components/TagManager'
import AiInsightsModal from '@/components/AiInsightsModal'

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
  aiSummary: string | null
  aiTags: string[]
  aiInsight: string | null
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
  const [showAiModal, setShowAiModal] = useState(false)
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
    fetchTags()
  }, [])

  useEffect(() => {
    if (mounted) fetchBookmarks()
  }, [statusFilter, selectedTagId, mounted])

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
      if (res.ok) {
        const newItem = await res.json()
        setBookmarks([newItem, ...bookmarks])
        setNewUrl('')
        setShowAddInput(false)
        setSuccess('SYNC_COMPLETE')
      } else {
        const data = await res.json()
        setError(data.error || 'UPLINK_FAILED')
      }
    } catch { setError('NETWORK_EXCEPTION') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' })
    if (res.ok) { setBookmarks(bookmarks.filter(b => b.id !== id)); setSuccess('PURGED') }
  }

  const handleUpdateBookmark = async (id: string, updates: Partial<BookmarkData>) => {
    setBookmarks(bookmarks.map(b => b.id === id ? { ...b, ...updates } : b))
    await fetch('/api/bookmarks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
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
      b.domain.toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-0 selection:bg-primary/20 text-foreground">
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em]"
          >
            <Sparkles className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <DesktopSidebar onAction={() => setShowAddInput(true)} actionLabel="Synthesize URI" />

        <main className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-3xl border-b border-white/5">
            <div className="px-6 lg:px-12 h-24 flex items-center justify-between gap-8">
               <div className="flex-1 max-w-2xl relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="QUERY_NEURAL_DATABASE..." 
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

            <div className="px-6 lg:px-12 py-4 border-t border-white/5 flex items-center gap-4 overflow-x-auto no-scrollbar">
                <button onClick={() => setSelectedTagId(null)} className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${!selectedTagId ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/5 text-muted-foreground border-transparent hover:border-white/20'}`}>
                  Omni
                </button>
                {tags.map(tag => (
                  <button key={tag.id} onClick={() => setSelectedTagId(tag.id === selectedTagId ? null : tag.id)}
                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-3 shrink-0 ${selectedTagId === tag.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/5 text-muted-foreground border-transparent hover:border-white/20'}`}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || 'var(--color-primary)' }} />
                    {tag.name}
                  </button>
                ))}
            </div>
          </header>

          <div className="px-6 lg:px-12 py-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-48 gap-8">
                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-glow" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.8em] animate-pulse italic">Synchronizing</p>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 text-center">
                 <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 rotate-12 border border-white/10 group-hover:rotate-0 transition-transform">
                   <BrainCircuit className="w-12 h-12 text-primary/30" />
                 </div>
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Zero State Detected</h2>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Awaiting first neural uplink</p>
              </div>
            ) : (
              <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence mode="popLayout">
                  {filteredBookmarks.map((bm, i) => (
                    <BookmarkCard key={bm.id} bm={bm} i={i} viewMode={viewMode} onUpdate={handleUpdateBookmark} onDelete={handleDelete} onAi={() => { setSelectedBookmark(bm); setShowAiModal(true) }} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav onAddClick={() => setShowAddInput(true)} />

      <AnimatePresence>
        {showAddInput && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddInput(false)} className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100]" />
            <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="fixed inset-x-6 bottom-12 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-xl z-[101]">
              <div className="bento-card p-10 lg:p-16 border-primary/20">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="text-4xl font-black italic tracking-tighter uppercase">Capture URI</h3>
                   <button onClick={() => setShowAddInput(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X /></button>
                </div>
                <form onSubmit={handleAddBookmark} className="space-y-10">
                   <div className="relative group">
                     <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 group-focus-within:text-primary transition-colors" />
                     <input 
                       ref={inputRef} type="url" placeholder="HTTPS://TARGET_RESOURCE.COM" 
                       value={newUrl} onChange={(e) => setNewUrl(e.target.value)} disabled={isSubmitting}
                       className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-base font-bold italic tracking-tight" 
                     />
                   </div>
                   <button disabled={isSubmitting || !newUrl} type="submit" className="w-full btn-premium py-6 text-sm">
                     {isSubmitting ? 'Injesting Stream...' : 'Synthesize Knowledge'}
                   </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AiInsightsModal isOpen={showAiModal} onClose={() => { setShowAiModal(false); setSelectedBookmark(null) }} data={selectedBookmark} />
      <TagManager isOpen={showTagManager} onClose={() => setShowTagManager(false)} tags={tags} onRefresh={fetchTags} />
      <ReminderModal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} bookmarkTitle={selectedBookmark?.title || null} onSave={() => {}} />
    </div>
  )
}

function BookmarkCard({ bm, i, viewMode, onUpdate, onDelete, onAi }: any) {
  return (
    <motion.article 
      layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className={`bento-card group ${viewMode === 'list' ? 'flex flex-row items-center gap-8 p-6' : 'flex flex-col'}`}
    >
      <div className={`${viewMode === 'list' ? 'w-24 h-24 shrink-0' : 'w-full aspect-video mb-8'} bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-primary/30`}>
         {bm.faviconUrl ? <img src={bm.faviconUrl} alt="" className="w-12 h-12 relative z-10" /> : <Globe className="w-10 h-10 text-white/10" />}
         <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button onClick={() => onUpdate(bm.id, { isFavorite: !bm.isFavorite })} className={`${bm.isFavorite ? 'text-primary' : 'text-white/20 hover:text-primary'} transition-colors`}>
               <Star className={`w-5 h-5 ${bm.isFavorite ? 'fill-current' : ''}`} />
            </button>
         </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 truncate">{bm.domain}</span>
           <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(bm.createdAt).toLocaleDateString()}</span>
        </div>
        <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 group-hover:text-primary transition-colors truncate">{bm.title || 'UNKNOWN_UNIT'}</h3>
        
        {bm.aiSummary && (
          <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-2 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
            {bm.aiSummary}
          </p>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex gap-4">
             <button onClick={onAi} className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:scale-110 transition-transform">
               <Sparkles className="w-4 h-4" />
             </button>
             <a href={bm.url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
               <ExternalLink className="w-4 h-4" />
             </a>
          </div>
          <button onClick={() => onDelete(bm.id)} className="p-3 text-white/20 hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
