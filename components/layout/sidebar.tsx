'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/roster', label: 'Plantel', icon: '👥' },
  { href: '/ingest', label: 'Carga', icon: '📥' },
];

const NAV_ADMIN = [
  { href: '/admin/users', label: 'Usuarios', icon: '⚙️' },
];

interface SidebarProps {
  role: string;
  onClose?: () => void;
}

export function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname();

  const showIngest = ['superadmin', 'admin_pf', 'admin_staff'].includes(role);
  const showAdmin = role === 'superadmin';

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-surface/95 backdrop-blur-xl border-r border-border/50 shrink-0 transition-all z-20">
      {/* Logo area */}
      <div className="p-6 border-b border-border/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <img src="/san-martin-logo.png" alt="CASM" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-foreground tracking-wider uppercase text-lg">CASM</span>
            <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Lab</span>
          </div>
        </div>

        {/* Close button - only on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 py-2 mb-1">Principal</p>
        {NAV_ITEMS.map(item => {
          if (item.href === '/ingest' && !showIngest) return null;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group',
                active
                  ? 'bg-primary/5 text-primary translate-x-1 shadow-sm border border-primary/10'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:pl-4'
              )}
            >
              <span className={cn("w-5 text-center text-lg transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>{item.icon}</span>
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </Link>
          );
        })}

        {showAdmin && (
          <>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 py-2 mt-6 mb-1">Administración</p>
            {NAV_ADMIN.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group',
                    active
                      ? 'bg-primary/5 text-primary translate-x-1 shadow-sm border border-primary/10'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:pl-4'
                  )}
                >
                  <span className={cn("w-5 text-center text-lg transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom: logout */}
      <div className="p-4 border-t border-border/10">
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  const handleLogout = async () => {
    const isMock = typeof document !== 'undefined' && document.cookie.split(';').some(c => c.trim().startsWith('mock_session='));
    if (isMock) {
      window.location.href = '/api/mock-logout';
      return;
    }
    const { createClient } = await import('../../lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:shadow-sm border border-transparent hover:border-destructive/20 transition-all"
    >
      <span className="text-base">🚪</span>
      Cerrar sesión
    </button>
  );
}
