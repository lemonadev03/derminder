'use client';

import { useState, useEffect } from 'react';
import { RoutineCard } from '@/components/routine-card';
import { WeekStrip } from '@/components/week-strip';
import { TimeSlotNav } from '@/components/time-slot-nav';
import { CalendarModal } from '@/components/calendar-modal';
import { TrackingProvider, useTrackingContext, formatDate, hasAuthCredentials, setAuthCredentials } from '@/lib/tracking';
import { allSections, getCurrentDayOfWeek, DayOfWeek } from '@/lib/routines';

function HomeContent() {
  const [isEvening, setIsEvening] = useState(false);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>('monday');
  const [mounted, setMounted] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarInitialDate, setCalendarInitialDate] = useState<Date | undefined>();
  const [showAuth, setShowAuth] = useState(false);
  const [authInput, setAuthInput] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const { isOnline, hasPendingSync, isSyncing, syncToServer, fetchLogs } = useTrackingContext();

  useEffect(() => {
    setMounted(true);
    // Auto-detect time of day
    const hour = new Date().getHours();
    setIsEvening(hour >= 12);
    setCurrentDay(getCurrentDayOfWeek());
    
    // Check if we need auth
    if (!hasAuthCredentials()) {
      setShowAuth(true);
    } else {
      // Fetch today's data
      const today = formatDate(new Date());
      fetchLogs(today, today);
    }
  }, [fetchLogs]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthCredentials(authInput.username, authInput.password);
    
    // Try to sync to verify credentials
    const success = await syncToServer();
    if (success || !navigator.onLine) {
      setShowAuth(false);
      setAuthError('');
      // Fetch logs after auth
      const today = formatDate(new Date());
      fetchLogs(today, today);
    } else {
      setAuthError('Invalid credentials');
    }
  };

  const handleWeekDayClick = (date: Date) => {
    // Open calendar modal with that date selected
    setCalendarInitialDate(date);
    setIsCalendarOpen(true);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  // Auth screen
  if (showAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Derminder</h1>
          <p className="text-white/40 text-sm text-center mb-6">Enter your credentials</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={authInput.username}
                onChange={(e) => setAuthInput(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={authInput.password}
                onChange={(e) => setAuthInput(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
            
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
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
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
            Derminder
          </h1>
        </header>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-2 mb-4 min-h-[24px]">
          {!isOnline && (
            <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
              Offline
            </span>
          )}
          {/* {isSyncing && (
            <span className="text-xs text-teal-400 bg-teal-500/20 px-2 py-1 rounded-full animate-pulse">
              Syncing...
            </span>
          )} */}
          {/* {hasPendingSync && !isSyncing && isOnline && (
            <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
              Changes pending
            </span>
          )} */}
        </div>

        {/* Week Strip - tap to view history */}
        <div className="mb-6">
          <WeekStrip onDayClick={handleWeekDayClick} />
        </div>

        {/* Time Slot Navigation */}
        <div className="mb-6">
          <TimeSlotNav
            currentDay={currentDay}
            isEvening={isEvening}
            onNavigate={(day, evening) => {
              setCurrentDay(day);
              setIsEvening(evening);
            }}
          />
        </div>

        {/* Routine Cards - tap to mark complete */}
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
        {/* <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            {isEvening ? '🌙 Evening routine' : '☀️ Morning routine'}
          </p>
        </div> */}
      </div>

      {/* Calendar Modal */}
      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => {
          setIsCalendarOpen(false);
          setCalendarInitialDate(undefined);
        }}
        initialDate={calendarInitialDate}
      />
    </main>
  );
}

export default function Home() {
  return (
    <TrackingProvider>
      <HomeContent />
    </TrackingProvider>
  );
}
