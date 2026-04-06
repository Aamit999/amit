import React from 'react';
import { Task } from '../constants';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface TaskChipProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  compact?: boolean;
}

export default function TaskChip({ task, onToggle, onDelete, onUpdate, compact }: TaskChipProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(task.title);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onUpdate(task.id, { title: trimmed });
    } else {
      onDelete(task.id);
    }
    setIsEditing(false);
  };

  const priorityColors = {
    high: 'bg-ember-dim border-ember text-[#9a1c0a]',
    medium: 'bg-gold-dim border-gold text-[#7a5010]',
    low: 'bg-sapphire-dim border-sapphire text-[#1a4a90]',
  };

  if (isEditing) {
    return (
      <div className={cn(
        "group flex items-center gap-2 rounded-lg font-medium transition-all border-r-4",
        compact ? "p-1 px-2 text-xs" : "p-1.5 px-3 text-sm",
        priorityColors[task.priority]
      )}>
        <input
          autoFocus
          className="flex-1 bg-transparent border-none outline-none font-medium text-current placeholder:text-current/50"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setIsEditing(false);
              setInputValue(task.title);
            }
          }}
          onBlur={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex items-center gap-2 rounded-lg font-medium cursor-pointer transition-all border-r-4",
        compact ? "p-1 px-2 text-xs" : "p-1.5 px-3 text-sm",
        priorityColors[task.priority],
        task.done && "opacity-40 line-through"
      )}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className={cn(
          "rounded border-1.5 flex items-center justify-center transition-colors",
          compact ? "w-3 h-3 text-[8px]" : "w-4 h-4 text-[10px]",
          task.done ? "bg-current text-white" : "border-current"
        )}
      >
        {task.done && <Check size={compact ? 8 : 10} strokeWidth={4} />}
      </button>
      
      <span className="flex-1 truncate">{task.title}</span>
      
      {task.note && (
        <span className="text-[10px] opacity-60 truncate max-w-[60px] hidden sm:inline">
          {task.note}
        </span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-opacity"
      >
        <Trash2 size={compact ? 10 : 12} className="text-text-mute hover:text-ember" />
      </button>
    </div>
  );
}
