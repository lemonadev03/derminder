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
    <div className="relative group">
      {/* Outer glow - responds to time of day */}
      <div 
        className={cn(
          "absolute -inset-1 rounded-[20px] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500",
          isEvening 
            ? "bg-gradient-to-r from-indigo-600/40 via-violet-500/40 to-fuchsia-500/40" 
            : "bg-gradient-to-r from-amber-500/40 via-orange-400/40 to-rose-400/40"
        )}
      />
      
      {/* Main container */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl">
        {/* Inner gradient accent at top */}
        <div 
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] transition-all duration-500",
            isEvening 
              ? "bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" 
              : "bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
          )}
        />
        
        <div className="flex items-center px-1 py-1">
          {/* Back Arrow */}
          <button
            onClick={goBack}
            className="group/btn relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-white/[0.05] active:scale-90"
            aria-label="Previous time slot"
          >
            <svg 
              className="w-4 h-4 text-white/25 group-hover/btn:text-white/50 transition-colors duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center gap-5 py-2">
            {/* Day Display */}
            <div className="flex flex-col items-center">
              <span className="text-white/80 font-medium text-base tracking-wide">
                {getDayAbbreviation(currentDay)}
              </span>
            </div>
            
            {/* Time Period Indicator */}
            <div className="relative">
              {/* Glow behind pill */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-full blur-md transition-all duration-500",
                  isEvening 
                    ? "bg-violet-500/40" 
                    : "bg-amber-500/40"
                )}
              />
              
              {/* The pill */}
              <div 
                className={cn(
                  "relative flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full transition-all duration-300",
                  isEvening 
                    ? "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" 
                    : "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500"
                )}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
                
                <span className="relative text-sm leading-none drop-shadow-sm">
                  {isEvening ? '🌙' : '☀️'}
                </span>
                <span className="relative text-white font-semibold text-xs uppercase tracking-wider drop-shadow-sm">
                  {isEvening ? 'Night' : 'Morning'}
                </span>
              </div>
            </div>
          </div>

          {/* Forward Arrow */}
          <button
            onClick={goForward}
            className="group/btn relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-white/[0.05] active:scale-90"
            aria-label="Next time slot"
          >
            <svg 
              className="w-4 h-4 text-white/25 group-hover/btn:text-white/50 transition-colors duration-200" 
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
    </div>
  );
}
