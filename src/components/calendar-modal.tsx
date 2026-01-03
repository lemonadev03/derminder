'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTrackingContext, formatDate } from '@/lib/tracking';
import { DayDetail } from './day-detail';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarModal({ isOpen, onClose, initialDate }: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = initialDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const { getCompletionCount, isOnline, isSyncing, hasPendingSync, fetchLogs } = useTrackingContext();

  const today = formatDate(new Date());

  // Fetch logs for current month when it changes
  useEffect(() => {
    if (isOpen && isOnline) {
      const from = formatDate(currentMonth);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      const to = formatDate(lastDay);
      fetchLogs(from, to);
    }
  }, [currentMonth, isOpen, isOnline, fetchLogs]);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }, []);

  // Get calendar grid for current month
  const getCalendarDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  if (!isOpen) return null;

  const calendarDays = getCalendarDays();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-md mx-4 mb-4 sm:mb-0",
        "bg-card border border-border rounded-xl",
        "max-h-[85vh] overflow-hidden flex flex-col",
        "animate-slide-up sm:animate-scale-in"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-md hover:bg-secondary active:scale-95 transition-all duration-150"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-base font-medium text-foreground min-w-[140px] text-center transition-all duration-300">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-md hover:bg-secondary active:scale-95 transition-all duration-150"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicators */}
            {!isOnline && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md animate-fade-in">
                Offline
              </span>
            )}
            {isSyncing && (
              <span className="text-xs text-teal-500 bg-teal-500/10 px-2 py-1 rounded-md animate-soft-pulse">
                Syncing...
              </span>
            )}
            {hasPendingSync && !isSyncing && isOnline && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md animate-fade-in">
                Pending
              </span>
            )}

            <button
              onClick={goToToday}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary active:scale-95 transition-all duration-150"
            >
              Today
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-secondary active:scale-95 transition-all duration-150"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedDate ? (
            <div className="animate-fade-in">
              <DayDetail 
                date={selectedDate} 
                onClose={() => setSelectedDate(null)} 
              />
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateStr = formatDate(date);
                  const isToday = dateStr === today;
                  const completionCount = getCompletionCount(dateStr);
                  const morningCount = completionCount >= 3 ? 3 : completionCount;
                  const eveningCount = completionCount > 3 ? completionCount - 3 : 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center gap-0.5 rounded-md",
                        "transition-all duration-150",
                        "hover:bg-secondary active:scale-95",
                        isToday && "bg-secondary"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-150",
                        isToday ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {date.getDate()}
                      </span>

                      {/* Completion indicator - split for morning/evening */}
                      <div className="flex gap-0.5">
                        {/* Morning indicator */}
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          morningCount === 0 && "bg-border",
                          morningCount === 1 && "bg-amber-400/50",
                          morningCount === 2 && "bg-amber-400/70",
                          morningCount >= 3 && "bg-amber-400"
                        )} />
                        {/* Evening indicator */}
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          eveningCount === 0 && "bg-border",
                          eveningCount === 1 && "bg-indigo-400/50",
                          eveningCount === 2 && "bg-indigo-400/70",
                          eveningCount >= 3 && "bg-indigo-400"
                        )} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs text-muted-foreground">Morning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-xs text-muted-foreground">Evening</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
