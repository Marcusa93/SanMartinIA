'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import { SantitoChatbot } from '../assistant/santito-chatbot';

interface AppShellProps {
  userName: string;
  role: string;
  children: React.ReactNode;
}

export function AppShell({ userName, role, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar - always visible on md+ */}
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>

      {/* Mobile sidebar - overlay (drawer style) */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar drawer */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden animate-in slide-in-from-left duration-300">
            <Sidebar role={role} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          userName={userName}
          role={role}
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />
        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 scroll-smooth">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav role={role} />

      {/* Santito chatbot - hidden on mobile, visible on tablet+ */}
      <div className="hidden sm:block">
        <SantitoChatbot />
      </div>
    </div>
  );
}
