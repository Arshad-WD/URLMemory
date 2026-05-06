'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Plus, Search, Link as LinkIcon, FileText, CheckSquare, 
    Users, X, ExternalLink, Trash2, Shield, Lock, Activity,
    ChevronLeft, Share2, MoreVertical, Globe, Clock, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import DesktopSidebar from '@/components/DesktopSidebar'
import BottomNav from '@/components/BottomNav'

interface Room {
    id: string
    name: string
    description: string | null
}

export default function RoomDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const roomId = params.id
    const [room, setRoom] = useState<Room | null>(null)
    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddingBookmark, setIsAddingBookmark] = useState(false)
    const [newUrl, setNewUrl] = useState('')
    const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'todos'>('bookmarks')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchRoomDetails()
    }, [roomId])

    const fetchRoomDetails = async () => {
        try {
            const [roomRes, bookmarkRes] = await Promise.all([
                fetch(`/api/rooms/${roomId}`),
                fetch(`/api/rooms/${roomId}/bookmarks`)
            ])
            const roomData = await roomRes.json()
            const bookmarkData = await bookmarkRes.json()
            setRoom(roomData)
            setBookmarks(bookmarkData)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleAddBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUrl) return
        try {
            const res = await fetch(`/api/rooms/${roomId}/bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl })
            })
            if (res.ok) {
                setNewUrl('')
                setIsAddingBookmark(false)
                fetchRoomDetails()
            }
        } catch (e) { console.error(e) }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-32 lg:pb-0">
            
            <div className="flex">
                <DesktopSidebar onAction={() => setIsAddingBookmark(true)} actionLabel="Injest Stream" />

                <main className="flex-1 lg:ml-72 min-h-screen">
                    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-3xl border-b border-white/5">
                        <div className="px-6 lg:px-12 h-24 flex items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <Link href="/rooms" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{room?.name || 'SYNCING...'}</h1>
                                    <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mt-2">Active Perimeter Protocol</p>
                                </div>
                            </div>
                            
                            <div className="hidden lg:flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-white/10 flex items-center justify-center text-[10px] font-black italic">
                                            {i}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black italic">
                                        +5
                                    </div>
                                </div>
                                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    <Share2 className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 lg:px-12 py-4 border-t border-white/5 flex items-center gap-12">
                            {[
                                { id: 'bookmarks', icon: <LinkIcon className="w-4 h-4" />, label: 'URIS' },
                                { id: 'notes', icon: <FileText className="w-4 h-4" />, label: 'LOGS' },
                                { id: 'todos', icon: <CheckSquare className="w-4 h-4" />, label: 'GOALS' },
                            ].map(tab => (
                                <button 
                                    key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="roomTab" className="absolute -bottom-4 left-0 right-0 h-1 bg-primary rounded-full shadow-glow" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="px-6 lg:px-12 py-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48 gap-8">
                                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-glow" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.8em] animate-pulse italic">Synchronizing Perimeter</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {bookmarks.map((bm, i) => (
                                        <motion.article 
                                            key={bm.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                            className="bento-card group flex flex-col"
                                        >
                                            <div className="w-full aspect-video bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center mb-8 relative overflow-hidden transition-all group-hover:border-primary/30">
                                                <Globe className="w-12 h-12 text-white/5" />
                                                <div className="absolute top-4 right-4 p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary backdrop-blur-md">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 truncate">UNIT_DATA</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(bm.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 group-hover:text-primary transition-colors line-clamp-2">{bm.title || bm.url}</h3>
                                                
                                                {bm.aiSummary && (
                                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-2 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                        "{bm.aiSummary}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                                                <div className="flex gap-4">
                                                    {bm.aiSummary && (
                                                        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                                                            <Sparkles className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    <a href={bm.url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                    </a>
                                                </div>
                                                <button className="p-3 text-white/10 hover:text-destructive transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.article>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Add Bookmark Modal */}
            <AnimatePresence>
                {isAddingBookmark && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingBookmark(false)} className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100]" />
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-x-6 bottom-12 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-xl z-[101]">
                            <form onSubmit={handleAddBookmark} className="bento-card p-10 lg:p-16 border-primary/20">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-4xl font-black italic tracking-tighter uppercase">Injest Stream</h3>
                                    <button type="button" onClick={() => setIsAddingBookmark(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X /></button>
                                </div>
                                <div className="space-y-10">
                                    <div className="relative group">
                                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="url" placeholder="HTTPS://COALITION_RESOURCE.IO" value={newUrl} 
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-xl font-black italic tracking-tighter uppercase" 
                                        />
                                    </div>
                                    <button type="submit" className="w-full btn-premium py-6 text-sm">
                                        Distribute to Perimeter
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav onAddClick={() => setIsAddingBookmark(true)} />
        </div>
    )
}
