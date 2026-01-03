'use client';

import { cn } from '@/lib/utils';

interface TimeToggleProps {
  isEvening: boolean;
  onToggle: () => void;
}

export function TimeToggle({ isEvening, onToggle }: TimeToggleProps) {
  return (
    <div className="flex-1 h-14 relative flex rounded-full bg-white/5 backdrop-blur-sm border border-white/10 p-1.5">
        {/* Sliding background pill */}
        <div
          className={cn(
            "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-out",
            isEvening 
              ? "left-[calc(50%+3px)] bg-gradient-to-r from-indigo-600 to-violet-600" 
              : "left-1.5 bg-gradient-to-r from-amber-500 to-orange-500"
          )}
        />
        
        {/* AM Button */}
        <button
          type="button"
          onClick={() => !isEvening || onToggle()}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-colors duration-300",
            !isEvening ? "text-white" : "text-white/50"
          )}
        >
          <span className="text-lg">☀️</span>
          <span className="font-semibold text-base">AM</span>
        </button>
        
        {/* PM Button */}
        <button
          type="button"
          onClick={() => isEvening || onToggle()}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-colors duration-300",
            isEvening ? "text-white" : "text-white/50"
          )}
        >
          <span className="text-lg">🌙</span>
          <span className="font-semibold text-base">PM</span>
        </button>
    </div>
  );
}
