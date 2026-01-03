'use client';

import { useState, useEffect } from 'react';
import { RoutineCard } from '@/components/routine-card';
import { WeekStrip } from '@/components/week-strip';
import { TimeSlotNav } from '@/components/time-slot-nav';
import { CalendarModal } from '@/components/calendar-modal';
import { TrackingProvider, useTrackingContext, formatDate, hasAuthCredentials, setAuthCredentials } from '@/lib/tracking';
import { allSections, getDayOfWeekFromDate } from '@/lib/routines';

function HomeContent() {
  const [isEvening, setIsEvening] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authInput, setAuthInput] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const { isOnline, syncToServer, fetchLogs } = useTrackingContext();

  // Derive currentDay from selectedDate
  const currentDay = getDayOfWeekFromDate(selectedDate);

  useEffect(() => {
    setMounted(true);
    // Auto-detect time of day
    const hour = new Date().getHours();
    setIsEvening(hour >= 12);
    
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
    setSelectedDate(date);
    // Default to morning when switching days
    setIsEvening(false);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (isEvening) {
        // Go to next day's morning
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay);
        setIsEvening(false);
      } else {
        // Go to same day's evening
        setIsEvening(true);
      }
    } else {
      if (isEvening) {
        // Go to same day's morning
        setIsEvening(false);
      } else {
        // Go to previous day's evening
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setSelectedDate(prevDay);
        setIsEvening(true);
      }
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-fade-in">Loading...</div>
      </div>
    );
  }

  // Auth screen
  if (showAuth) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm mx-4 p-8 rounded-xl bg-card border border-border opacity-0 animate-scale-in">
          <h1 className="text-2xl font-semibold text-foreground mb-1 text-center">Derminder</h1>
          <p className="text-muted-foreground text-sm text-center mb-8">Enter your credentials</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="opacity-0 animate-fade-in-up stagger-1">
              <input
                type="text"
                placeholder="Username"
                value={authInput.username}
                onChange={(e) => setAuthInput(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200"
              />
            </div>
            <div className="opacity-0 animate-fade-in-up stagger-2">
              <input
                type="password"
                placeholder="Password"
                value={authInput.password}
                onChange={(e) => setAuthInput(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200"
              />
            </div>
            
            {authError && (
              <p className="text-destructive text-sm text-center animate-fade-in">{authError}</p>
            )}
            
            <div className="opacity-0 animate-fade-in-up stagger-3">
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <header className="mb-6 opacity-0 animate-fade-in-down">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Derminder
          </h1>
        </header>

        {/* Status bar */}
        <div className="flex items-center gap-2 mb-6 min-h-[24px]">
          {!isOnline && (
            <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md animate-fade-in">
              Offline
            </span>
          )}
        </div>

        {/* Week Strip - tap to view history */}
        <div className="mb-6 opacity-0 animate-fade-in-up stagger-1">
          <WeekStrip 
            onDayClick={handleWeekDayClick} 
            onCalendarClick={() => setIsCalendarOpen(true)}
            selectedDate={selectedDate} 
          />
        </div>

        {/* Time Slot Navigation */}
        <div className="mb-8 opacity-0 animate-fade-in-up stagger-2">
          <TimeSlotNav
            selectedDate={selectedDate}
            isEvening={isEvening}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Routine Cards - tap to mark complete */}
        <div className="space-y-3">
          {allSections.map((section, index) => (
            <div 
              key={section.id} 
              className={`opacity-0 animate-fade-in-up stagger-${index + 3}`}
            >
              <RoutineCard
                section={section}
                isEvening={isEvening}
                currentDay={currentDay}
                selectedDate={selectedDate}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Modal */}
      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
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
