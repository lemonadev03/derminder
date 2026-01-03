'use client';

import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  name: string;
  delay?: number;
}

export function ProductBadge({ name, delay = 0 }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        "bg-secondary text-muted-foreground",
        "transition-all duration-200 ease-out",
        "hover:bg-border hover:text-foreground"
      )}
      style={{ 
        animationDelay: delay ? `${delay}ms` : undefined 
      }}
    >
      {name}
    </span>
  );
}
