'use client';

import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { SantitoChatbot } from '../assistant/santito-chatbot';

interface AppShellProps {
  userName: string;
  role: string;
  children: React.ReactNode;
}

export function AppShell({ userName, role, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar userName={userName} role={role} />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
      <SantitoChatbot />
    </div>
  );
}
