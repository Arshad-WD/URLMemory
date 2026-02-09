'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Sparkles } from 'lucide-react'

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (date: Date) => void
  bookmarkTitle: string | null
}

export default function ReminderModal({ isOpen, onClose, onSave, bookmarkTitle }: ReminderModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const presets = [
    { 
      id: '1h',
      label: '1 Hour', 
      sublabel: 'Quick reminder',
      gradient: 'from-emerald-400 to-teal-500',
      getDate: () => new Date(Date.now() + 60 * 60 * 1000) 
    },
    { 
      id: '3h',
      label: '3 Hours', 
      sublabel: 'Later today',
      gradient: 'from-blue-400 to-indigo-500',
      getDate: () => new Date(Date.now() + 3 * 60 * 60 * 1000) 
    },
    { 
      id: 'tomorrow',
      label: 'Tomorrow', 
      sublabel: '9:00 AM',
      gradient: 'from-violet-400 to-purple-500',
      getDate: () => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        d.setHours(9, 0, 0, 0)
        return d
      }
    },
    { 
      id: 'week',
      label: 'Next Week', 
      sublabel: 'Monday 9 AM',
      gradient: 'from-orange-400 to-pink-500',
      getDate: () => {
        const d = new Date()
        d.setDate(d.getDate() + 7)
        d.setHours(9, 0, 0, 0)
        return d
      }
    },
  ]

  const handlePreset = async (preset: typeof presets[0]) => {
    setSelectedPreset(preset.id)
    setLoading(true)
    await onSave(preset.getDate())
    setLoading(false)
    setSelectedPreset(null)
  }

  const handleCustomSave = async () => {
    if (!selectedDate || !selectedTime) return
    setLoading(true)
    const date = new Date(`${selectedDate}T${selectedTime}`)
    await onSave(date)
    setLoading(false)
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-4 right-4 bottom-4 lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:right-auto z-50 lg:w-full lg:max-w-md"
          >
            <div className="bg-gradient-to-br from-white via-white to-indigo-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-900/30 rounded-[2rem] shadow-2xl shadow-indigo-500/10 dark:shadow-black/30 overflow-hidden border border-white/50 dark:border-slate-700/50">
              {/* Header with gradient accent */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-10" />
                <div className="relative p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30"
                      >
                        <Bell className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Set Reminder</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[180px]">
                          {bookmarkTitle || 'Your bookmark'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="px-6 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Quick Options
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset, idx) => (
                    <motion.button
                      key={preset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handlePreset(preset)}
                      disabled={loading}
                      className={`relative overflow-hidden p-4 rounded-2xl text-left transition-all duration-200 ${
                        selectedPreset === preset.id
                          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800'
                          : 'hover:scale-[1.02] active:scale-[0.98]'
                      } ${loading && selectedPreset !== preset.id ? 'opacity-50' : ''}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${preset.gradient} opacity-10`} />
                      <div className="relative">
                        <p className="font-bold text-gray-900 dark:text-white">{preset.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{preset.sublabel}</p>
                      </div>
                      {selectedPreset === preset.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />
              </div>

              {/* Custom Date/Time */}
              <div className="p-6 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Pick exact time
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="date"
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100/80 dark:bg-slate-900/50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white text-sm font-medium [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100/80 dark:bg-slate-900/50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white text-sm font-medium [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCustomSave}
                  disabled={!selectedDate || !selectedTime || loading}
                  className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Setting...
                    </span>
                  ) : 'Set Reminder'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
