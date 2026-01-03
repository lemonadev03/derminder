'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';

export type EntryKey = 
  | 'face_morning' | 'face_evening'
  | 'scalp_morning' | 'scalp_evening'
  | 'orals_morning' | 'orals_evening';

export interface DayLogEntries {
  face_morning?: string;
  face_evening?: string;
  scalp_morning?: string;
  scalp_evening?: string;
  orals_morning?: string;
  orals_evening?: string;
}

export interface TrackingState {
  logs: Record<string, DayLogEntries>; // keyed by date "2025-12-27"
  pendingSync: Record<string, DayLogEntries>; // entries that need to be synced
  lastSynced: string | null;
}

const STORAGE_KEY = 'derminder:tracking';
const AUTH_KEY = 'derminder:auth';

// Helper to get date string
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to get current week's dates (Sunday to Saturday)
export function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// Get auth header from localStorage
function getAuthHeader(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_KEY);
}

// Set auth header in localStorage
export function setAuthCredentials(username: string, password: string): void {
  const encoded = btoa(`${username}:${password}`);
  localStorage.setItem(AUTH_KEY, `Basic ${encoded}`);
}

// Clear auth
export function clearAuthCredentials(): void {
  localStorage.removeItem(AUTH_KEY);
}

// Check if we have auth credentials
export function hasAuthCredentials(): boolean {
  return !!getAuthHeader();
}

// Load state from localStorage
function loadState(): TrackingState {
  if (typeof window === 'undefined') {
    return { logs: {}, pendingSync: {}, lastSynced: null };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load tracking state:', e);
  }
  
  return { logs: {}, pendingSync: {}, lastSynced: null };
}

// Save state to localStorage
function saveState(state: TrackingState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save tracking state:', e);
  }
}

export function useTracking() {
  const [state, setState] = useState<TrackingState>(() => loadState());
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial state
  useEffect(() => {
    setState(loadState());
    setIsOnline(navigator.onLine);
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncToServer();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync pending changes to server
  const syncToServer = useCallback(async (): Promise<boolean> => {
    const authHeader = getAuthHeader();
    if (!authHeader || !navigator.onLine) {
      return false;
    }

    const currentState = loadState();
    if (Object.keys(currentState.pendingSync).length === 0) {
      return true;
    }

    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ logs: currentState.pendingSync }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setState(prev => ({
          logs: { ...prev.logs, ...data.logs },
          pendingSync: {},
          lastSynced: new Date().toISOString(),
        }));
        
        return true;
      } else if (response.status === 401) {
        clearAuthCredentials();
        return false;
      }
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
    
    return false;
  }, []);

  // Fetch logs from server for a date range
  const fetchLogs = useCallback(async (from: string, to: string): Promise<boolean> => {
    const authHeader = getAuthHeader();
    if (!authHeader || !navigator.onLine) {
      return false;
    }

    try {
      const response = await fetch(`/api/logs?from=${from}&to=${to}`, {
        headers: {
          'Authorization': authHeader,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        setState(prev => ({
          ...prev,
          logs: { ...prev.logs, ...data.logs },
        }));
        
        return true;
      } else if (response.status === 401) {
        clearAuthCredentials();
      }
    } catch (e) {
      console.error('Fetch logs failed:', e);
    }
    
    return false;
  }, []);

  // Toggle an entry (mark complete or uncomplete)
  const toggleEntry = useCallback((date: string, key: EntryKey) => {
    setState(prev => {
      const currentEntries = prev.logs[date] || {};
      const isCurrentlyComplete = !!currentEntries[key];
      
      const newValue = isCurrentlyComplete ? undefined : new Date().toISOString();
      
      const updatedEntries: DayLogEntries = {
        ...currentEntries,
        [key]: newValue,
      };
      
      // Clean up undefined values for storage
      if (newValue === undefined) {
        delete updatedEntries[key];
      }

      // Also add to pending sync
      const pendingForDate = prev.pendingSync[date] || {};
      const updatedPending: DayLogEntries = {
        ...pendingForDate,
        [key]: newValue as string | undefined,
      };

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [date]: updatedEntries,
        },
        pendingSync: {
          ...prev.pendingSync,
          [date]: updatedPending,
        },
      };
    });

    // Debounced sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToServer();
    }, 2000);
  }, [syncToServer]);

  // Get entries for a specific date
  const getEntries = useCallback((date: string): DayLogEntries => {
    return state.logs[date] || {};
  }, [state.logs]);

  // Get completion count for a date (0-6)
  const getCompletionCount = useCallback((date: string): number => {
    const entries = state.logs[date] || {};
    return Object.values(entries).filter(Boolean).length;
  }, [state.logs]);

  // Check if an entry is complete
  const isEntryComplete = useCallback((date: string, key: EntryKey): boolean => {
    return !!(state.logs[date]?.[key]);
  }, [state.logs]);

  // Get entry timestamp
  const getEntryTimestamp = useCallback((date: string, key: EntryKey): string | null => {
    return state.logs[date]?.[key] || null;
  }, [state.logs]);

  // Get section completion level (0, 1, or 2) for a date
  // 0 = neither morning nor evening done
  // 1 = morning OR evening done
  // 2 = both morning AND evening done
  const getSectionCompletion = useCallback((date: string, sectionId: 'face' | 'scalp' | 'orals'): 0 | 1 | 2 => {
    const entries = state.logs[date] || {};
    const morningKey = `${sectionId}_morning` as EntryKey;
    const eveningKey = `${sectionId}_evening` as EntryKey;

    const hasMorning = !!entries[morningKey];
    const hasEvening = !!entries[eveningKey];

    if (hasMorning && hasEvening) return 2;
    if (hasMorning || hasEvening) return 1;
    return 0;
  }, [state.logs]);

  return {
    logs: state.logs,
    isOnline,
    isSyncing,
    hasPendingSync: Object.keys(state.pendingSync).length > 0,
    toggleEntry,
    getEntries,
    getCompletionCount,
    isEntryComplete,
    getEntryTimestamp,
    getSectionCompletion,
    syncToServer,
    fetchLogs,
  };
}

// Context for sharing tracking state
type TrackingContextType = ReturnType<typeof useTracking>;

const TrackingContext = createContext<TrackingContextType | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const tracking = useTracking();
  
  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingContext() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider');
  }
  return context;
}

