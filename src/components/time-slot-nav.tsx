'use client';

import { cn } from '@/lib/utils';

interface TimeSlotNavProps {
  selectedDate: Date;
  isEvening: boolean;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function TimeSlotNav({ selectedDate, isEvening, onNavigate }: TimeSlotNavProps) {
  // Format the date for display
  const dayAbbrev = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = selectedDate.getDate();
  const monthAbbrev = selectedDate.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="flex items-center px-1 py-1">
        {/* Back Arrow */}
        <button
          onClick={() => onNavigate('prev')}
          className="flex items-center justify-center w-10 h-10 rounded-md transition-all duration-150 hover:bg-secondary active:scale-95"
          aria-label="Previous time slot"
        >
          <svg 
            className="w-4 h-4 text-muted-foreground transition-transform duration-150 hover:-translate-x-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center gap-5 py-1">
          {/* Day Display */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-foreground font-medium text-base transition-all duration-300">
              {dayAbbrev}
            </span>
            <span className="text-muted-foreground text-sm transition-all duration-300">
              {monthAbbrev} {dayNum}
            </span>
          </div>
          
          {/* Time Period Indicator */}
          <div 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              "transition-all duration-300 ease-out",
              isEvening 
                ? "bg-indigo-500/20 text-indigo-400" 
                : "bg-amber-500/20 text-amber-400"
            )}
          >
            <span className="text-base leading-none">
              {isEvening ? '🌙' : '☀️'}
            </span>
            <span>
              {isEvening ? 'Evening' : 'Morning'}
            </span>
          </div>
        </div>

        {/* Forward Arrow */}
        <button
          onClick={() => onNavigate('next')}
          className="flex items-center justify-center w-10 h-10 rounded-md transition-all duration-150 hover:bg-secondary active:scale-95"
          aria-label="Next time slot"
        >
          <svg 
            className="w-4 h-4 text-muted-foreground transition-transform duration-150 hover:translate-x-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
