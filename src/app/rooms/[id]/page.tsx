
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, FileText, CheckSquare, Bookmark, Users, 
  Settings, Loader2, Plus, Trash2, Copy, Check, LogOut, ExternalLink, MoreVertical, Shield, UserPlus,
  Globe, Clock, Activity, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import MagneticEffect from '@/components/MagneticEffect'

// Types
interface Room {
  id: string
  name: string
  description: string
  currentUserRole: string
}

interface RoomMember {
  id: string
  userId: string
  role: string
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

interface Note { id: string; title: string; content: string; updatedAt: string }
interface Todo { id: string; task: string; isDone: boolean }
interface RoomBookmark { id: string; url: string; title?: string; note?: string }

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { theme } = useTheme()

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'todos' | 'members'>('bookmarks')
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [members, setMembers] = useState<RoomMember[]>([])
  const [bookmarks, setBookmarks] = useState<RoomBookmark[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  
  // Input states
  const [inputUrl, setInputUrl] = useState('')
  const [inputTitle, setInputTitle] = useState('')
  const [inputContent, setInputContent] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  // UI state
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Polling ref
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchRoomDetails()
    startPolling()
    return () => stopPolling()
  }, [roomId])

  useEffect(() => {
    if (room) fetchDataForTab(activeTab)
  }, [activeTab, room])

  const startPolling = () => {
    pollInterval.current = setInterval(() => {
      if (document.visibilityState === 'visible' && roomId) {
        fetchDataForTab(activeTab)
      }
    }, 5000) 
  }

  const stopPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current)
  }

  const fetchRoomDetails = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`)
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) router.push('/rooms')
        return
      }
      const data = await res.json()
      setRoom(data)
    } catch (error) {
      console.error('Failed to fetch room', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataForTab = async (tab: string) => {
    if (!roomId) return
    try {
      let endpoint = ''
      switch (tab) {
        case 'members': endpoint = `/api/rooms/${roomId}/members`; break
        case 'bookmarks': endpoint = `/api/rooms/${roomId}/bookmarks`; break
        case 'notes': endpoint = `/api/notes?roomId=${roomId}`; break
        case 'todos': endpoint = `/api/todos?roomId=${roomId}`; break
      }
      
      if (endpoint) {
          const res = await fetch(endpoint)
          if (res.ok) {
              const data = await res.json()
              if (tab === 'members') setMembers(data)
              if (tab === 'bookmarks') setBookmarks(data)
              if (tab === 'notes') setNotes(data)
              if (tab === 'todos') setTodos(data)
          }
      }
    } catch (err) {
      console.error('Poll error', err)
    }
  }

  const handleCreate = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      let res;
      if (activeTab === 'todos') {
        if (!inputTitle.trim()) return
        res = await fetch('/api/todos', {
          method: 'POST', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ task: inputTitle, roomId }) 
        })
      } else if (activeTab === 'notes') {
        if (!inputTitle.trim()) return
        res = await fetch('/api/notes', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ title: inputTitle, content: inputContent, roomId })
        })
      } else if (activeTab === 'bookmarks') {
         if (!inputUrl.trim()) return
         res = await fetch(`/api/rooms/${roomId}/bookmarks`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ url: inputUrl, note: inputContent }) 
        })
      }

      if (res?.ok) {
        setInputUrl('')
        setInputTitle('')
        setInputContent('')
        fetchDataForTab(activeTab)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleAddMember = async () => {
    if (!inviteEmail.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/members`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: inviteEmail })
      })
      if (res.ok) {
        setInviteEmail('')
        fetchDataForTab('members')
      }
    } catch (e) { console.error(e) }
    finally { setIsSubmitting(false) }
  }

  const handleLeaveRoom = async () => {
    if (!confirm('CONFIRM_LEAVE_PROTOCOL?') || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/members`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/rooms')
      } else {
        const text = await res.text()
        alert(text || 'Failed to leave room')
      }
    } catch (e) {
      console.error(e)
      alert('Error leaving room')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRoom = async () => {
    if (!confirm('⚠️ EXTREME_CAUTION: PERMANENT_ERASURE_INITIATED. CONTINUE?')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/rooms')
      } else {
        alert('Failed to delete room')
      }
    } catch (e) {
      console.error(e)
      alert('Error deleting room')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading || isDeleting) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
        {isDeleting ? 'ERASING_DATA_CORES...' : 'ACCESSING_SECURE_VAULT...'}
      </p>
    </div>
  )

  if (!room) return null

  const isOwner = room.currentUserRole === 'OWNER'

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/rooms" className="group p-3 border-2 border-border hover:border-primary transition-all">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none flex items-center gap-3">
                {room.name}<span className="text-primary text-xs font-black">.NXS</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest ${
                    isOwner ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'
                }`}>
                    {room.currentUserRole}
                </span>
                <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3 text-primary" /> MISSION_STATUS: ACTIVE
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-card border-2 border-border p-1 shadow-[4px_4px_0px_0px_var(--color-border)]">
                {[
                { id: 'bookmarks', icon: Bookmark, label: 'LINKS' },
                { id: 'notes', icon: FileText, label: 'DATA' },
                { id: 'todos', icon: CheckSquare, label: 'TASKS' },
                { id: 'members', icon: Users, label: 'UNITS' },
                ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === item.id 
                        ? 'bg-primary text-primary-foreground italic' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                    <item.icon className="w-3.5 h-3.5" strokeWidth={3} />
                    <span className="hidden md:inline">{item.label}</span>
                </button>
                ))}
            </div>

            <div className="flex items-center gap-2 ml-4">
                 {isOwner ? (
                     <button 
                        onClick={handleDeleteRoom}
                        title="TERMINATE_ROOM"
                        className="p-3 border-2 border-transparent hover:border-red-500/20 text-muted-foreground hover:text-red-500 transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 ) : (
                    <button 
                        onClick={handleLeaveRoom}
                        title="LEAVE_PROTOCOL"
                        className="p-3 border-2 border-transparent hover:border-red-500/20 text-muted-foreground hover:text-red-500 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                 )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Mobile Tab Bar */}
        <div className="sm:hidden flex bg-card border-2 border-border p-1.5 mb-8 shadow-[4px_4px_0px_0px_var(--color-border)] overflow-x-auto no-scrollbar">
            {[
                { id: 'bookmarks', icon: Bookmark },
                { id: 'notes', icon: FileText },
                { id: 'todos', icon: CheckSquare },
                { id: 'members', icon: Users },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex-1 flex items-center justify-center p-4 transition-all ${
                        activeTab === item.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground'
                    }`}
                >
                    <item.icon className="w-5 h-5" strokeWidth={3} />
                </button>
            ))}
        </div>

        {/* Input Area */}
        {activeTab !== 'members' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-card border-2 border-border p-8 shadow-[8px_8px_0px_0px_var(--color-border)]"
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {activeTab === 'bookmarks' && (
                <div className="flex-1 flex items-center gap-4 bg-background border-2 border-border px-6 py-4 focus-within:border-primary transition-all shadow-[4px_4px_0px_0px_var(--color-border)]">
                    <Bookmark className="w-5 h-5 text-muted-foreground/40" />
                    <input 
                    placeholder="ENTER_RESOURCE_URL..." 
                    className="flex-1 bg-transparent outline-none text-base font-black uppercase italic tracking-tighter"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    />
                </div>
              )}
              {(activeTab === 'todos' || activeTab === 'notes') && (
                <div className="flex-1 flex items-center gap-4 bg-background border-2 border-border px-6 py-4 focus-within:border-primary transition-all shadow-[4px_4px_0px_0px_var(--color-border)]">
                    {activeTab === 'todos' ? <CheckSquare className="w-5 h-5 text-muted-foreground/40" /> : <FileText className="w-5 h-5 text-muted-foreground/40" />}
                    <input 
                    placeholder={activeTab === 'todos' ? "ASSIGN_COLLABORATIVE_TASK..." : "INITIALIZE_SHARED_RECORD..."} 
                    className="flex-1 bg-transparent outline-none text-base font-black uppercase italic tracking-tighter"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    />
                </div>
              )}
              <MagneticEffect strength={0.2}>
                <button 
                    onClick={handleCreate}
                    disabled={isSubmitting || !(inputUrl || inputTitle)}
                    className="btn-industrial px-8 py-4 disabled:opacity-50"
                >
                    <Plus className="w-7 h-7" strokeWidth={4} />
                </button>
              </MagneticEffect>
            </div>
            {(activeTab === 'notes' || activeTab === 'bookmarks') && (
               <div className="bg-background border-2 border-border p-6 shadow-[4px_4px_0px_0px_var(--color-border)]">
                   <textarea 
                   placeholder={activeTab === 'bookmarks' ? "METADATA_NOTES (OPTIONAL)..." : "DATA_STREAM_CONTENT..."}
                   className="w-full bg-transparent outline-none h-32 resize-none text-sm font-mono leading-relaxed"
                   value={inputContent}
                   onChange={(e) => setInputContent(e.target.value)}
                   />
               </div>
            )}
          </motion.div>
        )}

        {/* Content Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <AnimatePresence mode="popLayout">
             {activeTab === 'bookmarks' && bookmarks.map(b => (
               <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={b.id} 
                className="bento-card group p-8"
               >
                  <div className="flex items-start gap-6">
                    <div className="p-4 bg-muted/40 border-2 border-border text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Bookmark className="w-7 h-7" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">ID_{b.id.slice(-6).toUpperCase()}</span>
                            <div className="flex items-center gap-1.5">
                                <Globe className="w-3 h-3 text-primary" />
                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tight truncate">{new URL(b.url).hostname}</span>
                            </div>
                        </div>
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xl font-black uppercase italic tracking-tighter text-foreground hover:text-primary transition-colors block leading-tight mb-4">
                            {b.title || b.url}
                        </a>
                        {b.note && (
                            <div className="p-4 bg-muted/20 border-l-4 border-primary/30">
                                <p className="text-xs text-muted-foreground font-mono leading-relaxed">{b.note}</p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <a href={b.url} target="_blank" className="p-2 border-2 border-border hover:border-primary text-muted-foreground hover:text-primary transition-all">
                                <ExternalLink className="w-4 h-4" strokeWidth={3} />
                            </a>
                        </div>
                    </div>
                  </div>
               </motion.div>
             ))}

             {activeTab === 'todos' && todos.map(t => (
               <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={t.id} 
                className={`bento-card p-6 flex items-center gap-6 transition-all ${
                    t.isDone ? 'opacity-40 grayscale' : ''
                }`}
               >
                  <button className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${
                    t.isDone ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  }`}>
                    {t.isDone && <Check className="w-5 h-5" strokeWidth={4} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">TASK_{t.id.slice(-6).toUpperCase()}</div>
                    <h3 className={`font-black text-lg uppercase italic tracking-tight ${t.isDone ? 'line-through' : ''}`}>
                        {t.task}
                    </h3>
                  </div>
                  {t.isDone && <span className="text-[8px] font-black italic text-primary uppercase tracking-[0.3em] px-2 py-1 bg-primary/10 border border-primary/30"> RESOLVED</span>}
               </motion.div>
             ))}

             {activeTab === 'notes' && notes.map(n => (
               <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={n.id} 
                className="bento-card group p-8"
               >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">DOC_{n.id.slice(-6).toUpperCase()}</span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h3 className="font-black text-2xl uppercase italic tracking-tighter text-foreground mb-6 group-hover:text-primary transition-colors">{n.title}</h3>
                  <div className="p-6 bg-muted/20 border-2 border-border min-h-[160px]">
                    <p className="text-muted-foreground text-sm font-mono leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  </div>
               </motion.div>
             ))}

             {activeTab === 'members' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-2 space-y-12 max-w-3xl mx-auto w-full"
               >
                  {(room.currentUserRole === 'OWNER' || room.currentUserRole === 'ADMIN') && (
                    <div className="bg-card border-2 border-border p-10 shadow-[10px_10px_0px_0px_var(--color-border)]">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-14 h-14 bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
                                <UserPlus className="w-7 h-7" strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">EXPAND_COALITION</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">RECRUIT_NEW_UNITS_TO_VAULT</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <input 
                                placeholder="IDENTIFIER@TERMINAL.IO" 
                                className="flex-1 input-industrial py-4 uppercase font-bold italic"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                            />
                            <button 
                                onClick={handleAddMember}
                                disabled={isSubmitting || !inviteEmail.trim()}
                                className="btn-industrial px-10 py-4 disabled:opacity-50"
                            >
                                {isSubmitting ? 'DISPATCHING...' : 'DISPATCH'}
                            </button>
                        </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] px-4">SYNCHRONIZED_UNITS ({members.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {members.map(m => (
                            <div key={m.id} className="flex items-center justify-between bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_var(--color-border)] hover:border-primary transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-black text-xl italic border-2 border-foreground shadow-[3px_3px_0px_0px_var(--color-border)]">
                                        {m.user.name?.[0]?.toUpperCase() || m.user.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                                            {m.user.name || 'ANONYMOUS_UNIT'}
                                            {m.role === 'OWNER' && <Shield className="w-4 h-4 text-primary" />}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">{m.user.email}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest ${
                                    m.role === 'OWNER' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'
                                }`}>
                                    {m.role}
                                </span>
                            </div>
                        ))}
                    </div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           {!loading && activeTab !== 'members' &&
             ((activeTab === 'bookmarks' && bookmarks.length === 0) ||
              (activeTab === 'todos' && todos.length === 0) ||
              (activeTab === 'notes' && notes.length === 0)) && (
              <div className="lg:col-span-2 text-center py-32 border-2 border-dashed border-border bg-card/10">
                <div className="w-20 h-20 bg-muted/40 border-2 border-border flex items-center justify-center mx-auto mb-8 rotate-45">
                    <Activity className="w-8 h-8 text-muted-foreground/30 animate-pulse -rotate-45" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-4">SILENCE_DETECTED</h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">WAITING_FOR_COLLABORATIVE_STREAM_DATA...</p>
             </div>
           )}
        </div>
      </main>
    </div>
  )
}
