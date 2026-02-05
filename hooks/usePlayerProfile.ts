import { useState, useEffect, useMemo } from 'react';
import { createClient } from '../lib/supabase/client';
import { type Player, type JumpMetric, type StrengthMetric } from '../types/database';
import { formatDate } from '../lib/utils';

export function usePlayerProfile(playerId: string) {
    const [player, setPlayer] = useState<Player | null>(null);
    const [gps, setGps] = useState<any[]>([]);
    const [jumps, setJumps] = useState<JumpMetric[]>([]);
    const [strength, setStrength] = useState<StrengthMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const [pRes, gRes, jRes, sRes] = await Promise.all([
                    supabase.from('players').select('*').eq('id', playerId).single(),
                    supabase.from('gps_metrics').select('*, training_sessions(session_date, session_name)').eq('player_id', playerId).order('created_at'),
                    supabase.from('jump_metrics').select('*').eq('player_id', playerId).order('created_at'),
                    supabase.from('strength_metrics').select('*').eq('player_id', playerId).order('created_at')
                ]);

                if (!mounted) return;

                setPlayer(pRes.data as Player | null);
                setGps(gRes.data || []);
                setJumps((jRes.data || []) as JumpMetric[]);
                setStrength((sRes.data || []) as StrengthMetric[]);
            } catch (error) {
                console.error("Error fetching player profile:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [playerId]);

    const chartsData = useMemo(() => {
        const gpsData = gps.map((g: any) => ({
            label: g.training_sessions?.session_name || formatDate(g.created_at),
            distancia: Number(g.total_distance_m),
            velocidad: Number(g.max_speed_kmh) || 0,
        }));

        const cmjData = jumps.filter(j => j.test_type === 'CMJ').map(j => ({
            date: formatDate(j.created_at),
            altura: Number(j.jump_height_cm),
        }));

        return { gps: gpsData, cmj: cmjData };
    }, [gps, jumps]);

    return { player, gps, jumps, strength, loading, chartsData };
}
