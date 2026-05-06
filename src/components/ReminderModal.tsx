'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Sparkles, Clock, Calendar, Check } from 'lucide-react'

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
      sublabel: 'Quick burst',
      color: 'var(--color-primary)',
      getDate: () => new Date(Date.now() + 60 * 60 * 1000) 
    },
    { 
      id: '3h',
      label: '3 Hours', 
      sublabel: 'Later today',
      color: 'var(--color-accent)',
      getDate: () => new Date(Date.now() + 3 * 60 * 60 * 1000) 
    },
    { 
      id: 'tomorrow',
      label: 'Tomorrow', 
      sublabel: '09:00 AM',
      color: 'var(--color-primary)',
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
      color: 'var(--color-accent)',
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
            className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed inset-x-4 bottom-8 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-xl z-[101]"
          >
            <div className="bg-card/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-10 lg:p-12">
              {/* Header */}
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 animate-glow">
                    <Bell className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Temporal Sync</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 truncate max-w-[200px]">
                      {bookmarkTitle || 'Resource Uplink'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-6 mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-2">Quick Presets</p>
                <div className="grid grid-cols-2 gap-4">
                  {presets.map((preset, idx) => (
                    <motion.button
                      key={preset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handlePreset(preset)}
                      disabled={loading}
                      className={`group relative overflow-hidden p-6 rounded-3xl text-left transition-all border ${
                        selectedPreset === preset.id
                          ? 'border-primary bg-primary/10 shadow-glow shadow-primary/10'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      } ${loading && selectedPreset !== preset.id ? 'opacity-40' : ''}`}
                    >
                      <div className="relative z-10">
                        <p className={`font-black uppercase italic tracking-tight text-lg mb-1 transition-colors ${selectedPreset === preset.id ? 'text-primary' : 'text-foreground'}`}>
                            {preset.label}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{preset.sublabel}</p>
                      </div>
                      {selectedPreset === preset.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4">
                          <Check className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Date/Time */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-2">Custom Manifest</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="date"
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/40 focus:bg-white/10 outline-none text-sm font-black uppercase italic tracking-tighter [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex-1 relative group">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/40 focus:bg-white/10 outline-none text-sm font-black uppercase italic tracking-tighter [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleCustomSave}
                  disabled={!selectedDate || !selectedTime || loading}
                  className="w-full py-5 bg-primary text-primary-foreground font-black rounded-3xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50 mt-4 italic"
                >
                  {loading ? 'Synchronizing Neural Stream...' : 'Initialize Temporal Bookmark'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
