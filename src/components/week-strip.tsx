'use client';

import { cn } from '@/lib/utils';
import { useTrackingContext, formatDate } from '@/lib/tracking';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeekStripProps {
  onDayClick?: (date: Date) => void;
  onCalendarClick?: () => void;
  selectedDate?: Date;
}

// Get week dates for a given date (week starts on Sunday)
function getWeekDatesForDate(date: Date): Date[] {
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function WeekStrip({ onDayClick, onCalendarClick, selectedDate }: WeekStripProps) {
  const { getSectionCompletion } = useTrackingContext();
  const today = formatDate(new Date());
  
  // Get week dates based on selected date, or current week if none
  const weekDates = getWeekDatesForDate(selectedDate || new Date());
  const selectedDateStr = selectedDate ? formatDate(selectedDate) : today;

  // Get month name from the week dates (use middle of week to handle edge cases)
  const midWeekDate = weekDates[3] || weekDates[0];
  const monthName = midWeekDate.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="space-y-2">
      {/* Month indicator with calendar button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {monthName}
        </span>
        {onCalendarClick && (
          <button
            onClick={onCalendarClick}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150 active:scale-95"
            aria-label="Open calendar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Week days */}
      <div className="flex items-center justify-between gap-1 px-2 py-2 rounded-lg bg-card border border-border">
        {weekDates.map((date, index) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDateStr;
          const dayNum = date.getDate();
          
          // Get completion level for each section (0, 1, or 2)
          const faceLevel = getSectionCompletion(dateStr, 'face');
          const scalpLevel = getSectionCompletion(dateStr, 'scalp');
          const oralsLevel = getSectionCompletion(dateStr, 'orals');
          const hasAnyCompletion = faceLevel > 0 || scalpLevel > 0 || oralsLevel > 0;

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(date)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-md",
                "transition-all duration-200 ease-out",
                "hover:bg-secondary active:scale-95",
                isToday && !isSelected && "bg-secondary/50",
                isSelected && "bg-secondary ring-1 ring-foreground/20"
              )}
            >
              {/* Day name */}
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-wide transition-colors duration-150",
                isSelected ? "text-foreground" : isToday ? "text-foreground/70" : "text-muted-foreground"
              )}>
                {DAY_NAMES[index]}
              </span>
              
              {/* Day number */}
              <span className={cn(
                "text-sm font-medium transition-colors duration-150",
                isSelected ? "text-foreground" : isToday ? "text-foreground/70" : "text-muted-foreground"
              )}>
                {dayNum}
              </span>
              
              {/* Completion indicator - 3 dots with brightness levels */}
              <div className="flex gap-0.5">
                {hasAnyCompletion ? (
                  <>
                    <CompletionDot level={faceLevel} color="rose" />
                    <CompletionDot level={scalpLevel} color="teal" />
                    <CompletionDot level={oralsLevel} color="amber" />
                  </>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-border transition-colors duration-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Completion dot with 3 brightness levels:
// 0 = very dim (neither morning nor evening)
// 1 = medium (morning OR evening done)
// 2 = full brightness (both done)
function CompletionDot({ level, color }: { level: 0 | 1 | 2; color: 'rose' | 'teal' | 'amber' }) {
  const colorClasses = {
    rose: {
      0: 'bg-rose-400/20',
      1: 'bg-rose-400/50',
      2: 'bg-rose-400',
    },
    teal: {
      0: 'bg-teal-400/20',
      1: 'bg-teal-400/50',
      2: 'bg-teal-400',
    },
    amber: {
      0: 'bg-amber-400/20',
      1: 'bg-amber-400/50',
      2: 'bg-amber-400',
    },
  };

  return (
    <div className={cn(
      "h-1.5 w-1.5 rounded-full transition-all duration-300",
      colorClasses[color][level]
    )} />
  );
}
