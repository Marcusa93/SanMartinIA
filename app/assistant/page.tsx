import { cookies } from 'next/headers';
import { getMockAwareSession } from '../../lib/auth/session';
import { AppShell } from '../../components/layout/app-shell';
import { AssistantClient } from '../../components/assistant/assistant-client';

export default async function AssistantPage() {
  const c = await cookies();
  const session = await getMockAwareSession(() => c.getAll());
  if (!session?.profile) return null;

  return (
    <AppShell userName={session.profile.full_name} role={session.profile.role}>
      <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-100">🤖 Asistente contextual</h1>
          <p className="text-sm text-slate-500 mt-0.5">Responde solo con datos del sistema. Nunca inventa.</p>
        </div>
        <AssistantClient />
      </div>
    </AppShell>
  );
}
