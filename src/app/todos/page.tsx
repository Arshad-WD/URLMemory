'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckSquare, Square, X } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24">
      <div className="flex">
        <DesktopSidebar 
          onAction={() => inputRef.current?.focus()} 
          actionLabel="Add Task"
        />
        <div className="flex-1 lg:ml-72 min-h-screen">
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Todos
            </h1>
          </div>
        </header>


      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleCreate} className="mb-8 relative group">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 text-lg transition-all"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          {newTask && (
             <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
             >
                <Plus className="w-5 h-5" />
             </button>
          )}
        </form>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {todos.map((todo) => (
              <motion.div
                layout
                key={todo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.01 }}
                className={`group flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer ${
                    todo.isDone 
                        ? 'border-transparent bg-gray-50/50 dark:bg-slate-900/50' 
                        : 'border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
                onClick={() => handleToggle(todo.id, todo.isDone)}
              >
                <button
                  className={`flex-shrink-0 transition-all duration-300 ${
                    todo.isDone ? 'text-indigo-500 scale-110' : 'text-gray-300 hover:text-indigo-500'
                  }`}
                >
                  {todo.isDone ? (
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-lg">
                        <CheckSquare className="w-6 h-6" /> 
                    </div>
                  ) : (
                    <Square className="w-6 h-6" />
                  )}
                </button>
                
                <span className={`flex-1 text-base font-medium transition-all duration-300 ${
                    todo.isDone 
                        ? 'text-gray-400 line-through decoration-2 decoration-indigo-200 dark:decoration-indigo-900' 
                        : 'text-gray-700 dark:text-slate-200'
                }`}>
                  {todo.task}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(todo.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && todos.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-24"
            >
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckSquare className="w-10 h-10 text-gray-300 dark:text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">All tasks completed!</h3>
                <p className="text-gray-500 dark:text-slate-400">Time to relax or add some new goals.</p>
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
