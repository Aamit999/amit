import React from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Task, DAY_NAMES, MONTH_NAMES, HOLIDAYS } from '../constants';
import { cn } from '../lib/utils';

interface WeekViewProps {
  currentDate: Date;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (date: string) => void;
  onSaveTask: (task: Omit<Task, 'id' | 'created'>) => void;
  onDayClick: (date: Date) => void;
}

export default function WeekView({ currentDate, tasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask, onSaveTask, onDayClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const today = new Date();
  const [inlineAdd, setInlineAdd] = React.useState<{ date: string; index: number } | null>(null);
  const [inlineEditId, setInlineEditId] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const handleInlineSubmit = (date: string, taskId?: string) => {
    const trimmed = inputValue.trim();
    if (taskId) {
      if (trimmed) {
        onUpdateTask(taskId, { title: trimmed });
      } else {
        onDeleteTask(taskId);
      }
    } else if (trimmed) {
      onSaveTask({
        title: trimmed,
        date,
        done: false,
        priority: 'medium',
        time: '',
        note: ''
      });
    }
    setInlineAdd(null);
    setInlineEditId(null);
    setInputValue('');
  };

  const getHolidays = (date: Date) => {
    const ds = format(date, 'yyyy-MM-dd');
    return HOLIDAYS.filter(h => {
      if (h.minor) return false;
      const start = parseISO(h.date);
      const end = addDays(start, h.duration - 1);
      return date >= start && date <= end;
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 border border-border rounded-xl overflow-hidden bg-bg-card">
      {Array.from({ length: 7 }).map((_, i) => {
        const day = addDays(weekStart, i);
        const ds = format(day, 'yyyy-MM-dd');
        const isToday = isSameDay(day, today);
        const dayTasks = tasks.filter(t => t.date === ds);
        const hols = getHolidays(day);

        return (
          <div
            key={i}
            className={cn(
              "flex flex-col border-b border-border min-h-[200px]",
              i % 2 === 0 ? "border-l" : "",
              isToday && "bg-[#fdfaf3]",
              i >= 5 && "border-b-0" // Rough approximation for last row
            )}
          >
            <div
              onClick={() => onDayClick(day)}
              className="p-3 px-4 border-b-1.5 border-border flex items-center justify-between cursor-pointer hover:bg-bg-hover transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-frank font-bold text-sm sm:text-base truncate">
                  יום {DAY_NAMES[day.getDay()]} {day.getDate()} ב{MONTH_NAMES[day.getMonth()]}'
                </span>
                {isToday && <div className="w-2 h-2 bg-text-prime rounded-sm flex-shrink-0" />}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onAddTask(ds); }}
                className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-text-mute hover:border-gold hover:text-gold transition-all"
              >
                +
              </button>
            </div>

            {hols.length > 0 && (
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gold/5 border-b border-gold/15 text-[10px] sm:text-xs font-bold text-gold">
                {hols.map((h, idx) => (
                  <React.Fragment key={idx}>
                    <span>{h.icon} {h.name}</span>
                    {idx < hols.length - 1 && <span className="opacity-30">·</span>}
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="flex-1 flex flex-col">
              {Array.from({ length: Math.max(6, dayTasks.length) }).map((_, l) => {
                const task = dayTasks[l];
                const isEditing = inlineAdd?.date === ds && inlineAdd?.index === l;
                const isEditingTask = task && inlineEditId === task.id;

                return (
                  <div
                    key={l}
                    onClick={() => {
                      if (task) {
                        if (!isEditingTask) {
                          setInlineEditId(task.id);
                          setInputValue(task.title);
                          setInlineAdd(null);
                        }
                      } else if (!isEditing) {
                        setInlineAdd({ date: ds, index: l });
                        setInputValue('');
                        setInlineEditId(null);
                      }
                    }}
                    className="group min-h-[36px] border-b border-[#e8e4de] last:border-b-0 p-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-[#faf8f4] transition-colors"
                  >
                    {task && !isEditingTask ? (
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                          className={cn(
                            "w-3.5 h-3.5 rounded-full border-1.5 flex items-center justify-center text-[8px] transition-all",
                            task.done ? "bg-jade border-jade text-white" : "border-[#bbb] text-transparent hover:border-gold"
                          )}
                        >
                          {task.done && "✓"}
                        </button>
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", 
                          task.priority === 'high' ? 'bg-ember' : 
                          task.priority === 'medium' ? 'bg-gold' : 'bg-sapphire'
                        )} />
                        <span className={cn("flex-1 text-[11px] sm:text-sm font-medium truncate", task.done && "line-through text-text-mute")}>
                          {task.title}
                        </span>
                        {task.time && <span className="text-[10px] text-text-mute hidden sm:inline">{task.time}</span>}
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-text-mute hover:text-ember transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (isEditing || isEditingTask) ? (
                      <input
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-[11px] sm:text-sm font-medium text-text-prime placeholder:text-text-mute"
                        placeholder={isEditingTask ? "ערוך משימה..." : "הקלד משימה..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInlineSubmit(ds, isEditingTask ? task.id : undefined);
                          if (e.key === 'Escape') {
                            setInlineAdd(null);
                            setInlineEditId(null);
                          }
                        }}
                        onBlur={() => handleInlineSubmit(ds, isEditingTask ? task.id : undefined)}
                      />
                    ) : (
                      <span className="text-[10px] text-text-mute opacity-0 group-hover:opacity-100 transition-opacity">
                        + הוסף משימה
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
