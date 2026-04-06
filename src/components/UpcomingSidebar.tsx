import React from 'react';
import { format, parseISO, addDays, isAfter } from 'date-fns';
import { HOLIDAYS } from '../constants';

interface UpcomingSidebarProps {
  onHolidayClick: (date: Date) => void;
}

export default function UpcomingSidebar({ onHolidayClick }: UpcomingSidebarProps) {
  const today = new Date();
  const upcoming = HOLIDAYS.filter(h => !h.minor && isAfter(addDays(parseISO(h.date), h.duration), today))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 8);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden sticky top-24">
      <div className="p-4 px-5 border-b border-border text-[10px] font-bold text-text-mute uppercase tracking-[1.5px]">
        חגים קרובים
      </div>
      <div className="divide-y divide-border">
        {upcoming.map((h, i) => {
          const hDate = parseISO(h.date);
          const diff = Math.ceil((hDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div
              key={i}
              onClick={() => onHolidayClick(hDate)}
              className="p-4 px-5 hover:bg-bg-hover transition-colors cursor-pointer group"
            >
              <div className="text-sm font-bold text-gold group-hover:translate-x-[-2px] transition-transform">
                {h.icon} {h.name}
              </div>
              <div className="text-[10px] text-text-sec mt-1">
                {format(hDate, 'dd/MM/yyyy')}
              </div>
              <div className="text-[9px] text-text-mute mt-1 font-medium">
                {diff === 0 ? 'היום!' : diff === 1 ? 'מחר' : `בעוד ${diff} ימים`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
