'use client';

import { cn } from '@/lib/utils';
import { ProductBadge } from './product-badge';
import { 
  RoutineSection, 
  DayOfWeek, 
  getEveningRoutineForDay,
  getDayAbbreviation 
} from '@/lib/routines';

interface RoutineCardProps {
  section: RoutineSection;
  isEvening: boolean;
  currentDay: DayOfWeek;
}

export function RoutineCard({ section, isEvening, currentDay }: RoutineCardProps) {
  const routine = isEvening 
    ? getEveningRoutineForDay(section, currentDay) 
    : section.routines.morning;

  if (!routine) return null;

  // Check if this section has day-specific evening routines
  const hasDaySpecificRoutine = isEvening && Array.isArray(section.routines.evening);
  const applicableDays = hasDaySpecificRoutine && routine.daysApplicable 
    ? routine.daysApplicable.map(getDayAbbreviation).join(', ')
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br",
        section.bgGradient,
        "border border-white/10",
        "backdrop-blur-xl",
        "transition-all duration-300 hover:border-white/20",
        "group"
      )}
    >
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
          </div>
          
          {applicableDays && (
            <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {applicableDays}
            </span>
          )}
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
    </div>
  );
}

