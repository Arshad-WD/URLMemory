
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, ArrowRight, X } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import { useRouter } from 'next/navigation'

interface Room {
  id: string
  name: string
  description: string | null
  memberCount: number
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
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
        setRooms([newRoom, ...rooms]) // Note: newRoom might not have memberCount/role exactly as list API, but close enough for now or we refresh
        setIsCreating(false)
        setName('')
        setDescription('')
        fetchRooms() // Refresh to get correct member count/role shape if needed
      }
    } catch (error) {
      console.error('Failed to create room', error)
    }
  }

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => setIsCreating(true)} 
          actionLabel="Create Room"
        />
        <div className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Rooms
          </h1>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">Create New Room</h3>
                  <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Room Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. Family, Project Alpha"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="What's this room for?"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Create Room
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {rooms.map((room) => (
              <motion.div
                layout
                key={room.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/rooms/${room.id}`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 border border-gray-100 dark:border-slate-800 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-indigo-500 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-1 pr-8">
                  {room.name}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 min-h-[1.25rem]">
                  {room.description || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5" />
                    <span>{room.memberCount || 1} members</span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg ${
                    room.role === 'OWNER' 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500' 
                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {room.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!loading && rooms.length === 0 && !isCreating && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No rooms yet</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Create a room to start sharing</p>
          </div>
        )}
      </main>
        </div>
      </div>

      <BottomNav onAddClick={() => setIsCreating(true)} />
    </div>
  )
}
