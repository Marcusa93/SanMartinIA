import { useState, useEffect, useMemo } from 'react';
import { createClient } from '../lib/supabase/client';
import { type Player } from '../types/database';

export interface Alert {
    player: string;
    msg: string;
    type: 'load' | 'jump';
}

export function useDashboardData() {
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gps, setGps] = useState<any[]>([]);
    const [jumps, setJumps] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        (async () => {
            try {
                const since = new Date(Date.now() - 14 * 86400000).toISOString();
                const [pRes, gRes, jRes] = await Promise.all([
                    supabase.from('players').select('*'),
                    supabase.from('gps_metrics').select('*, players(first_name, last_name), training_sessions(session_date, session_name)').gte('created_at', since).order('created_at'),
                    supabase.from('jump_metrics').select('*, players(first_name, last_name)').gte('created_at', since).order('created_at'),
                ]);

                if (!mounted) return;

                setPlayers((pRes.data || []) as Player[]);
                setGps(gRes.data || []);
                setJumps(jRes.data || []);

                // ── Alerts Logic ──
                const computedAlerts: Alert[] = [];

                // GPS: Load increase >30% vs prev 7 days
                const now = Date.now();
                const week1Start = new Date(now - 14 * 86400000).getTime();
                const week2Start = new Date(now - 7 * 86400000).getTime();

                const allGps = (gRes.data || []) as any[];
                const playerGps = new Map<string, { w1: number[]; w2: number[]; name: string }>();

                allGps.forEach((g: any) => {
                    const t = new Date(g.created_at).getTime();
                    const pId = g.player_id;
                    const prev = playerGps.get(pId) || { w1: [], w2: [], name: `${g.players?.first_name} ${g.players?.last_name}` };

                    if (t >= week1Start && t < week2Start) prev.w1.push(Number(g.total_distance_m));
                    if (t >= week2Start) prev.w2.push(Number(g.total_distance_m));

                    playerGps.set(pId, prev);
                });

                playerGps.forEach(v => {
                    if (v.w1.length && v.w2.length) {
                        const avg1 = v.w1.reduce((a, b) => a + b, 0) / v.w1.length;
                        const avg2 = v.w2.reduce((a, b) => a + b, 0) / v.w2.length;
                        if (avg2 > avg1 * 1.3) {
                            computedAlerts.push({
                                player: v.name,
                                msg: `Carga externa subió ${(((avg2 - avg1) / avg1) * 100).toFixed(0)}% vs promedio anterior`,
                                type: 'load'
                            });
                        }
                    }
                });

                // Jumps: CMJ drop >10%
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
                        if (change < -10) {
                            computedAlerts.push({
                                player: v.name,
                                msg: `CMJ cayó ${Math.abs(change).toFixed(1)}% (${first.toFixed(1)} → ${last.toFixed(1)} cm)`,
                                type: 'jump'
                            });
                        }
                    }
                });

                setAlerts(computedAlerts);
                setLoading(false);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, []);

    // ── Derived Stats ──
    const stats = useMemo(() => {
        if (loading) return { avgDist: 0, avgSpeed: 0, avgJump: 0, top5: [], loadBySession: [] };

        // KPIs
        const avgDist = gps.length ? gps.reduce((s, g) => s + Number(g.total_distance_m), 0) / gps.length : 0;
        const avgSpeed = gps.length ? gps.reduce((s, g) => s + (Number(g.max_speed_kmh) || 0), 0) / gps.length : 0;
        const cmjJumps = jumps.filter((j: any) => j.test_type === 'CMJ');
        const avgJump = cmjJumps.length ? cmjJumps.reduce((s: number, j: any) => s + Number(j.jump_height_cm), 0) / cmjJumps.length : 0;

        // Top 5 Distance
        const playerDist = new Map<string, { name: string; total: number }>();
        gps.forEach((g: any) => {
            const prev = playerDist.get(g.player_id) || { name: `${g.players?.first_name} ${g.players?.last_name}`, total: 0 };
            prev.total += Number(g.total_distance_m);
            playerDist.set(g.player_id, prev);
        });
        const top5 = [...playerDist.values()].sort((a, b) => b.total - a.total).slice(0, 5);

        // Load by Session
        const sessionLoad = new Map<string, { label: string; total: number }>();
        gps.forEach((g: any) => {
            const label = g.training_sessions?.session_name || 'Sin sesión';
            const prev = sessionLoad.get(label) || { label, total: 0 };
            prev.total += Number(g.total_distance_m);
            sessionLoad.set(label, prev);
        });
        const loadBySession = [...sessionLoad.values()];

        return { avgDist, avgSpeed, avgJump, top5, loadBySession };
    }, [gps, jumps, loading]);

    return { loading, players, gps, jumps, alerts, stats };
}
