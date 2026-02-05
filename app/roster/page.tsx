import { cookies } from 'next/headers';
import { getMockAwareSession } from '../../lib/auth/session';
import { AppShell } from '../../components/layout/app-shell';
import { RosterClient } from '../../components/roster/roster-client';

export default async function RosterPage() {
  const c = await cookies();
  const session = await getMockAwareSession(() => c.getAll());
  if (!session?.profile) return null;

  return (
    <AppShell userName={session.profile.full_name} role={session.profile.role}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Plantel</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestión de jugadores y Digital ID</p>
          </div>
        </div>
        <RosterClient role={session.profile.role} />
      </div>
    </AppShell>
  );
}
