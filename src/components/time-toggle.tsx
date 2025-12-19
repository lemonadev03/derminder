'use client';

import { cn } from '@/lib/utils';

interface TimeToggleProps {
  isEvening: boolean;
  onToggle: () => void;
}

export function TimeToggle({ isEvening, onToggle }: TimeToggleProps) {
  return (
    <div className="relative inline-flex rounded-full bg-white/5 backdrop-blur-sm border border-white/10 p-1">
        {/* Sliding background pill */}
        <div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-out",
            isEvening 
              ? "left-[calc(50%+1px)] bg-gradient-to-r from-indigo-600 to-violet-600" 
              : "left-1 bg-gradient-to-r from-amber-500 to-orange-500"
          )}
        />
        
        {/* AM Button */}
        <button
          type="button"
          onClick={() => !isEvening || onToggle()}
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full transition-colors duration-300",
            !isEvening ? "text-white" : "text-white/50"
          )}
        >
          <span className="text-base">☀️</span>
          <span className="font-semibold text-sm">AM</span>
        </button>
        
        {/* PM Button */}
        <button
          type="button"
          onClick={() => isEvening || onToggle()}
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full transition-colors duration-300",
            isEvening ? "text-white" : "text-white/50"
          )}
        >
          <span className="text-base">🌙</span>
          <span className="font-semibold text-sm">PM</span>
        </button>
    </div>
  );
}
