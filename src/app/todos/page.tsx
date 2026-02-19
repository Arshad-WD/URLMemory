
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, X, CheckSquare, Search, Calendar, Tag } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'

interface Todo {
  id: string
  task: string
  isDone: boolean
  createdAt: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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
    if (!newTask.trim()) return

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask }),
      })

      if (res.ok) {
        const newTodo = await res.json()
        setTodos([newTodo, ...todos])
        setNewTask('')
      }
    } catch (error) {
      console.error('Failed to create todo', error)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setTodos(todos.map(t => t.id === id ? { ...t, isDone: !currentStatus } : t))

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: !currentStatus }),
      })

      if (!res.ok) {
        // Revert on failure
        setTodos(todos.map(t => t.id === id ? { ...t, isDone: currentStatus } : t))
      }
    } catch (error) {
      console.error('Failed to update todo', error)
      setTodos(todos.map(t => t.id === id ? { ...t, isDone: currentStatus } : t))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return

    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTodos(todos.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete todo', error)
    }
  }

  const filteredTodos = todos.filter(t => 
    t.task.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedCount = todos.filter(t => t.isDone).length
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 pb-24 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => inputRef.current?.focus()} 
          actionLabel="Add Task"
        />
        <div className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-gray-100 dark:border-slate-900/50">
            <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Task Desk
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold pt-1 uppercase tracking-wider">
                  {completedCount}/{todos.length} COMPLETED
                </p>
              </div>

              <div className="flex items-center gap-3">
                 <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-indigo-500/20 transition-all">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-32 text-gray-600 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/20 w-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
            </div>
          </header>

          <main className="max-w-3xl mx-auto px-6 py-10">
            {/* Input Form */}
            <form onSubmit={handleCreate} className="mb-12">
              <div className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full pl-14 pr-14 py-4.5 bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-900 dark:text-slate-100 placeholder:text-gray-300 dark:placeholder:text-slate-700 text-lg transition-all"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <AnimatePresence>
                  {newTask && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="submit"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-90"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Todo List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTodos.map((todo) => (
                  <motion.div
                    layout
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group relative flex items-center gap-4 p-5 rounded-[24px] border transition-all cursor-pointer overflow-hidden ${
                        todo.isDone 
                            ? 'bg-gray-50/50 dark:bg-slate-900/20 border-transparent opacity-60' 
                            : 'bg-white dark:bg-slate-900/40 border-gray-100 dark:border-slate-900 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm'
                    }`}
                    onClick={() => handleToggle(todo.id, todo.isDone)}
                  >
                    <button
                      className={`flex-shrink-0 transition-all duration-500 ${
                        todo.isDone ? 'text-indigo-500' : 'text-gray-200 dark:text-slate-800 hover:text-indigo-400'
                      }`}
                    >
                      {todo.isDone ? (
                        <CheckCircle2 className="w-7 h-7 fill-indigo-50 dark:fill-indigo-950" />
                      ) : (
                        <Circle className="w-7 h-7 stroke-[1.5px]" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                        <span className={`block text-base font-semibold truncate transition-all duration-500 ${
                            todo.isDone 
                                ? 'text-gray-400 line-through' 
                                : 'text-gray-700 dark:text-slate-200'
                        }`}>
                        {todo.task}
                        </span>
                        {!todo.isDone && (
                            <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(todo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tag className="w-3 h-3" />
                                    Active
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(todo.id)
                          }}
                          className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-5 h-5 flex-shrink-0" />
                        </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!loading && filteredTodos.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24"
                >
                    <div className="w-24 h-24 bg-gray-100 dark:bg-slate-900/40 rounded-[40px] flex items-center justify-center mx-auto mb-8 rotate-12 group-hover:rotate-0 transition-transform">
                        <CheckSquare className="w-12 h-12 text-gray-300 dark:text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                        {searchQuery ? 'No tasks found' : 'All clear for now'}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium max-w-xs mx-auto">
                        {searchQuery ? 'Try a different search term.' : 'You\'ve mastered your productivity. Why not take a break?'}
                    </p>
                </motion.div>
                )}
            </div>
          </main>
        </div>
      </div>

      <BottomNav onAddClick={() => inputRef.current?.focus()} />
    </div>
  )
}
