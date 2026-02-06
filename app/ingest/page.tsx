import { cookies } from 'next/headers';
import { getMockAwareSession, hasRole, WRITER_ROLES } from '../../lib/auth/session';
import { AppShell } from '../../components/layout/app-shell';
import { IngestClient } from '../../components/ingest/ingest-client';

export default async function IngestPage() {
  const c = await cookies();
  const session = await getMockAwareSession(() => c.getAll());
  if (!session?.profile || !hasRole(session.profile, WRITER_ROLES)) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Acceso no autorizado.</div>;
  }

  return (
    <AppShell userName={session.profile.full_name} role={session.profile.role}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Carga de datos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manual o importación CSV con validación y trazabilidad</p>
        </div>
        <IngestClient userId={session.profile.user_id} />
      </div>
    </AppShell>
  );
}
