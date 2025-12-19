'use client';

import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  name: string;
  colorClass?: string;
}

export function ProductBadge({ name, colorClass = 'bg-white/10' }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium",
        "bg-white/10 backdrop-blur-sm border border-white/10",
        "transition-all duration-200 hover:bg-white/15 hover:scale-105",
        "cursor-default select-none"
      )}
    >
      {name}
    </span>
  );
}

