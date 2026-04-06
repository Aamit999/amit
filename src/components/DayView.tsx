import React from 'react';
import { format, isSameDay, parseISO, addDays, startOfHour } from 'date-fns';
import { Task, DAY_NAMES, MONTH_NAMES, HOURS, HEBREW_DATES } from '../constants';
import TaskChip from './TaskChip';

interface DayViewProps {
  currentDate: Date;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (date: string, time?: string) => void;
  onSaveTask: (task: Omit<Task, 'id' | 'created'>) => void;
}

export default function DayView({ currentDate, tasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask, onSaveTask }: DayViewProps) {
  const ds = format(currentDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.date === ds);
  const [inlineAddHour, setInlineAddHour] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const handleInlineSubmit = (hour: string) => {
    if (inputValue.trim()) {
      onSaveTask({
        title: inputValue.trim(),
        date: ds,
        time: hour,
        done: false,
        priority: 'medium',
        note: ''
      });
    }
    setInlineAddHour(null);
    setInputValue('');
  };

  // Filter hours to show only 07:00-22:00 or hours that have tasks
  const visibleHours = HOURS.filter(hour => {
    const [h] = hour.split(':');
    const hourNum = parseInt(h, 10);
    const hasTask = dayTasks.some(t => t.time && t.time.startsWith(h));
    return hasTask || (hourNum >= 7 && hourNum <= 22);
  });

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
      <div className="flex md:flex-col gap-2 md:gap-3 md:w-[200px] flex-shrink-0">
        <div className="bg-white border border-border rounded-xl p-3 md:p-6 flex-1 flex items-center justify-center md:block text-center">
          <div className="text-4xl md:text-6xl font-black font-frank text-gold leading-none ml-3 md:ml-0">{currentDate.getDate()}</div>
          <div className="text-right md:text-center">
            <div className="text-sm md:text-lg font-bold text-text-prime md:mt-2">{DAY_NAMES[currentDate.getDay()]}</div>
            <div className="text-[10px] md:text-xs text-text-sec">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            <div className="text-[9px] md:text-xs text-gold md:mt-2 opacity-80">{HEBREW_DATES[ds] || ''}</div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-2 md:p-4 text-center flex flex-col justify-center min-w-[80px]">
          <div className="text-2xl md:text-3xl font-extrabold text-text-prime leading-none">{dayTasks.length}</div>
          <div className="text-[9px] md:text-[10px] font-bold text-text-sec uppercase tracking-widest mt-1">משימות</div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden flex-1">
        <div className="p-2 px-4 border-b border-border text-[10px] font-bold text-text-sec uppercase tracking-widest">
          לוח זמנים
        </div>
        <div className="divide-y divide-border">
          {/* All Day Tasks */}
          <div className="flex min-h-[32px] hover:bg-bg-hover transition-colors">
            <div className="w-12 md:w-16 p-1 px-2 text-[10px] text-text-mute font-medium border-l border-border flex-shrink-0 flex items-center justify-center md:justify-start">
              כל היום
            </div>
            <div className="flex-1 p-1 px-2 flex flex-col justify-center gap-1">
              {dayTasks.filter(t => !t.time).map(t => (
                <TaskChip key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdate={onUpdateTask} compact />
              ))}
            </div>
          </div>

          {visibleHours.map((hour) => {
            const [h] = hour.split(':');
            const slotTasks = dayTasks.filter(t => t.time && t.time.startsWith(h));
            const isEditing = inlineAddHour === hour;
            const hasContent = slotTasks.length > 0 || isEditing;
            
            return (
              <div
                key={hour}
                onClick={() => {
                  if (!hasContent) {
                    setInlineAddHour(hour);
                    setInputValue('');
                  }
                }}
                className={`flex hover:bg-bg-hover transition-colors group cursor-pointer ${hasContent ? 'min-h-[36px] py-1' : 'h-8'}`}
              >
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setInlineAddHour(hour);
                    setInputValue('');
                  }}
                  className="w-12 md:w-16 px-2 text-[10px] text-text-mute font-medium border-l border-border flex-shrink-0 flex items-center justify-center md:justify-start"
                >
                  {hour}
                </div>
                <div className="flex-1 px-2 flex flex-col justify-center gap-1">
                  {slotTasks.map(t => (
                    <TaskChip key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdate={onUpdateTask} compact />
                  ))}
                  {isEditing ? (
                    <input
                      autoFocus
                      className="w-full bg-transparent border-none outline-none text-[11px] sm:text-sm font-medium text-text-prime placeholder:text-text-mute"
                      placeholder="הקלד משימה..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInlineSubmit(hour);
                        if (e.key === 'Escape') setInlineAddHour(null);
                      }}
                      onBlur={() => handleInlineSubmit(hour)}
                    />
                  ) : !hasContent && (
                    <span className="text-[10px] text-text-mute opacity-0 group-hover:opacity-100 transition-opacity">
                      + הוסף
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
