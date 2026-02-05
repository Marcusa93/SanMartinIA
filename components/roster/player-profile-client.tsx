'use client';

import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { Skeleton } from '../ui/skeleton';
import Player360Viewer from '../Player360Viewer';
import { Card, CardContent } from '../ui/card';
import { PlayerHeader } from './PlayerHeader';
import { PlayerCharts } from './PlayerCharts';
import { PlayerStrengthTable } from './PlayerStrengthTable';

interface PlayerProfileClientProps {
  playerId: string;
  role: string;
}

export function PlayerProfileClient({ playerId }: PlayerProfileClientProps) {
  const { player, gps, jumps, strength, loading, chartsData } = usePlayerProfile(playerId);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!player) {
    return <div className="max-w-5xl mx-auto mt-20 text-center text-muted-foreground">Jugador no encontrado.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 360 video banner */}
      <div className="mb-6">
        <Player360Viewer
          modelUrl="/Lucas_Diarte_360_alpha_v2.webm"
          className="h-[300px] md:h-[400px] w-full"
          label={`${player.first_name} ${player.last_name}`}
        />
      </div>

      <PlayerHeader player={player} />

      {/* KPI mini cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sesiones GPS', value: gps.length, unit: '' },
          { label: 'Dist. promedio', value: gps.length ? Math.round(gps.reduce((s: number, g: any) => s + Number(g.total_distance_m), 0) / gps.length) : 0, unit: 'm' },
          { label: 'Tests CMJ', value: chartsData.cmj.length, unit: '' },
          { label: 'Ejercicios', value: strength.length, unit: '' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {kpi.value || '—'}
                {kpi.unit && <span className="text-xs font-normal text-muted-foreground ml-1">{kpi.unit}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlayerCharts gpsChartData={chartsData.gps} cmjData={chartsData.cmj} />

      <PlayerStrengthTable strength={strength} />
    </div>
  );
}
