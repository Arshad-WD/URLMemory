'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Plus, Search, CheckSquare, Trash2, Check, X, 
    Zap, Clock, Target, List, LayoutGrid, 
    ChevronRight, GripVertical, AlertCircle
} from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import BottomNav from '@/components/BottomNav'

interface Todo {
    id: string
    task: string
    isDone: boolean
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    createdAt: string
}

export default function TodosPage() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [newTask, setNewTask] = useState('')
    const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchTodos()
    }, [])

    const fetchTodos = async () => {
        try {
            const res = await fetch('/api/todos')
            const data = await res.json()
            setTodos(data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask) return
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: newTask, priority: newPriority })
            })
            if (res.ok) {
                setNewTask('')
                setIsCreating(false)
                fetchTodos()
            }
        } catch (e) { console.error(e) }
    }

    const toggleDone = async (id: string, isDone: boolean) => {
        setTodos(todos.map(t => t.id === id ? { ...t, isDone: !isDone } : t))
        await fetch('/api/todos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isDone: !isDone })
        })
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/todos?id=${id}`, { method: 'DELETE' })
        if (res.ok) fetchTodos()
    }

    const filteredTodos = todos.filter(t => 
        t.task.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-32 lg:pb-0">
            
            <div className="flex">
                <DesktopSidebar onAction={() => setIsCreating(true)} actionLabel="Deploy Objective" />

                <main className="flex-1 lg:ml-72 min-h-screen">
                    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-3xl border-b border-white/5">
                        <div className="px-6 lg:px-12 h-24 flex items-center justify-between gap-8">
                            <div className="flex-1 max-w-2xl relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="SCAN_OBJECTIVE_STREAM..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-16 pr-8 py-4 rounded-full bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white/10 text-sm outline-none transition-all font-medium" 
                                />
                            </div>
                        </div>
                    </header>

                    <div className="px-6 lg:px-12 py-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48 gap-8">
                                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-glow" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.8em] animate-pulse italic">Retrieving Intel</p>
                            </div>
                        ) : filteredTodos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-48 text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/10">
                                    <Target className="w-12 h-12 text-primary/30" />
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Objective List Zero</h2>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Deploy new tactical goal</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* Priority Sections */}
                                {['HIGH', 'MEDIUM', 'LOW'].map(priority => {
                                    const items = filteredTodos.filter(t => t.priority === priority)
                                    if (items.length === 0) return null
                                    return (
                                        <section key={priority}>
                                            <header className="flex items-center gap-4 mb-8">
                                                <div className={`w-10 h-1 rounded-full ${priority === 'HIGH' ? 'bg-accent shadow-accent/50 shadow-glow' : priority === 'MEDIUM' ? 'bg-primary' : 'bg-white/10'}`} />
                                                <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${priority === 'HIGH' ? 'text-accent' : priority === 'MEDIUM' ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {priority}_PRIORITY_CORE
                                                </h2>
                                            </header>
                                            <div className="grid grid-cols-1 gap-4">
                                                <AnimatePresence mode="popLayout">
                                                    {items.map((todo, i) => (
                                                        <motion.div 
                                                            key={todo.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                            className="bento-card p-6 flex items-center gap-6 group hover:border-primary/20"
                                                        >
                                                            <button 
                                                                onClick={() => toggleDone(todo.id, todo.isDone)}
                                                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${todo.isDone ? 'bg-primary border-primary text-primary-foreground shadow-glow' : 'border-white/10 text-transparent hover:border-primary/50'}`}
                                                            >
                                                                <Check className="w-6 h-6" strokeWidth={3} />
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-lg font-black italic tracking-tighter transition-all uppercase ${todo.isDone ? 'text-muted-foreground/30 line-through' : 'text-foreground group-hover:text-primary'}`}>
                                                                    {todo.task}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="hidden md:flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                                                                    <Clock className="w-3 h-3" /> {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <button onClick={() => handleDelete(todo.id)} className="p-3 text-white/10 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                                <GripVertical className="w-5 h-5 text-white/5 group-hover:text-white/20 transition-colors" />
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </section>
                                    )
                                })}
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
                                    <h3 className="text-4xl font-black italic tracking-tighter uppercase">Deploy Objective</h3>
                                    <button type="button" onClick={() => setIsCreating(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X /></button>
                                </div>
                                <div className="space-y-10">
                                    <div className="relative group">
                                        <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="text" placeholder="TASK_DEFINITION..." value={newTask} 
                                            onChange={(e) => setNewTask(e.target.value)}
                                            className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-xl font-black italic tracking-tighter uppercase" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="technical-label">Priority Index</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                                                <button 
                                                    key={p} type="button" onClick={() => setNewPriority(p)}
                                                    className={`py-4 rounded-2xl text-[10px] font-black tracking-widest border transition-all ${newPriority === p ? 'bg-primary text-primary-foreground border-primary shadow-glow' : 'bg-white/5 text-muted-foreground border-transparent hover:border-white/10'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full btn-premium py-6 text-sm">
                                        Initialize Objective
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
