'use client';

import { cn } from '@/lib/utils';
import { useTrackingContext, formatDate, getCurrentWeekDates } from '@/lib/tracking';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeekStripProps {
  onDayClick?: (date: Date) => void;
}

export function WeekStrip({ onDayClick }: WeekStripProps) {
  const { getSectionCompletion } = useTrackingContext();
  const weekDates = getCurrentWeekDates();
  const today = formatDate(new Date());

  return (
    <div className="flex items-center justify-between gap-1 px-2 py-2 rounded-lg bg-card border border-border">
      {weekDates.map((date, index) => {
        const dateStr = formatDate(date);
        const isToday = dateStr === today;
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
              "flex flex-col items-center gap-1 px-2 py-2 rounded-md transition-colors",
              "hover:bg-secondary",
              isToday && "bg-secondary"
            )}
          >
            {/* Day name */}
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              isToday ? "text-foreground" : "text-muted-foreground"
            )}>
              {DAY_NAMES[index]}
            </span>
            
            {/* Day number */}
            <span className={cn(
              "text-sm font-medium",
              isToday ? "text-foreground" : "text-muted-foreground"
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
                <div className="h-1.5 w-1.5 rounded-full bg-border" />
              )}
            </div>
          </button>
        );
      })}
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
      "h-1.5 w-1.5 rounded-full transition-colors",
      colorClasses[color][level]
    )} />
  );
}
