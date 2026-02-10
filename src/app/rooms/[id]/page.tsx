
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, FileText, CheckSquare, Bookmark, Users, 
  Settings, Loader2, Plus, Trash2, Copy, Check 
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
      await fetch(`/api/rooms/${roomId}/members`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: inviteEmail })
      })
      setInviteEmail('')
      fetchDataForTab('members')
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  )

  if (!room) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/rooms" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">{room.name}</h1>
              <p className="text-xs text-indigo-500 mt-1 font-medium">{activeTab.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'bookmarks', icon: Bookmark },
              { id: 'notes', icon: FileText },
              { id: 'todos', icon: CheckSquare },
              { id: 'members', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`p-2 rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Input Area */}
        {activeTab !== 'members' && (
          <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex gap-2 mb-2">
              {activeTab === 'bookmarks' && (
                <input 
                  placeholder="Paste URL..." 
                  className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-2 outline-none border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
              )}
              {(activeTab === 'todos' || activeTab === 'notes') && (
                <input 
                  placeholder={activeTab === 'todos' ? "Add a task..." : "Note Title"} 
                  className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-2 outline-none border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                />
              )}
              <button 
                onClick={handleCreate}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            {(activeTab === 'notes' || activeTab === 'bookmarks') && (
               <textarea 
                 placeholder={activeTab === 'bookmarks' ? "Add a note (optional)..." : "Note content..."}
                 className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 outline-none border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all h-20 resize-none text-sm"
                 value={inputContent}
                 onChange={(e) => setInputContent(e.target.value)}
               />
            )}
          </div>
        )}

        {/* Content Lists */}
        <div className="space-y-3">
           <AnimatePresence mode="popLayout">
             {activeTab === 'bookmarks' && bookmarks.map(b => (
               <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={b.id} 
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-3 hover:shadow-md transition-all"
               >
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500 shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline truncate block">
                        {b.title || b.url}
                    </a>
                    {b.note && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.note}</p>}
                  </div>
               </motion.div>
             ))}

             {activeTab === 'todos' && todos.map(t => (
               <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={t.id} 
                className={`bg-white dark:bg-slate-900 p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    t.isDone ? 'border-transparent bg-gray-50 dark:bg-slate-900/50' : 'border-gray-100 dark:border-slate-800 shadow-sm'
                }`}
               >
                  <div className={`p-1 rounded-md ${t.isDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {t.isDone ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                  </div>
                  <span className={`flex-1 ${t.isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-slate-100'}`}>
                    {t.task}
                  </span>
               </motion.div>
             ))}

             {activeTab === 'notes' && notes.map(n => (
               <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={n.id} 
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
               >
                  <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-2">{n.title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm whitespace-pre-wrap">{n.content}</p>
                  <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800/50 flex justify-end">
                      <span className="text-xs text-gray-400">{new Date(n.updatedAt).toLocaleDateString()}</span>
                  </div>
               </motion.div>
             ))}

             {activeTab === 'members' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
               >
                  {(room.currentUserRole === 'OWNER' || room.currentUserRole === 'ADMIN') && (
                    <div className="flex gap-2">
                        <input 
                            placeholder="Invite by email..." 
                            className="flex-1 p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                        />
                        <button 
                            onClick={handleAddMember}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
                        >
                            Invite
                        </button>
                    </div>
                  )}
                  
                  <div className="grid gap-2">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                                    {m.user.name?.[0]?.toUpperCase() || m.user.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{m.user.name || 'User'}</div>
                                    <div className="text-xs text-gray-500">{m.user.email}</div>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                m.role === 'OWNER' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {m.role}
                            </span>
                        </div>
                    ))}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           {!loading && 
             ((activeTab === 'bookmarks' && bookmarks.length === 0) ||
              (activeTab === 'todos' && todos.length === 0) ||
              (activeTab === 'notes' && notes.length === 0)) && (
             <div className="text-center py-12 text-gray-400 font-medium">
                No {activeTab} yet.
             </div>
           )}
        </div>
      </main>
    </div>
  )
}
