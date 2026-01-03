'use client';

import { cn } from '@/lib/utils';
import { DayOfWeek, getDayAbbreviation, getPreviousDay, getNextDay } from '@/lib/routines';

interface TimeSlotNavProps {
  currentDay: DayOfWeek;
  isEvening: boolean;
  onNavigate: (day: DayOfWeek, isEvening: boolean) => void;
}

export function TimeSlotNav({ currentDay, isEvening, onNavigate }: TimeSlotNavProps) {
  const goBack = () => {
    if (isEvening) {
      onNavigate(currentDay, false);
    } else {
      onNavigate(getPreviousDay(currentDay), true);
    }
  };

  const goForward = () => {
    if (isEvening) {
      onNavigate(getNextDay(currentDay), false);
    } else {
      onNavigate(currentDay, true);
    }
  };

  return (
    <div className="rounded-lg bg-card border border-border">
      <div className="flex items-center px-1 py-1">
        {/* Back Arrow */}
        <button
          onClick={goBack}
          className="flex items-center justify-center w-10 h-10 rounded-md transition-colors hover:bg-secondary"
          aria-label="Previous time slot"
        >
          <svg 
            className="w-4 h-4 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center gap-4 py-2">
          {/* Day Display */}
          <span className="text-foreground font-medium text-sm">
            {getDayAbbreviation(currentDay)}
          </span>
          
          {/* Time Period Indicator */}
          <div 
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium",
              isEvening 
                ? "bg-indigo-500/15 text-indigo-400" 
                : "bg-amber-500/15 text-amber-400"
            )}
          >
            <span className="text-sm leading-none">
              {isEvening ? '🌙' : '☀️'}
            </span>
            <span>
              {isEvening ? 'Evening' : 'Morning'}
            </span>
          </div>
        </div>

        {/* Forward Arrow */}
        <button
          onClick={goForward}
          className="flex items-center justify-center w-10 h-10 rounded-md transition-colors hover:bg-secondary"
          aria-label="Next time slot"
        >
          <svg 
            className="w-4 h-4 text-muted-foreground" 
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
