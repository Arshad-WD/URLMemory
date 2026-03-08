'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, CheckCircle2, Circle, X, CheckSquare, 
  Search, Calendar, Tag, AlertCircle, Clock, Filter, Sparkles, ChevronDown
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import MagneticEffect from '@/components/MagneticEffect'
import { useTheme } from '@/components/ThemeProvider'

interface Todo {
  id: string
  task: string
  isDone: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  roomId: string | null
  createdAt: string
  tags: { id: string, name: string }[]
}

type FilterStatus = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'HIGH_PRIORITY'

export default function TodosPage() {
  const { theme } = useTheme()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newPriority, setNewPriority] = useState<Todo['priority']>('MEDIUM')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos')
      if (res.ok) {
        const data = await res.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Failed to fetch todos', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newTask.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: newTask,
          priority: newPriority
        }),
      })

      if (res.ok) {
        const newTodo = await res.json()
        setTodos([newTodo, ...todos])
        setNewTask('')
        setNewPriority('MEDIUM')
      }
    } catch (error) {
      console.error('Failed to create todo', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTodos(todos.map(t => t.id === id ? { ...t, isDone: !currentStatus } : t))
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: !currentStatus }),
      })
      if (!res.ok) setTodos(todos.map(t => t.id === id ? { ...t, isDone: currentStatus } : t))
    } catch (error) {
      setTodos(todos.map(t => t.id === id ? { ...t, isDone: currentStatus } : t))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (res.ok) setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete todo', error)
    }
  }

  const handleClearCompleted = async () => {
    const completed = todos.filter(t => t.isDone)
    if (completed.length === 0) return
    if (!confirm(`Clear ${completed.length} completed tasks?`)) return

    // Note: ideally this should be a batch API call, but for simplicity we'll delete each or just refresh after
    for (const todo of completed) {
      await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
    }
    setTodos(todos.filter(t => !t.isDone))
  }

  const filteredTodos = useMemo(() => {
    return todos
      .filter(t => t.task.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(t => {
        if (filter === 'ACTIVE') return !t.isDone
        if (filter === 'COMPLETED') return t.isDone
        if (filter === 'HIGH_PRIORITY') return t.priority === 'HIGH'
        return true
      })
  }, [todos, searchQuery, filter])

  const completedCount = todos.filter(t => t.isDone).length
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0

  const priorityColors = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => inputRef.current?.focus()} 
          actionLabel="Add Task"
        />
        <div className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-2 border-border pb-6 pt-10">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
                    <CheckSquare className="text-primary-foreground w-6 h-6" strokeWidth={3} />
                  </div>
                  <h1 className="text-3xl font-black uppercase italic tracking-tighter">Tasks<span className="text-primary">.LOG</span></h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">PROGRESS_INDEX</span>
                  <div className="w-32 h-4 bg-muted border border-border relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-primary"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground mix-blend-difference">
                      {Math.round(progress)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border-2 border-border p-4 shadow-[6px_6px_0px_0px_var(--color-border)]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    {(['ALL', 'ACTIVE', 'COMPLETED', 'HIGH_PRIORITY'] as FilterStatus[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filter === f ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-foreground'}`}
                      >
                        {f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {completedCount > 0 && (
                    <button 
                        onClick={handleClearCompleted}
                        className="text-[10px] font-black text-muted-foreground hover:text-rose-500 uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        CLEAR_FINISHED
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-6 py-12">
            {/* Input Form */}
            <form onSubmit={handleCreate} className="mb-12">
              <div className="bg-card border-2 border-border p-2 flex flex-col sm:flex-row items-center gap-2 shadow-[4px_4px_0px_0px_var(--color-border)]">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="CAPTURE_NEW_TASK..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="input-industrial border-none flex-1 py-4 text-base"
                />
                
                <div className="flex items-center gap-2 w-full sm:w-auto p-2 sm:p-0">
                  <div className="relative flex-1 sm:flex-none">
                    <button
                      type="button"
                      onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-all ${priorityColors[newPriority]}`}
                    >
                      {newPriority}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showPriorityMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showPriorityMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-full sm:w-32 bg-card border-2 border-border p-1 z-50 shadow-[6px_6px_0px_0px_var(--color-border)]"
                        >
                          {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setNewPriority(p)
                                setShowPriorityMenu(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all ${
                                newPriority === p ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <MagneticEffect strength={0.2}>
                    <button
                      type="submit"
                      disabled={!newTask.trim() || isSubmitting}
                      className="btn-industrial py-2 px-6 disabled:opacity-50"
                    >
                      {isSubmitting ? 'SYNC...' : 'DEPLOY'}
                    </button>
                  </MagneticEffect>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bento-card group flex items-center gap-6 p-6"
                  >
                    <button 
                      onClick={() => handleToggle(todo.id, todo.isDone)}
                      className={`flex-shrink-0 w-8 h-8 border-2 flex items-center justify-center transition-all ${
                        todo.isDone 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {todo.isDone && <CheckSquare className="w-5 h-5" strokeWidth={4} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border transition-all ${
                          todo.priority === 'HIGH' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                          todo.priority === 'MEDIUM' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                          'bg-muted-foreground/10 border-muted-foreground/30 text-muted-foreground'
                        }`}>
                          {todo.priority}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                          ID_{todo.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <h3 className={`text-lg font-black tracking-tight transition-all truncate ${
                        todo.isDone ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}>
                        {todo.task}
                      </h3>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> INITIALIZED_{new Date(todo.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                      <MagneticEffect strength={0.2}>
                        <button 
                          onClick={() => handleDelete(todo.id)}
                          className="p-3 border-2 border-transparent hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </MagneticEffect>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!loading && filteredTodos.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">NO_RECORDS_FOUND</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <BottomNav onAddClick={() => inputRef.current?.focus()} />
    </div>
  )
}
