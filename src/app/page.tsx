'use client';

import { useState, useEffect } from 'react';
import { TimeToggle } from '@/components/time-toggle';
import { RoutineCard } from '@/components/routine-card';
import { allSections, getCurrentDayOfWeek, getDayAbbreviation, getPreviousDay, getNextDay, DayOfWeek } from '@/lib/routines';

export default function Home() {
  const [isEvening, setIsEvening] = useState(false);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>('monday');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-detect time of day
    const hour = new Date().getHours();
    setIsEvening(hour >= 12);
    setCurrentDay(getCurrentDayOfWeek());
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
            Derminder
          </h1>
          <p className="text-white/40 text-sm">
            Your daily skincare routine
          </p>
        </header>

        {/* Day + Time Toggle Row */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setCurrentDay(getPreviousDay(currentDay))}
              className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-l-full transition-colors"
              aria-label="Previous day"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white/50 font-medium text-sm px-2 py-2 min-w-[3rem] text-center">
              {getDayAbbreviation(currentDay)}
            </span>
            <button
              onClick={() => setCurrentDay(getNextDay(currentDay))}
              className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-r-full transition-colors"
              aria-label="Next day"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <TimeToggle 
            isEvening={isEvening} 
            onToggle={() => setIsEvening(!isEvening)} 
          />
        </div>

        {/* Routine Cards */}
        <div className="space-y-4">
          {allSections.map((section) => (
            <RoutineCard
              key={section.id}
              section={section}
              isEvening={isEvening}
              currentDay={currentDay}
            />
          ))}
        </div>

        {/* Time indicator */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            {isEvening ? '🌙 Evening routine' : '☀️ Morning routine'}
          </p>
        </div>
      </div>
    </main>
  );
}
