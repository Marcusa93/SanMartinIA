'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Users, Upload, MessageSquare, Settings } from 'lucide-react';

interface MobileNavProps {
  role: string;
  onAssistantClick?: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roster', label: 'Plantel', icon: Users },
  { href: '/ingest', label: 'Carga', icon: Upload, roles: ['superadmin', 'admin_pf', 'admin_staff'] },
  { href: '/assistant', label: 'Asistente', icon: MessageSquare },
  { href: '/admin/users', label: 'Admin', icon: Settings, roles: ['superadmin'] },
];

export function MobileNav({ role, onAssistantClick }: MobileNavProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  }).slice(0, 5); // Max 5 items

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface to-surface/80 backdrop-blur-xl border-t border-border/50" />

      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {visibleItems.map(item => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          // Special handling for assistant - could open Santito instead
          if (item.href === '/assistant' && onAssistantClick) {
            return (
              <button
                key={item.href}
                onClick={onAssistantClick}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[64px]',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground active:scale-95'
                )}
              >
                <div className={cn(
                  'p-2 rounded-xl transition-all',
                  active ? 'bg-primary/15' : 'active:bg-secondary'
                )}>
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-all',
                  active && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[64px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground active:scale-95'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all',
                active ? 'bg-primary/15' : 'active:bg-secondary'
              )}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all',
                active && 'font-semibold'
              )}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
