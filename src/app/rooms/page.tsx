'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Plus, Search, Users, ChevronRight, X, 
    Globe, Lock, Shield, Network, Activity,
    MoreVertical, MessageSquare, Link as LinkIcon, CheckSquare
} from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import BottomNav from '@/components/BottomNav'

interface Room {
    id: string
    name: string
    description: string | null
    _count: {
        members: number
        notes: number
        todos: number
        bookmarks: number
    }
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchRooms()
    }, [])

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms')
            const data = await res.json()
            setRooms(data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName) return
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, description: newDesc })
            })
            if (res.ok) {
                setNewName('')
                setNewDesc('')
                setIsCreating(false)
                fetchRooms()
            }
        } catch (e) { console.error(e) }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-32 lg:pb-0">
            
            <div className="flex">
                <DesktopSidebar onAction={() => setIsCreating(true)} actionLabel="Establish Unit" />

                <main className="flex-1 lg:ml-72 min-h-screen">
                    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-3xl border-b border-white/5">
                        <div className="px-6 lg:px-12 h-24 flex items-center justify-between gap-8">
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Coalition Units</h1>
                            <div className="hidden md:flex items-center gap-4 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full">
                                <Activity className="w-4 h-4 text-primary animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Network_Stable</span>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 lg:px-12 py-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48 gap-8">
                                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-glow" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.8em] animate-pulse italic">Scanning Network</p>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-48 text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/10">
                                    <Network className="w-12 h-12 text-primary/30" />
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">No Coalitions Found</h2>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Establish first tactical perimeter</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {rooms.map((room, i) => (
                                        <Link key={room.id} href={`/rooms/${room.id}`}>
                                            <motion.article 
                                                layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                                className="bento-card group h-full flex flex-col border-white/5 hover:border-primary/30"
                                            >
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                        <Lock className="w-3 h-3 text-primary" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Encrypted</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 group-hover:text-primary transition-colors">
                                                        {room.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-2 mb-10">
                                                        {room.description || 'No mission objective defined for this coalition unit.'}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                                    {[
                                                        { icon: <LinkIcon className="w-3 h-3" />, val: room._count.bookmarks, label: 'URIS' },
                                                        { icon: <MessageSquare className="w-3 h-3" />, val: room._count.notes, label: 'LOGS' },
                                                        { icon: <CheckSquare className="w-3 h-3" />, val: room._count.todos, label: 'GOALS' },
                                                        { icon: <Users className="w-3 h-3" />, val: room._count.members, label: 'UNITS' },
                                                    ].map((stat, idx) => (
                                                        <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-primary/40">
                                                                {stat.icon}
                                                                <span className="text-[8px] font-black tracking-widest">{stat.label}</span>
                                                            </div>
                                                            <span className="text-lg font-black italic">{stat.val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.article>
                                        </Link>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100]" />
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-x-6 bottom-12 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-xl z-[101]">
                            <form onSubmit={handleCreate} className="bento-card p-10 lg:p-16 border-primary/20">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-4xl font-black italic tracking-tighter uppercase">Establish Unit</h3>
                                    <button type="button" onClick={() => setIsCreating(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X /></button>
                                </div>
                                <div className="space-y-10">
                                    <div className="relative group">
                                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="text" placeholder="UNIT_IDENTIFIER..." value={newName} 
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-xl font-black italic tracking-tighter uppercase" 
                                        />
                                    </div>
                                    <textarea 
                                        placeholder="MISSION_OBJECTIVE..." value={newDesc} 
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full h-32 bg-white/5 border border-white/10 p-8 rounded-[2rem] outline-none focus:border-primary/50 text-base font-medium italic resize-none leading-relaxed" 
                                    />
                                    <button type="submit" className="w-full btn-premium py-6 text-sm">
                                        Initialize Perimeter
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav onAddClick={() => setIsCreating(true)} />
        </div>
    )
}
