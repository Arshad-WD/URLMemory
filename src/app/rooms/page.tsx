
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, ArrowRight, X, Trash2, Hash, Globe, Lock, ShieldCheck, Search, Activity } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import MagneticEffect from '@/components/MagneticEffect'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme } = useTheme()
  
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
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true)

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
        fetchRooms()
      }
    } catch (error) {
      console.error('Failed to create room', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => setIsCreating(true)} 
          actionLabel="Launch Room"
        />
        
        <div className="flex-1 lg:ml-72 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-2 border-border pb-6 pt-10 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <Globe className="text-primary-foreground w-6 h-6" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">Nexus<span className="text-primary">.LOG</span></h1>
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
                    onClick={() => setIsCreating(true)}
                    className="btn-industrial p-3"
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </button>
                </MagneticEffect>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-12">
            {/* Create Room UI */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setIsCreating(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 40 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 40 }}
                      className="w-full max-w-lg bg-card border-2 border-border shadow-[12px_12px_0px_0px_var(--color-border)] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">LAUNCH_ROOM</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">ESTABLISH_NEW_UPLINK</p>
                          </div>
                          <button onClick={() => setIsCreating(false)} className="p-2 border-2 border-transparent hover:border-border transition-all">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="space-y-6">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">MANIFEST_NAME</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="input-industrial w-full py-4 uppercase italic tracking-tighter"
                              placeholder="e.g. OPERATIONS_CENTER"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">DESCRIPTION_FIELD</label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="input-industrial w-full min-h-[100px] resize-none py-4"
                              placeholder="MISSION_OBJECTIVES..."
                            />
                          </div>
                          
                          <div className="pt-4">
                             <button
                              type="submit"
                              disabled={isSubmitting || !name.trim()}
                              className="btn-industrial w-full py-4 text-base disabled:opacity-50"
                            >
                              {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE_ROOM'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredRooms.map((room) => (
                  <motion.div
                    layout
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bento-card group p-8 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/rooms/${room.id}`)}
                  >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 bg-muted/40 border-2 border-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Users className="w-7 h-7" strokeWidth={3} />
                        </div>
                        <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest ${
                            room.role === 'OWNER' 
                                ? 'bg-primary/10 border-primary/30 text-primary' 
                                : 'bg-muted border-border text-muted-foreground'
                        }`}>
                            {room.role}
                        </span>
                    </div>

                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-2 group-hover:text-primary transition-colors truncate">
                      {room.name}
                    </h3>
                    
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem] mb-8 opacity-60">
                      {room.description || 'ESTABLISHING_RECORDS...'}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t-2 border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[...Array(Math.min(3, room.memberCount))].map((_, i) => (
                                <div key={i} className="w-6 h-6 border-2 border-card bg-muted" />
                            ))}
                            {room.memberCount > 3 && (
                                <div className="w-6 h-6 border-2 border-card bg-muted flex items-center justify-center text-[8px] font-black text-muted-foreground">
                                    +{room.memberCount - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {room.memberCount} UNITS
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                        ENTER <ArrowRight className="w-4 h-4" strokeWidth={3} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {!loading && filteredRooms.length === 0 && (
              <div className="text-center py-40 border-2 border-dashed border-border">
                <div className="w-24 h-24 bg-muted/40 flex items-center justify-center mx-auto mb-8 border-2 border-border rotate-12">
                  <Globe className="w-12 h-12 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-4">
                   {searchQuery ? 'ZERO_RESULTS' : 'ISOLATED_ENV'}
                </h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">
                   {searchQuery ? 'QUERY_UNRESOLVED' : 'AWAITING_INITIALIZATION'}
                </p>
                {!searchQuery && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="btn-industrial px-8 py-3 mt-8"
                    >
                        FOUNDATION_NEW_ROOM
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
