import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'created'>) => void;
  initialDate?: string;
  initialTime?: string;
}

export default function TaskModal({ isOpen, onClose, onSave, initialDate, initialTime }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState(initialTime || '09:00');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [note, setNote] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (initialDate) setDate(initialDate);
      if (initialTime) setTime(initialTime);
      setTitle('');
      setNote('');
      setPriority('medium');
    }
  }, [isOpen, initialDate, initialTime]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      date,
      time,
      priority,
      note,
      done: false,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-deep border border-border-strong p-8"
            dir="rtl"
          >
            <h2 className="text-2xl font-bold font-frank text-text-prime mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              משימה חדשה
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-sec uppercase tracking-widest mb-2">כותרת המשימה</label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="מה צריך לעשות?"
                  className="w-full p-3 bg-bg-card border border-border rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-sec uppercase tracking-widest mb-2">תאריך</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-bg-card border border-border rounded-lg text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-sec uppercase tracking-widest mb-2">שעה</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-3 bg-bg-card border border-border rounded-lg text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-sec uppercase tracking-widest mb-2">עדיפות</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                        priority === p
                          ? p === 'high' ? 'bg-ember-dim border-ember text-[#a02010]' :
                            p === 'medium' ? 'bg-gold-dim border-gold text-gold' :
                            'bg-sapphire-dim border-sapphire text-[#1a50a0]'
                          : 'bg-white border-border text-text-mute hover:border-border-strong'
                      }`}
                    >
                      {p === 'high' ? '🔴 גבוהה' : p === 'medium' ? '🟡 בינונית' : '🔵 נמוכה'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-sec uppercase tracking-widest mb-2">הערות</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="הערות נוספות (לא חובה)"
                  className="w-full p-3 bg-bg-card border border-border rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-border rounded-lg text-sm font-medium text-text-sec hover:bg-bg-hover transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-3 bg-gold text-white rounded-lg text-sm font-bold shadow-card hover:opacity-90 transition-all"
              >
                שמור משימה
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
