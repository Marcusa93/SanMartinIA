'use client';

import { cn } from '../../lib/utils';;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'outline';
}

const variantClasses = {
  default: 'bg-primary text-primary-foreground border-transparent shadow-[0_2px_4px_-1px_rgba(208,0,0,0.3)]',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  muted: 'bg-secondary text-secondary-foreground border-transparent',
  outline: 'border border-border bg-transparent text-foreground hover:bg-secondary/50',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
