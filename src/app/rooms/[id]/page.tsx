
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, FileText, CheckSquare, Bookmark, Users, 
  Settings, Loader2, Plus, Trash2, Copy, Check, LogOut, ExternalLink, MoreVertical, Shield, UserPlus,
  Globe, Clock, Activity
} from 'lucide-react'
import Link from 'next/link'

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
    }
  }
  
  const handleAddMember = async () => {
    if (!inviteEmail.trim()) return
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
  }

  const handleLeaveRoom = async () => {
    if (!confirm('Are you sure you want to leave this room?')) return
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
    }
  }

  const handleDeleteRoom = async () => {
    if (!confirm('EXTREME CAUTION: This will delete the room and all its content for everyone. Are you sure?')) return
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfcfd] dark:bg-slate-950">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
        {isDeleting ? 'Erasing Room...' : 'Accessing Vault...'}
      </p>
    </div>
  )

  if (!room) return null

  const isOwner = room.currentUserRole === 'OWNER'

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 pb-24 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-gray-100 dark:border-slate-900/50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/rooms" className="p-2.5 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-slate-900 rounded-2xl transition-all active:scale-90">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{room.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isOwner ? 'bg-amber-100/50 text-amber-600 border border-amber-200/50' : 'bg-indigo-50/50 text-indigo-600 border border-indigo-100/50'
                }`}>
                    {room.currentUserRole}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• {activeTab}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-gray-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-transparent">
                {[
                { id: 'bookmarks', icon: Bookmark, label: 'Links' },
                { id: 'notes', icon: FileText, label: 'Notes' },
                { id: 'todos', icon: CheckSquare, label: 'Tasks' },
                { id: 'members', icon: Users, label: 'Mates' },
                ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id 
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                    }`}
                >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{item.label}</span>
                </button>
                ))}
            </div>

            <div className="flex items-center gap-1 ml-2">
                 {isOwner ? (
                     <button 
                        onClick={handleDeleteRoom}
                        title="Delete Room"
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-95"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 ) : (
                    <button 
                        onClick={handleLeaveRoom}
                        title="Leave Room"
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-95"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                 )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Mobile Tab Bar */}
        <div className="sm:hidden flex bg-gray-100 dark:bg-slate-900/80 p-1.5 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
            {[
                { id: 'bookmarks', icon: Bookmark },
                { id: 'notes', icon: FileText },
                { id: 'todos', icon: CheckSquare },
                { id: 'members', icon: Users },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex-1 flex items-center justify-center p-3 rounded-xl transition-all ${
                        activeTab === item.id 
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' 
                            : 'text-gray-400'
                    }`}
                >
                    <item.icon className="w-5 h-5" />
                </button>
            ))}
        </div>

        {/* Input Area */}
        {activeTab !== 'members' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-900 backdrop-blur-sm"
          >
            <div className="flex gap-3 mb-4">
              {activeTab === 'bookmarks' && (
                <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-slate-950/50 rounded-2xl px-5 py-3.5 focus-within:bg-white dark:focus-within:bg-slate-900 border border-transparent focus-within:border-indigo-500/20 transition-all">
                    <Bookmark className="w-5 h-5 text-gray-400" />
                    <input 
                    placeholder="Drop a URL here..." 
                    className="flex-1 bg-transparent outline-none text-base text-gray-700 dark:text-slate-200 font-medium"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    />
                </div>
              )}
              {(activeTab === 'todos' || activeTab === 'notes') && (
                <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-slate-950/50 rounded-2xl px-5 py-3.5 focus-within:bg-white dark:focus-within:bg-slate-900 border border-transparent focus-within:border-indigo-500/20 transition-all">
                    {activeTab === 'todos' ? <CheckSquare className="w-5 h-5 text-gray-400" /> : <FileText className="w-5 h-5 text-gray-400" />}
                    <input 
                    placeholder={activeTab === 'todos' ? "Something to do together?" : "Give your note a title..."} 
                    className="flex-1 bg-transparent outline-none text-base text-gray-700 dark:text-slate-200 font-bold"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    />
                </div>
              )}
              <button 
                onClick={handleCreate}
                disabled={!(inputUrl || inputTitle)}
                className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-90 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            {(activeTab === 'notes' || activeTab === 'bookmarks') && (
               <div className="bg-gray-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-transparent focus-within:border-indigo-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                   <textarea 
                   placeholder={activeTab === 'bookmarks' ? "Any thoughts on this link? (Optional)" : "Write down the shared knowledge..."}
                   className="w-full bg-transparent outline-none h-24 resize-none text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium"
                   value={inputContent}
                   onChange={(e) => setInputContent(e.target.value)}
                   />
               </div>
            )}
          </motion.div>
        )}

        {/* Content Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
           <AnimatePresence mode="popLayout">
             {activeTab === 'bookmarks' && bookmarks.map(b => (
               <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={b.id} 
                className="group bg-white dark:bg-slate-900/40 p-6 rounded-[28px] border border-gray-100 dark:border-slate-900 shadow-sm hover:shadow-xl transition-all backdrop-blur-sm"
               >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500 shrink-0 group-hover:scale-110 transition-transform">
                        <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 dark:text-slate-100 hover:text-indigo-600 transition-colors truncate block text-lg pr-8">
                            {b.title || b.url}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{new URL(b.url).hostname}</span>
                        </div>
                        {b.note && (
                            <div className="mt-4 p-3 bg-gray-50/50 dark:bg-slate-950/30 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{b.note}</p>
                            </div>
                        )}
                    </div>
                    <a href={b.url} target="_blank" className="p-2 text-gray-300 hover:text-indigo-600 transition-colors self-start">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
               </motion.div>
             ))}

             {activeTab === 'todos' && todos.map(t => (
               <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={t.id} 
                className={`bg-white dark:bg-slate-900/40 p-5 rounded-[24px] border transition-all flex items-center gap-4 backdrop-blur-sm ${
                    t.isDone ? 'border-transparent opacity-50 grayscale' : 'border-gray-100 dark:border-slate-900 shadow-sm hover:shadow-lg'
                }`}
               >
                  <div className={`p-1.5 rounded-lg shrink-0 ${t.isDone ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                    {t.isDone ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                  </div>
                  <span className={`flex-1 font-bold text-base ${t.isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-slate-100'}`}>
                    {t.task}
                  </span>
                  <div className="flex items-center gap-1">
                    {t.isDone && <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Resolved</span>}
                  </div>
               </motion.div>
             ))}

             {activeTab === 'notes' && notes.map(n => (
               <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={n.id} 
                className="bg-white dark:bg-slate-900/40 p-7 rounded-[32px] border border-gray-100 dark:border-slate-900 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group backdrop-blur-sm h-full"
               >
                  <h3 className="font-black text-xl text-gray-900 dark:text-slate-100 mb-4 group-hover:text-indigo-600 transition-colors">{n.title}</h3>
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-950/30 rounded-[20px] mb-4 min-h-[100px]">
                    <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Updated {new Date(n.updatedAt).toLocaleDateString()}</span>
                  </div>
               </motion.div>
             ))}

             {activeTab === 'members' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-2 space-y-8 max-w-2xl mx-auto w-full"
               >
                  {(room.currentUserRole === 'OWNER' || room.currentUserRole === 'ADMIN') && (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-900 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expand your crew</h2>
                                <p className="text-sm text-gray-500 font-medium">Invite others to join this room</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <input 
                                placeholder="mate@example.com" 
                                className="flex-1 p-4 bg-gray-50 dark:bg-slate-950/50 rounded-2xl border border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 outline-none text-gray-700 dark:text-slate-200 font-bold transition-all"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                            />
                            <button 
                                onClick={handleAddMember}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-[20px] hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Dispatch
                            </button>
                        </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Active Mates ({members.length})</h3>
                    {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-white dark:bg-slate-900/40 p-4 rounded-[24px] border border-gray-100 dark:border-slate-800 backdrop-blur-sm hover:border-indigo-500/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white dark:border-slate-800">
                                    {m.user.name?.[0]?.toUpperCase() || m.user.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <div className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                                        {m.user.name || 'User'}
                                        {m.role === 'OWNER' && <Shield className="w-3.5 h-3.5 text-amber-500" />}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">{m.user.email}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                m.role === 'OWNER' ? 'bg-amber-100/50 text-amber-700 border border-amber-200/50' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 border border-transparent'
                            }`}>
                                {m.role}
                            </span>
                        </div>
                    ))}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           {!loading && activeTab !== 'members' &&
             ((activeTab === 'bookmarks' && bookmarks.length === 0) ||
              (activeTab === 'todos' && todos.length === 0) ||
              (activeTab === 'notes' && notes.length === 0)) && (
             <div className="lg:col-span-2 text-center py-24 bg-white/40 dark:bg-slate-900/20 rounded-[40px] border border-dashed border-gray-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 text-gray-300 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-slate-400 uppercase tracking-tight">Silent for now</h3>
                <p className="text-gray-400 dark:text-slate-500 mt-2 text-sm font-medium">Add some shared {activeTab} to start the vibe.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  )
}
