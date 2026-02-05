import { cookies } from 'next/headers';
import { getMockAwareSession } from '../../lib/auth/session';
import { AppShell } from '../../components/layout/app-shell';
import { DashboardClient } from '../../components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const c = await cookies();
  const session = await getMockAwareSession(() => c.getAll());
  if (!session?.profile) return null;

  return (
    <AppShell userName={session.profile.full_name} role={session.profile.role}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vista general del plantel — San Martín de Tucumán</p>
        </div>
        <DashboardClient />
      </div>
    </AppShell>
  );
}
