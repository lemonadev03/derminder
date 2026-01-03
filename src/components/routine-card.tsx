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

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative overflow-hidden rounded-2xl w-full text-left",
        "bg-gradient-to-br",
        section.bgGradient,
        "border-2 transition-all duration-300",
        isComplete 
          ? "border-white/30 ring-2 ring-white/10" 
          : "border-white/10 hover:border-white/20",
        "backdrop-blur-xl",
        "group active:scale-[0.98]"
      )}
    >
      {/* Completion overlay */}
      {isComplete && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      )}
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{section.icon}</span>
            <h2 className={cn("text-xl font-bold", section.colorClass)}>
              {section.title}
            </h2>
            {applicableDays && (
              <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-full">
                {applicableDays}
              </span>
            )}
          </div>
          
          {/* Completion indicator with timestamp */}
          <div className="flex items-center gap-2">
            {isComplete && timestamp && (
              <span className="text-xs text-white/50">
                {formatTimestamp(timestamp)}
              </span>
            )}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              isComplete
                ? "bg-white/20"
                : "bg-white/5"
            )}>
              {isComplete ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-white/30" />
              )}
            </div>
          </div>
        </div>
        
        {/* Products */}
        <div className="flex flex-wrap gap-2">
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
