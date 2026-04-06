import React from 'react';
import { format, isSameMonth, isSameDay, startOfMonth, addMonths, eachDayOfInterval, endOfMonth, startOfWeek, endOfWeek, parseISO, addDays } from 'date-fns';
import { Task, MONTH_NAMES, DAY_NAMES, HOLIDAYS } from '../constants';
import { cn } from '../lib/utils';

interface YearViewProps {
  currentDate: Date;
  tasks: Task[];
  onDayClick: (date: Date) => void;
  onMonthClick: (date: Date) => void;
}

export default function YearView({ currentDate, tasks, onDayClick, onMonthClick }: YearViewProps) {
  const year = currentDate.getFullYear();
  const today = new Date();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, m) => {
        const monthDate = new Date(year, m, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        
        const isCurrentMonth = isSameMonth(monthDate, today);
        const monthTasks = tasks.filter(t => t.date.startsWith(format(monthDate, 'yyyy-MM')));
        const monthHols = HOLIDAYS.filter(h => h.date.startsWith(format(monthDate, 'yyyy-MM')));

        return (
          <div
            key={m}
            className="bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong hover:-translate-y-1 transition-all cursor-pointer shadow-sm hover:shadow-card"
            onClick={() => onMonthClick(monthDate)}
          >
            <div className={cn(
              "p-3 px-4 border-b border-border flex justify-between items-center",
              isCurrentMonth && "bg-gold-dim"
            )}>
              <span className={cn("text-sm font-bold", isCurrentMonth ? "text-gold" : "text-text-prime")}>
                {MONTH_NAMES[m]}
              </span>
            </div>

            <div className="grid grid-cols-7 p-2 gap-0.5">
              {DAY_NAMES.map(n => (
                <div key={n} className="text-center text-[8px] font-bold text-text-mute py-1">{n[0]}</div>
              ))}
              {calendarDays.map((day, i) => {
                const ds = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, today);
                const isCurrent = isSameMonth(day, monthDate);
                const hasHol = HOLIDAYS.some(h => {
                  const start = parseISO(h.date);
                  const end = addDays(start, h.duration - 1);
                  return day >= start && day <= end;
                });
                const hasTask = tasks.some(t => t.date === ds);

                return (
                  <div
                    key={i}
                    onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                    className={cn(
                      "text-center text-[10px] p-1 rounded-full transition-colors relative",
                      !isCurrent && "opacity-10",
                      isToday ? "bg-gold text-white font-bold" : "text-text-sec hover:bg-bg-hover",
                      hasHol && !isToday && "text-gold font-bold",
                    )}
                  >
                    {day.getDate()}
                    {hasTask && !isToday && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sapphire rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-2 px-4 border-t border-border flex gap-3 text-[9px] font-bold text-text-mute">
              {monthTasks.length > 0 && <span>📌 {monthTasks.length} משימות</span>}
              {monthHols.length > 0 && <span>✦ {monthHols.length} חגים</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
