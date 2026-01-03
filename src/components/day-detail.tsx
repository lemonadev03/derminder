'use client';

import { cn } from '@/lib/utils';
import { useTrackingContext, formatDate, EntryKey } from '@/lib/tracking';

interface DayDetailProps {
  date: Date;
  onClose?: () => void;
}

interface RoutineToggle {
  key: EntryKey;
  label: string;
  section: string;
  time: 'morning' | 'evening';
  accentColor: 'rose' | 'teal' | 'amber';
}

const ROUTINE_TOGGLES: RoutineToggle[] = [
  // Morning
  { key: 'face_morning', label: 'Face', section: '✨', time: 'morning', accentColor: 'rose' },
  { key: 'scalp_morning', label: 'Scalp', section: '💆', time: 'morning', accentColor: 'teal' },
  { key: 'orals_morning', label: 'Orals', section: '💊', time: 'morning', accentColor: 'amber' },
  // Evening
  { key: 'face_evening', label: 'Face', section: '✨', time: 'evening', accentColor: 'rose' },
  { key: 'scalp_evening', label: 'Scalp', section: '💆', time: 'evening', accentColor: 'teal' },
  { key: 'orals_evening', label: 'Orals', section: '💊', time: 'evening', accentColor: 'amber' },
];

const accentStyles = {
  rose: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/15',
  },
  teal: {
    text: 'text-teal-400',
    bg: 'bg-teal-500/15',
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
};

export function DayDetail({ date, onClose }: DayDetailProps) {
  const { toggleEntry, isEntryComplete, getEntryTimestamp, getCompletionCount } = useTrackingContext();
  const dateStr = formatDate(date);
  const completionCount = getCompletionCount(dateStr);

  const morningToggles = ROUTINE_TOGGLES.filter(t => t.time === 'morning');
  const eveningToggles = ROUTINE_TOGGLES.filter(t => t.time === 'evening');

  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDateHeader = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-foreground">
            {formatDateHeader(date)}
          </h3>
          <p className="text-muted-foreground text-sm">
            {completionCount}/6 completed
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Morning Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm">☀️</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Morning</span>
        </div>
        <div className="space-y-1.5">
          {morningToggles.map((toggle) => (
            <ToggleRow
              key={toggle.key}
              toggle={toggle}
              dateStr={dateStr}
              isComplete={isEntryComplete(dateStr, toggle.key)}
              timestamp={getEntryTimestamp(dateStr, toggle.key)}
              formatTimestamp={formatTimestamp}
              onToggle={() => toggleEntry(dateStr, toggle.key)}
            />
          ))}
        </div>
      </div>

      {/* Evening Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm">🌙</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Evening</span>
        </div>
        <div className="space-y-1.5">
          {eveningToggles.map((toggle) => (
            <ToggleRow
              key={toggle.key}
              toggle={toggle}
              dateStr={dateStr}
              isComplete={isEntryComplete(dateStr, toggle.key)}
              timestamp={getEntryTimestamp(dateStr, toggle.key)}
              formatTimestamp={formatTimestamp}
              onToggle={() => toggleEntry(dateStr, toggle.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  toggle: RoutineToggle;
  dateStr: string;
  isComplete: boolean;
  timestamp: string | null;
  formatTimestamp: (t: string | null) => string;
  onToggle: () => void;
}

function ToggleRow({ toggle, isComplete, timestamp, formatTimestamp, onToggle }: ToggleRowProps) {
  const styles = accentStyles[toggle.accentColor];
  
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
        "border border-border",
        isComplete
          ? styles.bg
          : "hover:bg-secondary"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{toggle.section}</span>
        <span className={cn(
          "text-sm font-medium",
          isComplete ? styles.text : "text-muted-foreground"
        )}>
          {toggle.label}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {isComplete && timestamp && (
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(timestamp)}
          </span>
        )}
        
        {/* Toggle indicator */}
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
          isComplete
            ? cn(styles.bg, styles.text)
            : "border border-border"
        )}>
          {isComplete && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
