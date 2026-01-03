'use client';

import { cn } from '@/lib/utils';
import { ProductBadge } from './product-badge';
import { 
  RoutineSection, 
  DayOfWeek, 
  getEveningRoutineForDay,
  getDayAbbreviation 
} from '@/lib/routines';
import { useTrackingContext, formatDate, EntryKey } from '@/lib/tracking';

interface RoutineCardProps {
  section: RoutineSection;
  isEvening: boolean;
  currentDay: DayOfWeek;
}

const accentStyles = {
  rose: {
    border: 'border-l-rose-500',
    text: 'text-rose-400',
    check: 'bg-rose-500/20 text-rose-400',
  },
  teal: {
    border: 'border-l-teal-500',
    text: 'text-teal-400',
    check: 'bg-teal-500/20 text-teal-400',
  },
  amber: {
    border: 'border-l-amber-500',
    text: 'text-amber-400',
    check: 'bg-amber-500/20 text-amber-400',
  },
};

export function RoutineCard({ section, isEvening, currentDay }: RoutineCardProps) {
  const { toggleEntry, isEntryComplete, getEntryTimestamp } = useTrackingContext();
  
  const routine = isEvening 
    ? getEveningRoutineForDay(section, currentDay) 
    : section.routines.morning;

  if (!routine) return null;

  // Build the entry key for this card
  const timeOfDay = isEvening ? 'evening' : 'morning';
  const entryKey = `${section.id}_${timeOfDay}` as EntryKey;
  const today = formatDate(new Date());
  
  const isComplete = isEntryComplete(today, entryKey);
  const timestamp = getEntryTimestamp(today, entryKey);

  // Check if this section has day-specific evening routines
  const hasDaySpecificRoutine = isEvening && Array.isArray(section.routines.evening);
  const applicableDays = hasDaySpecificRoutine && routine.daysApplicable 
    ? routine.daysApplicable.map(getDayAbbreviation).join(', ')
    : null;

  const formatTimestamp = (ts: string): string => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleToggle = () => {
    toggleEntry(today, entryKey);
  };

  const styles = accentStyles[section.accentColor];

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative w-full text-left",
        "rounded-lg bg-card border border-border",
        "border-l-[3px]",
        styles.border,
        "transition-colors duration-200",
        "hover:bg-secondary",
        isComplete && "opacity-75"
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{section.icon}</span>
            <h2 className={cn("text-base font-medium", styles.text)}>
              {section.title}
            </h2>
            {applicableDays && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                {applicableDays}
              </span>
            )}
          </div>
          
          {/* Completion indicator with timestamp */}
          <div className="flex items-center gap-2">
            {isComplete && timestamp && (
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(timestamp)}
              </span>
            )}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
              isComplete
                ? styles.check
                : "border border-border"
            )}>
              {isComplete && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
        
        {/* Products */}
        <div className="flex flex-wrap gap-1.5">
          {routine.products.map((product) => (
            <ProductBadge 
              key={product.id} 
              name={product.name}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
