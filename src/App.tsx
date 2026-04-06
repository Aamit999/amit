import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Plus, Sparkles } from 'lucide-react';
import { Task, HOLIDAYS, DAY_NAMES, MONTH_NAMES } from './constants';
import { cn } from './lib/utils';

// Components
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import YearView from './components/YearView';
import TaskModal from './components/TaskModal';
import UpcomingSidebar from './components/UpcomingSidebar';
import Chatbot from './components/Chatbot';

export default function App() {
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('calTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();

  useEffect(() => {
    localStorage.setItem('calTasks', JSON.stringify(tasks));
  }, [tasks]);

  const navigate = (dir: number) => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') dir > 0 ? setCurrentDate(addDays(currentDate, 1)) : setCurrentDate(subDays(currentDate, 1));
    else if (currentView === 'week') dir > 0 ? setCurrentDate(addDays(currentDate, 7)) : setCurrentDate(subDays(currentDate, 7));
    else if (currentView === 'month') dir > 0 ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(subMonths(currentDate, 1));
    else if (currentView === 'year') dir > 0 ? setCurrentDate(addYears(currentDate, 1)) : setCurrentDate(subYears(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleAddTask = (date?: string, time?: string) => {
    setModalInitialDate(date);
    setModalInitialTime(time);
    setIsModalOpen(true);
  };

  const saveTask = (taskData: Omit<Task, 'id' | 'created'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      created: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const getLabel = () => {
    if (currentView === 'day') return `${DAY_NAMES[currentDate.getDay()]} ${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()]}`;
    if (currentView === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = addDays(start, 6);
      return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
    }
    if (currentView === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    return String(currentDate.getFullYear());
  };

  const currentHoliday = HOLIDAYS.find(h => !h.minor && isSameDay(parseISO(h.date), currentDate));

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-void/92 backdrop-blur-xl border-b border-border px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-gold to-[#6b4f10] rounded-lg flex items-center justify-center text-white shadow-lg shadow-gold-glow">
              <Sparkles size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-frank text-xl font-bold text-text-prime leading-none">יומן</h1>
              <span className="text-[10px] text-text-mute uppercase tracking-widest font-bold">Task Calendar</span>
            </div>
          </div>

          <nav className="flex items-center bg-bg-card border border-border rounded-xl p-1">
            {(['day', 'week', 'month', 'year'] as const).map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={cn(
                  "px-3 sm:px-5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all",
                  currentView === view ? "bg-gold-dim text-gold shadow-sm" : "text-text-sec hover:bg-bg-hover"
                )}
              >
                {view === 'day' ? 'יום' : view === 'week' ? 'שבוע' : view === 'month' ? 'חודש' : 'שנה'}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg border border-border bg-bg-card flex items-center justify-center text-text-sec hover:border-gold hover:text-gold transition-all">
                <ChevronRight size={18} />
              </button>
              <span className="text-sm font-bold text-text-prime min-w-[120px] text-center cursor-pointer hover:text-gold transition-colors" onClick={goToToday}>
                {getLabel()}
              </span>
              <button onClick={() => navigate(1)} className="w-9 h-9 rounded-lg border border-border bg-bg-card flex items-center justify-center text-text-sec hover:border-gold hover:text-gold transition-all">
                <ChevronLeft size={18} />
              </button>
            </div>
            <button onClick={goToToday} className="hidden sm:block px-4 py-2 rounded-lg border border-border bg-bg-card text-xs font-bold text-text-sec hover:border-gold hover:text-gold transition-all">
              היום
            </button>
            <button
              onClick={() => handleAddTask()}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-br from-gold to-[#7a5010] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-gold-glow hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">משימה חדשה</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-header */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-border">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg border border-border bg-bg-card flex items-center justify-center text-text-sec">
              <ChevronRight size={16} />
            </button>
            <span className="text-xs font-bold text-text-prime truncate max-w-[100px]">
              {getLabel()}
            </span>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-lg border border-border bg-bg-card flex items-center justify-center text-text-sec">
              <ChevronLeft size={16} />
            </button>
          </div>
          <button onClick={goToToday} className="px-3 py-1.5 rounded-lg border border-border bg-bg-card text-[10px] font-bold text-text-sec">
            היום
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {currentHoliday && currentView === 'day' && (
          <div className="bg-gold-dim border border-gold/20 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-3xl">{currentHoliday.icon}</span>
            <div>
              <h2 className="text-gold font-bold text-lg leading-none">{currentHoliday.name}</h2>
              <p className="text-text-sec text-xs mt-1">היום חל {currentHoliday.name}</p>
            </div>
          </div>
        )}

        <div className={cn(
          "grid gap-6",
          currentView !== 'year' ? "grid-cols-1 lg:grid-cols-[1fr_260px]" : "grid-cols-1"
        )}>
          <div className="space-y-6">
            {currentView === 'day' && (
              <DayView
                currentDate={currentDate}
                tasks={tasks}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                onAddTask={handleAddTask}
                onSaveTask={saveTask}
              />
            )}
            {currentView === 'week' && (
              <WeekView
                currentDate={currentDate}
                tasks={tasks}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                onAddTask={handleAddTask}
                onSaveTask={saveTask}
                onDayClick={(d) => { setCurrentDate(d); setCurrentView('day'); }}
              />
            )}
            {currentView === 'month' && (
              <MonthView
                currentDate={currentDate}
                tasks={tasks}
                onDayClick={(d) => { setCurrentDate(d); setCurrentView('day'); }}
              />
            )}
            {currentView === 'year' && (
              <YearView
                currentDate={currentDate}
                tasks={tasks}
                onDayClick={(d) => { setCurrentDate(d); setCurrentView('day'); }}
                onMonthClick={(d) => { setCurrentDate(d); setCurrentView('month'); }}
              />
            )}
          </div>

          {currentView !== 'year' && (
            <div className="hidden lg:block">
              <UpcomingSidebar onHolidayClick={(d) => { setCurrentDate(d); setCurrentView('day'); }} />
            </div>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTask}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
      />

      <Chatbot
        tasks={tasks}
        onAddTask={saveTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        currentDate={currentDate}
      />
    </div>
  );
}
