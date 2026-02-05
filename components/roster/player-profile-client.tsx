'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { type Player, type GpsMetric, type JumpMetric, type StrengthMetric } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '../../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Player360Viewer from '../Player360Viewer';

interface PlayerProfileClientProps {
  playerId: string;
  role: string;
}

export function PlayerProfileClient({ playerId }: PlayerProfileClientProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [gps, setGps] = useState<any[]>([]);
  const [jumps, setJumps] = useState<JumpMetric[]>([]);
  const [strength, setStrength] = useState<StrengthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: p } = await supabase.from('players').select('*').eq('id', playerId).single();
      const { data: g } = await supabase.from('gps_metrics').select('*, training_sessions(session_date, session_name)').eq('player_id', playerId).order('created_at');
      const { data: j } = await supabase.from('jump_metrics').select('*').eq('player_id', playerId).order('created_at');
      const { data: s } = await supabase.from('strength_metrics').select('*').eq('player_id', playerId).order('created_at');
      setPlayer(p as Player | null);
      setGps(g || []);
      setJumps((j || []) as JumpMetric[]);
      setStrength((s || []) as StrengthMetric[]);
      setLoading(false);
    })();
  }, [playerId]);

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

  const gpsChartData = gps.map((g: any) => ({
    label: g.training_sessions?.session_name || formatDate(g.created_at),
    distancia: Number(g.total_distance_m),
    velocidad: Number(g.max_speed_kmh) || 0,
  }));

  const cmjData = jumps.filter(j => j.test_type === 'CMJ').map(j => ({
    date: formatDate(j.created_at),
    altura: Number(j.jump_height_cm),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      {/* 360 video banner */}
      {/* 360 video banner */}
      <div className="mb-6">
        <Player360Viewer
          modelUrl="/Lucas_Diarte_360_alpha_v2.webm"
          className="h-[300px] md:h-[400px] w-full"
          label={`${player.first_name} ${player.last_name}`}
        />
      </div>

      {/* Header card */}
      <Card className="mb-6">
        <CardContent className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-muted-foreground">
                {player.first_name[0]}{player.last_name[0]}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{player.first_name} {player.last_name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={STATUS_COLORS[player.status]}>{STATUS_LABELS[player.status]}</Badge>
                {player.position && <Badge variant="muted">{player.position}</Badge>}
                <span className="font-mono text-xs text-primary font-semibold bg-secondary px-2 py-0.5 rounded">{player.club_player_code}</span>
              </div>
              {(player.height_cm || player.weight_kg || player.birthdate) && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {player.height_cm && <span>Altura: {player.height_cm} cm</span>}
                  {player.weight_kg && <span>Peso: {player.weight_kg} kg</span>}
                  {player.birthdate && <span>Nac: {formatDate(player.birthdate)}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-xs text-primary hover:text-primary/80 transition-colors border border-primary/30 px-3 py-1 rounded-lg"
            >
              {showQR ? 'Ocultar QR' : '📱 Generar QR'}
            </button>
            {showQR && (
              <div className="bg-white p-2 rounded-lg">
                <QRCodeCanvas value={`SMT-PLAYER:${player.club_player_code}:${player.id}`} size={110} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI mini cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sesiones GPS', value: gps.length, unit: '' },
          { label: 'Dist. promedio', value: gps.length ? Math.round(gps.reduce((s: number, g: any) => s + Number(g.total_distance_m), 0) / gps.length) : 0, unit: 'm' },
          { label: 'Tests CMJ', value: cmjData.length, unit: '' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Carga externa (distancia)</CardTitle></CardHeader>
          <CardContent>
            {gpsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={gpsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="distancia" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">Sin datos de GPS.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Saltos CMJ</CardTitle></CardHeader>
          <CardContent>
            {cmjData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cmjData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="altura" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">Sin datos de saltos.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Strength log */}
      {strength.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-lg">Fuerza — Registro</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Fecha', 'Ejercicio', 'Series', 'Reps', 'Carga kg', '1RM est.'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strength.map(s => (
                    <tr key={s.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                      <td className="px-3 py-3 text-foreground font-medium">{s.exercise_name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{s.set_count || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{s.reps || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{s.load_kg || '—'}</td>
                      <td className="px-3 py-3 text-primary font-bold">{s.estimated_1rm || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
