'use client';

import { Badge } from '../ui/badge';
import { ROLE_LABELS } from '../../lib/utils';
import { useTheme } from '../theme-provider';
import { Sun, Moon, Menu } from 'lucide-react';

interface TopbarProps {
  userName: string;
  role: string;
  onMenuClick?: () => void;
}

export function Topbar({ userName, role, onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 sticky top-0 z-10 border-b border-border/40 bg-surface/70 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors">
      <div className="flex items-center gap-3">
        {/* Hamburger menu - visible on mobile */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-muted-foreground/50">
          <span className="text-foreground/80 font-medium text-sm tracking-tight">Dashboard</span>
          <span className="text-xs hidden sm:inline">/</span>
          <span className="text-muted-foreground text-xs uppercase tracking-wide hidden sm:inline">Overview</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 text-primary bg-primary/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex">
          {ROLE_LABELS[role] || role}
        </Badge>

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <span className="block text-sm text-foreground font-semibold leading-none group-hover:text-primary transition-colors">{userName}</span>
            <span className="text-[10px] text-muted-foreground font-medium">Online</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-600 border border-white dark:border-slate-600 shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex items-center justify-center overflow-hidden">
            <span className="text-foreground/70 text-xs font-bold group-hover:text-primary transition-colors">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
