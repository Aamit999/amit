import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addDays } from 'date-fns';
import { Task, DAY_NAMES, HOLIDAYS, HEBREW_DATES } from '../constants';
import { cn } from '../lib/utils';

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

export default function MonthView({ currentDate, tasks, onDayClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const today = new Date();

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getHolidays = (date: Date) => {
    const ds = format(date, 'yyyy-MM-dd');
    return HOLIDAYS.filter(h => {
      const start = parseISO(h.date);
      const end = addDays(start, h.duration - 1);
      return date >= start && date <= end;
    });
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_NAMES.map((name, i) => (
          <div key={i} className={cn("p-3 text-center text-[10px] font-bold text-text-mute uppercase tracking-widest border-l border-border last:border-l-0", i === 6 && "text-gold/60")}>
            {name.slice(0, 2)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const ds = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayTasks = tasks.filter(t => t.date === ds);
          const hols = getHolidays(day);

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[100px] sm:min-h-[120px] p-2 border-l border-b border-border last:border-l-0 cursor-pointer hover:bg-bg-hover transition-colors relative overflow-hidden",
                !isCurrentMonth && "opacity-30",
                isToday && "bg-gold/5",
                hols.length > 0 && "bg-gold/[0.03]"
              )}
            >
              {isToday && <div className="absolute top-0 right-0 w-[3px] h-full bg-gold" />}
              
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-bold",
                  isToday ? "w-6 h-6 bg-gold text-white rounded-full flex items-center justify-center" : "text-text-prime"
                )}>
                  {day.getDate()}
                </span>
                <span className="text-[9px] text-text-mute">{HEBREW_DATES[ds] || ''}</span>
              </div>

              {hols.filter(h => !h.minor).map((h, idx) => (
                <span key={idx} className="block text-[9px] font-bold text-gold truncate">
                  {h.icon} {h.name}
                </span>
              ))}

              <div className="mt-2 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "text-[9px] p-0.5 px-1.5 rounded truncate",
                      t.priority === 'high' ? 'bg-ember-dim text-[#9a1c0a]' :
                      t.priority === 'medium' ? 'bg-gold-dim text-[#7a5010]' :
                      'bg-sapphire-dim text-[#1a4a90]',
                      t.done && "opacity-40 line-through"
                    )}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[8px] text-text-mute font-bold">+{dayTasks.length - 3} נוספות</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
