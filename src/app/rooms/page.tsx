
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, ArrowRight, X, Trash2, Hash, Globe, Lock, ShieldCheck, Search, Activity } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import { useRouter } from 'next/navigation'

interface Room {
  id: string
  name: string
  description: string | null
  memberCount: number
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  createdAt: string
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (res.ok) {
        const newRoom = await res.json()
        setIsCreating(false)
        setName('')
        setDescription('')
        fetchRooms() // Refresh to get correct member count/role shape
      }
    } catch (error) {
      console.error('Failed to create room', error)
    }
  }

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 pb-24 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => setIsCreating(true)} 
          actionLabel="Create Room"
        />
        
        <div className="flex-1 lg:ml-72 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-gray-100 dark:border-slate-900/50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Collaboration Hub
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium pt-0.5">
                  Connect and share in rooms
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-slate-900/80 px-4 py-2 rounded-2xl border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-48 text-gray-600 dark:text-slate-300 placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Create Room UI */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsCreating(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Create Room</h2>
                            <p className="text-sm text-gray-500 mt-1 font-medium">Define your new shared space</p>
                          </div>
                          <button onClick={() => setIsCreating(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 bg-gray-50 dark:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Room Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 text-gray-900 dark:text-slate-100 outline-none transition-all"
                              placeholder="e.g. Design Team, Family Sync"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Description</label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 text-gray-900 dark:text-slate-100 outline-none transition-all resize-none h-24"
                              placeholder="What is the purpose of this room?"
                            />
                          </div>
                          
                          <div className="pt-4">
                            <button
                              type="submit"
                              className="w-full py-4 bg-indigo-600 text-white rounded-[20px] hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                            >
                              Launch Room
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredRooms.map((room) => (
                  <motion.div
                    layout
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className="group relative bg-white dark:bg-slate-900/40 rounded-[32px] p-7 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 border border-gray-100 dark:border-slate-800 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                    onClick={() => router.push(`/rooms/${room.id}`)}
                  >
                    {/* Role Badge */}
                    <div className="absolute top-6 right-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            room.role === 'OWNER' 
                                ? 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 border border-amber-200/50 dark:border-amber-800/50' 
                                : 'bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50'
                        }`}>
                            {room.role}
                        </span>
                    </div>

                    <div className="mb-6 w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                      {room.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-6">
                      {room.description || 'Seamless collaboration starts here. Bring your team and resources together.'}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-slate-800/30">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(3, room.memberCount))].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800" />
                            ))}
                            {room.memberCount > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                    +{room.memberCount - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                            {room.memberCount} Mates
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                        Enter <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {!loading && filteredRooms.length === 0 && (
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-900/40 rounded-[40px] flex items-center justify-center mx-auto mb-8 rotate-12 transition-transform">
                  <Globe className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {searchQuery ? 'No rooms found' : 'Isolated? Never again.'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
                  {searchQuery ? 'Check your spelling or try a broader term.' : 'Create your first room to start collaborating with others in real-time.'}
                </p>
                {!searchQuery && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="mt-10 px-8 py-4 bg-indigo-600 text-white rounded-[20px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                        Foundation New Room
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
