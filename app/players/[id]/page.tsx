import { cookies } from 'next/headers';
import { getMockAwareSession } from '../../../lib/auth/session';
import { AppShell } from '../../../components/layout/app-shell';
import { PlayerProfileClient } from '../../../components/roster/player-profile-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: Props) {
  const { id } = await params;
  const c = await cookies();
  const session = await getMockAwareSession(() => c.getAll());
  if (!session?.profile) return null;

  return (
    <AppShell userName={session.profile.full_name} role={session.profile.role}>
      <PlayerProfileClient playerId={id} role={session.profile.role} />
    </AppShell>
  );
}
