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
  colorClass: string;
  bgClass: string;
}

const ROUTINE_TOGGLES: RoutineToggle[] = [
  // Morning
  { key: 'face_morning', label: 'Face', section: '✨', time: 'morning', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/20' },
  { key: 'scalp_morning', label: 'Scalp', section: '💆', time: 'morning', colorClass: 'text-teal-400', bgClass: 'bg-teal-500/20' },
  { key: 'orals_morning', label: 'Orals', section: '💊', time: 'morning', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/20' },
  // Evening
  { key: 'face_evening', label: 'Face', section: '✨', time: 'evening', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/20' },
  { key: 'scalp_evening', label: 'Scalp', section: '💆', time: 'evening', colorClass: 'text-teal-400', bgClass: 'bg-teal-500/20' },
  { key: 'orals_evening', label: 'Orals', section: '💊', time: 'evening', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/20' },
];

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
          <h3 className="text-lg font-semibold text-white">
            {formatDateHeader(date)}
          </h3>
          <p className="text-white/40 text-sm">
            {completionCount}/6 completed
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Morning Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm">☀️</span>
          <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Morning</span>
        </div>
        <div className="space-y-2">
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
          <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Evening</span>
        </div>
        <div className="space-y-2">
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
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all",
        "border",
        isComplete
          ? `${toggle.bgClass} border-white/20`
          : "bg-white/5 border-white/10 hover:bg-white/10"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{toggle.section}</span>
        <span className={cn(
          "font-medium",
          isComplete ? toggle.colorClass : "text-white/60"
        )}>
          {toggle.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isComplete && timestamp && (
          <span className="text-xs text-white/40">
            {formatTimestamp(timestamp)}
          </span>
        )}
        
        {/* Toggle indicator */}
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-all",
          isComplete
            ? `${toggle.bgClass} ring-2 ring-white/30`
            : "bg-white/10"
        )}>
          {isComplete && (
            <svg className={cn("w-3 h-3", toggle.colorClass)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

