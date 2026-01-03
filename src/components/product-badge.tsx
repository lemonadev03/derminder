'use client';

import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  name: string;
}

export function ProductBadge({ name }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        "bg-secondary text-muted-foreground",
        "transition-colors duration-150"
      )}
    >
      {name}
    </span>
  );
}
