'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { type Player, type GpsMetric, type JumpMetric } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatNumber } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import Player360Viewer from '../Player360Viewer';

export function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gps, setGps] = useState<any[]>([]);
  const [jumps, setJumps] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<{ player: string; msg: string; type: 'load' | 'jump' }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const since = new Date(Date.now() - 14 * 86400000).toISOString();
      const [pRes, gRes, jRes] = await Promise.all([
        supabase.from('players').select('*'),
        supabase.from('gps_metrics').select('*, players(first_name, last_name), training_sessions(session_date, session_name)').gte('created_at', since).order('created_at'),
        supabase.from('jump_metrics').select('*, players(first_name, last_name)').gte('created_at', since).order('created_at'),
      ]);
      setPlayers((pRes.data || []) as Player[]);
      setGps(gRes.data || []);
      setJumps(jRes.data || []);

      // ── Alerts (heurísticas) ──
      const computedAlerts: typeof alerts = [];

      // GPS: carga subió >30% vs promedio 7 días previos
      const now = Date.now();
      const week1Start = new Date(now - 14 * 86400000).toISOString();
      const week2Start = new Date(now - 7 * 86400000).toISOString();
      const allGps = (gRes.data || []) as any[];
      const playerGps = new Map<string, { w1: number[]; w2: number[]; name: string }>();
      allGps.forEach((g: any) => {
        const t = new Date(g.created_at).getTime();
        const prev = playerGps.get(g.player_id) || { w1: [], w2: [], name: `${g.players?.first_name} ${g.players?.last_name}` };
        if (t >= new Date(week1Start).getTime() && t < new Date(week2Start).getTime()) prev.w1.push(Number(g.total_distance_m));
        if (t >= new Date(week2Start).getTime()) prev.w2.push(Number(g.total_distance_m));
        playerGps.set(g.player_id, prev);
      });
      playerGps.forEach(v => {
        if (v.w1.length && v.w2.length) {
          const avg1 = v.w1.reduce((a, b) => a + b, 0) / v.w1.length;
          const avg2 = v.w2.reduce((a, b) => a + b, 0) / v.w2.length;
          if (avg2 > avg1 * 1.3) computedAlerts.push({ player: v.name, msg: `Carga externa subió ${(((avg2 - avg1) / avg1) * 100).toFixed(0)}% vs promedio anterior`, type: 'load' });
        }
      });

      // Jumps: CMJ cayó >10% vs primer valor en período
      const playerJumps = new Map<string, { values: number[]; name: string }>();
      (jRes.data || []).forEach((j: any) => {
        if (j.test_type !== 'CMJ') return;
        const prev = playerJumps.get(j.player_id) || { values: [], name: `${j.players?.first_name} ${j.players?.last_name}` };
        prev.values.push(Number(j.jump_height_cm));
        playerJumps.set(j.player_id, prev);
      });
      playerJumps.forEach(v => {
        if (v.values.length >= 2) {
          const first = v.values[0];
          const last = v.values[v.values.length - 1];
          const change = ((last - first) / first) * 100;
          if (change < -10) computedAlerts.push({ player: v.name, msg: `CMJ cayó ${Math.abs(change).toFixed(1)}% (${first.toFixed(1)} → ${last.toFixed(1)} cm)`, type: 'jump' });
        }
      });

      setAlerts(computedAlerts);
      setLoading(false);
    })();
  }, []);

  // ── KPIs ──
  const avgDist = gps.length ? gps.reduce((s, g) => s + Number(g.total_distance_m), 0) / gps.length : 0;
  const avgSpeed = gps.length ? gps.reduce((s, g) => s + (Number(g.max_speed_kmh) || 0), 0) / gps.length : 0;
  const avgJump = jumps.filter((j: any) => j.test_type === 'CMJ').length
    ? jumps.filter((j: any) => j.test_type === 'CMJ').reduce((s: number, j: any) => s + Number(j.jump_height_cm), 0) / jumps.filter((j: any) => j.test_type === 'CMJ').length
    : 0;

  // Top 5 distancia
  const playerDist = new Map<string, { name: string; total: number }>();
  gps.forEach((g: any) => {
    const prev = playerDist.get(g.player_id) || { name: `${g.players?.first_name} ${g.players?.last_name}`, total: 0 };
    prev.total += Number(g.total_distance_m);
    playerDist.set(g.player_id, prev);
  });
  const top5 = [...playerDist.values()].sort((a, b) => b.total - a.total).slice(0, 5);

  // Team load by session
  const sessionLoad = new Map<string, { label: string; total: number }>();
  gps.forEach((g: any) => {
    const label = g.training_sessions?.session_name || 'Sin sesión';
    const prev = sessionLoad.get(label) || { label, total: 0 };
    prev.total += Number(g.total_distance_m);
    sessionLoad.set(label, prev);
  });
  const loadBySession = [...sessionLoad.values()];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jugadores activos', value: players.filter(p => p.status === 'active').length, unit: '', color: 'text-emerald-600' },
          { label: 'Dist. promedio (14d)', value: formatNumber(avgDist, 0), unit: 'm', color: 'text-red-500' },
          { label: 'Vel. máx promedio', value: formatNumber(avgSpeed, 1), unit: 'km/h', color: 'text-purple-600' },
          { label: 'CMJ promedio', value: formatNumber(avgJump, 1), unit: 'cm', color: 'text-amber-600' },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="py-5">
                <p className="text-xs text-muted-foreground mb-1 font-medium">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}<span className="text-xs font-normal text-muted-foreground ml-1">{kpi.unit}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-red-500/30 bg-red-500/10">
            <CardHeader>
              <CardTitle>⚠️ Alertas automáticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${a.type === 'load' ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-red-500/15 border border-red-500/30'}`}>
                    <span className="text-base">{a.type === 'load' ? '📈' : '📉'}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{a.player}</p>
                      <p className="text-xs text-muted-foreground">{a.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 bar */}
        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardHeader><CardTitle>🏆 Top 5 — Distancia acumulada (14d)</CardTitle></CardHeader>
            <CardContent>
              {top5.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={top5} layout="vertical" margin={{ left: 80, right: 20 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#D00000" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#D00000" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} width={75} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total" fill="url(#colorTotal)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos.</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* 3D Player Viewer Demo */}
        <motion.div variants={item}>
          <div className="h-full">
            <Player360Viewer modelUrl="/Lucas_Diarte_360_alpha_v2.webm" />
          </div>
        </motion.div>
      </div>

      {/* Legacy Load Chart (Moved down or removed based on preference, keeping for now but compact) */}
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader><CardTitle>📊 Carga del equipo por sesión</CardTitle></CardHeader>
          <CardContent>
            {loadBySession.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={loadBySession}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos.</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* Plantel status summary */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>👥 Resumen plantel</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Activos', count: players.filter(p => p.status === 'active').length, color: 'bg-emerald-500' },
                { label: 'Lesionados', count: players.filter(p => p.status === 'injured').length, color: 'bg-red-500' },
                { label: 'Rehabilitación', count: players.filter(p => p.status === 'rehab').length, color: 'bg-amber-500' },
                { label: 'Inactivos', count: players.filter(p => p.status === 'inactive').length, color: 'bg-slate-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="text-sm text-muted-foreground">{s.label}:</span>
                  <span className="text-sm font-bold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
