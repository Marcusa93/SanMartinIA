'use client';

import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function Input({ className, error, label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-muted-foreground">{label}</label>}
      <input
        id={id}
        className={cn(
          'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-all shadow-sm',
          'border-input hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, error, label, id, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-muted-foreground">{label}</label>}
      <select
        id={id}
        className={cn(
          'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground transition-all shadow-sm',
          'border-input hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
