'use client';

import { Badge } from '../ui/badge';
import { ROLE_LABELS } from '../../lib/utils';

interface TopbarProps {
  userName: string;
  role: string;
}

export function Topbar({ userName, role }: TopbarProps) {
  return (
    <header className="h-16 sticky top-0 z-10 border-b border-border/40 bg-surface/70 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 transition-colors">
      <div className="flex items-center gap-3">
        {/* Placeholder for breadcrumb or page title logic if needed */}
        <div className="flex items-center gap-2 text-muted-foreground/50">
          <span className="text-foreground/80 font-medium text-sm tracking-tight">Dashboard</span>
          <span className="text-xs">/</span>
          <span className="text-muted-foreground text-xs uppercase tracking-wide">Overview</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 text-primary bg-primary/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{ROLE_LABELS[role] || role}</Badge>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <span className="block text-sm text-foreground font-semibold leading-none group-hover:text-primary transition-colors">{userName}</span>
            <span className="text-[10px] text-muted-foreground font-medium">Online</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 border border-white shadow-sm ring-1 ring-black/5 flex items-center justify-center overflow-hidden">
            <span className="text-foreground/70 text-xs font-bold group-hover:text-primary transition-colors">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
