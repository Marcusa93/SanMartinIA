import { cookies } from 'next/headers';
import { getMockAwareSession, hasRole } from '../../../lib/auth/session';
import { AppShell } from '../../../components/layout/app-shell';
import { AdminUsersClient } from '../../../components/admin/admin-users-client';

export default async function AdminUsersPage() {
  const c = await cookies();
  const session = await getMockAwareSession(() => c.getAll());
  if (!session?.profile || !hasRole(session.profile, ['superadmin'])) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Acceso restringido.</div>;
  }

  return (
    <AppShell userName={session.profile.full_name} role={session.profile.role}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Administración de usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de roles y permisos</p>
        </div>
        <AdminUsersClient />
      </div>
    </AppShell>
  );
}
