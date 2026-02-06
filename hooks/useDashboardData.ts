import { useState, useEffect, useMemo } from 'react';
import { createClient } from '../lib/supabase/client';
import { type Player } from '../types/database';

export interface Alert {
    player: string;
    playerId?: string;
    msg: string;
    type: 'load' | 'jump' | 'strength' | 'injury' | 'fatigue';
    severity: 'warning' | 'critical';
    value?: number;
    threshold?: number;
    createdAt: string;
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
                const [pRes, gRes, jRes, sRes] = await Promise.all([
                    supabase.from('players').select('*'),
                    supabase.from('gps_metrics').select('*, players(first_name, last_name), training_sessions(session_date, session_name)').gte('created_at', since).order('created_at'),
                    supabase.from('jump_metrics').select('*, players(first_name, last_name)').gte('created_at', since).order('created_at'),
                    supabase.from('strength_metrics').select('*, players(first_name, last_name)').gte('created_at', since).order('created_at'),
                ]);

                if (!mounted) return;

                setPlayers((pRes.data || []) as Player[]);
                setGps(gRes.data || []);
                setJumps(jRes.data || []);

                // ── Alerts Logic ──
                const computedAlerts: Alert[] = [];
                const now = Date.now();
                const nowISO = new Date().toISOString();
                const week1Start = new Date(now - 14 * 86400000).getTime();
                const week2Start = new Date(now - 7 * 86400000).getTime();

                // 1. INJURY ALERTS - Players marked as injured
                const allPlayers = (pRes.data || []) as Player[];
                allPlayers.forEach(p => {
                    if (p.status === 'injured') {
                        computedAlerts.push({
                            player: `${p.first_name} ${p.last_name}`,
                            playerId: p.id,
                            msg: `Jugador lesionado - requiere seguimiento médico`,
                            type: 'injury',
                            severity: 'critical',
                            createdAt: nowISO,
                        });
                    }
                });

                // 2. GPS LOAD ALERTS - Load increase >30% or very high load
                const allGps = (gRes.data || []) as any[];
                type GpsAccum = { id: string; w1: number[]; w2: number[]; name: string; lastLoad: number };
                const playerGps = new Map<string, GpsAccum>();

                allGps.forEach((g: any) => {
                    const t = new Date(g.created_at).getTime();
                    const pId = g.player_id;
                    const existing = playerGps.get(pId);
                    const prev: GpsAccum = existing || { id: pId, w1: [] as number[], w2: [] as number[], name: `${g.players?.first_name} ${g.players?.last_name}`, lastLoad: 0 };

                    if (t >= week1Start && t < week2Start) prev.w1.push(Number(g.total_distance_m));
                    if (t >= week2Start) {
                        prev.w2.push(Number(g.total_distance_m));
                        prev.lastLoad = Number(g.player_load) || 0;
                    }

                    playerGps.set(pId, prev);
                });

                playerGps.forEach(v => {
                    // Load spike alert
                    if (v.w1.length && v.w2.length) {
                        const avg1 = v.w1.reduce((a, b) => a + b, 0) / v.w1.length;
                        const avg2 = v.w2.reduce((a, b) => a + b, 0) / v.w2.length;
                        const change = ((avg2 - avg1) / avg1) * 100;
                        if (change > 30) {
                            computedAlerts.push({
                                player: v.name,
                                playerId: v.id,
                                msg: `Carga externa subió ${change.toFixed(0)}% vs promedio anterior`,
                                type: 'load',
                                severity: change > 50 ? 'critical' : 'warning',
                                value: avg2,
                                threshold: avg1 * 1.3,
                                createdAt: nowISO,
                            });
                        }
                    }
                    // High player load alert (>500)
                    if (v.lastLoad > 500) {
                        computedAlerts.push({
                            player: v.name,
                            playerId: v.id,
                            msg: `Player Load muy alto: ${v.lastLoad.toFixed(0)} - riesgo de fatiga`,
                            type: 'fatigue',
                            severity: v.lastLoad > 600 ? 'critical' : 'warning',
                            value: v.lastLoad,
                            threshold: 500,
                            createdAt: nowISO,
                        });
                    }
                });

                // 3. CMJ DROP ALERTS - >10% drop indicates fatigue
                type JumpAccum = { id: string; values: number[]; name: string };
                const playerJumps = new Map<string, JumpAccum>();
                (jRes.data || []).forEach((j: any) => {
                    if (j.test_type !== 'CMJ') return;
                    const existing = playerJumps.get(j.player_id);
                    const prev: JumpAccum = existing || { id: j.player_id, values: [] as number[], name: `${j.players?.first_name} ${j.players?.last_name}` };
                    prev.values.push(Number(j.jump_height_cm));
                    playerJumps.set(j.player_id, prev);
                });

                playerJumps.forEach(v => {
                    if (v.values.length >= 2) {
                        const baseline = v.values.slice(0, Math.ceil(v.values.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(v.values.length / 2);
                        const recent = v.values.slice(-2).reduce((a, b) => a + b, 0) / 2;
                        const change = ((recent - baseline) / baseline) * 100;
                        if (change < -10) {
                            computedAlerts.push({
                                player: v.name,
                                playerId: v.id,
                                msg: `CMJ cayó ${Math.abs(change).toFixed(1)}% (${baseline.toFixed(1)} → ${recent.toFixed(1)} cm)`,
                                type: 'jump',
                                severity: change < -15 ? 'critical' : 'warning',
                                value: recent,
                                threshold: baseline * 0.9,
                                createdAt: nowISO,
                            });
                        }
                    }
                });

                // 4. STRENGTH ALERTS - Significant drops in strength metrics
                type StrengthAccum = { id: string; squats: number[]; name: string };
                const playerStrength = new Map<string, StrengthAccum>();
                (sRes.data || []).forEach((s: any) => {
                    if (s.exercise_name?.toLowerCase().includes('squat')) {
                        const existing = playerStrength.get(s.player_id);
                        const prev: StrengthAccum = existing || { id: s.player_id, squats: [] as number[], name: `${s.players?.first_name} ${s.players?.last_name}` };
                        prev.squats.push(Number(s.load_kg));
                        playerStrength.set(s.player_id, prev);
                    }
                });

                playerStrength.forEach(v => {
                    if (v.squats.length >= 2) {
                        const first = v.squats[0];
                        const last = v.squats[v.squats.length - 1];
                        const change = ((last - first) / first) * 100;
                        if (change < -15) {
                            computedAlerts.push({
                                player: v.name,
                                playerId: v.id,
                                msg: `Fuerza en squat bajó ${Math.abs(change).toFixed(0)}% (${first}kg → ${last}kg)`,
                                type: 'strength',
                                severity: 'warning',
                                value: last,
                                threshold: first * 0.85,
                                createdAt: nowISO,
                            });
                        }
                    }
                });

                // Sort by severity (critical first)
                computedAlerts.sort((a, b) => {
                    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
                    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
                    return 0;
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
        if (loading) return {
            avgDist: 0, avgSpeed: 0, avgJump: 0,
            top5: [], loadBySession: [],
            dailyLoad: [], cmjTrend: [], speedTrend: []
        };

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

        // Daily Load Trend (team average per day)
        const dailyLoadMap = new Map<string, { date: string; distance: number; load: number; speed: number; count: number }>();
        gps.forEach((g: any) => {
            const date = new Date(g.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
            const prev = dailyLoadMap.get(date) || { date, distance: 0, load: 0, speed: 0, count: 0 };
            prev.distance += Number(g.total_distance_m) || 0;
            prev.load += Number(g.player_load) || 0;
            prev.speed = Math.max(prev.speed, Number(g.max_speed_kmh) || 0);
            prev.count += 1;
            dailyLoadMap.set(date, prev);
        });
        const dailyLoad = [...dailyLoadMap.values()]
            .map(d => ({
                date: d.date,
                distance: Math.round(d.distance / d.count / 1000 * 10) / 10, // km avg
                load: Math.round(d.load / d.count),
                speed: Math.round(d.speed * 10) / 10,
            }))
            .slice(-7); // Last 7 days

        // CMJ Trend (team average per day)
        const cmjTrendMap = new Map<string, { date: string; height: number; count: number }>();
        cmjJumps.forEach((j: any) => {
            const date = new Date(j.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
            const prev = cmjTrendMap.get(date) || { date, height: 0, count: 0 };
            prev.height += Number(j.jump_height_cm) || 0;
            prev.count += 1;
            cmjTrendMap.set(date, prev);
        });
        const cmjTrend = [...cmjTrendMap.values()]
            .map(d => ({
                date: d.date,
                height: Math.round(d.height / d.count * 10) / 10,
            }));

        // Speed trend by session
        const speedBySession = new Map<string, { label: string; maxSpeed: number; avgSpeed: number; count: number }>();
        gps.forEach((g: any) => {
            const label = g.training_sessions?.session_date
                ? new Date(g.training_sessions.session_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                : 'Sin fecha';
            const prev = speedBySession.get(label) || { label, maxSpeed: 0, avgSpeed: 0, count: 0 };
            prev.maxSpeed = Math.max(prev.maxSpeed, Number(g.max_speed_kmh) || 0);
            prev.avgSpeed += Number(g.max_speed_kmh) || 0;
            prev.count += 1;
            speedBySession.set(label, prev);
        });
        const speedTrend = [...speedBySession.values()]
            .map(d => ({
                date: d.label,
                max: Math.round(d.maxSpeed * 10) / 10,
                avg: Math.round(d.avgSpeed / d.count * 10) / 10,
            }))
            .slice(-7);

        return { avgDist, avgSpeed, avgJump, top5, loadBySession, dailyLoad, cmjTrend, speedTrend };
    }, [gps, jumps, loading]);

    return { loading, players, gps, jumps, alerts, stats };
}
