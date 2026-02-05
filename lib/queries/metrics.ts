import { type SupabaseClient } from '@supabase/supabase-js';
import { type GpsMetric, type StrengthMetric, type JumpMetric } from '../../types/database';

// ─── GPS ──────────────────────────────────────────────────────
export async function getGpsForPlayer(
  supabase: SupabaseClient,
  playerId: string,
  since?: string // ISO date string
): Promise<GpsMetric[]> {
  let q = supabase
    .from('gps_metrics')
    .select('*, training_sessions(session_date, session_name, microcycle_label)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: true });
  if (since) q = q.gte('created_at', since);
  const { data, error } = await q;
  if (error) throw error;
  return data as GpsMetric[];
}

export async function getGpsForSession(supabase: SupabaseClient, sessionId: string): Promise<GpsMetric[]> {
  const { data, error } = await supabase.from('gps_metrics').select('*').eq('session_id', sessionId);
  if (error) throw error;
  return data as GpsMetric[];
}

export async function insertGps(supabase: SupabaseClient, payload: Omit<GpsMetric, 'id' | 'created_at'>, userId: string) {
  const { data, error } = await supabase.from('gps_metrics').insert({ ...payload, created_by: userId }).select('*').single();
  if (error) throw error;
  return data as GpsMetric;
}

// ─── STRENGTH ─────────────────────────────────────────────────
export async function getStrengthForPlayer(
  supabase: SupabaseClient,
  playerId: string,
  since?: string
): Promise<StrengthMetric[]> {
  let q = supabase.from('strength_metrics').select('*').eq('player_id', playerId).order('created_at', { ascending: true });
  if (since) q = q.gte('created_at', since);
  const { data, error } = await q;
  if (error) throw error;
  return data as StrengthMetric[];
}

export async function insertStrength(supabase: SupabaseClient, payload: Omit<StrengthMetric, 'id' | 'created_at'>, userId: string) {
  const { data, error } = await supabase.from('strength_metrics').insert({ ...payload, created_by: userId }).select('*').single();
  if (error) throw error;
  return data as StrengthMetric;
}

// ─── JUMPS ────────────────────────────────────────────────────
export async function getJumpsForPlayer(
  supabase: SupabaseClient,
  playerId: string,
  since?: string
): Promise<JumpMetric[]> {
  let q = supabase.from('jump_metrics').select('*').eq('player_id', playerId).order('created_at', { ascending: true });
  if (since) q = q.gte('created_at', since);
  const { data, error } = await q;
  if (error) throw error;
  return data as JumpMetric[];
}

export async function insertJump(supabase: SupabaseClient, payload: Omit<JumpMetric, 'id' | 'created_at'>, userId: string) {
  const { data, error } = await supabase.from('jump_metrics').insert({ ...payload, created_by: userId }).select('*').single();
  if (error) throw error;
  return data as JumpMetric;
}

// ─── Dashboard aggregates ────────────────────────────────────
export async function getDashboardKPIs(supabase: SupabaseClient, sinceDays: number = 7) {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();

  const [gpsRes, jumpRes, strengthRes] = await Promise.all([
    supabase.from('gps_metrics').select('*').gte('created_at', since),
    supabase.from('jump_metrics').select('*').gte('created_at', since),
    supabase.from('strength_metrics').select('*').gte('created_at', since),
  ]);

  const gps = (gpsRes.data || []) as GpsMetric[];
  const jumps = (jumpRes.data || []) as JumpMetric[];
  const strength = (strengthRes.data || []) as StrengthMetric[];

  const avgDistance = gps.length ? gps.reduce((s, g) => s + Number(g.total_distance_m), 0) / gps.length : 0;
  const avgMaxSpeed = gps.length ? gps.reduce((s, g) => s + (Number(g.max_speed_kmh) || 0), 0) / gps.length : 0;
  const avgJumpHeight = jumps.length ? jumps.reduce((s, j) => s + Number(j.jump_height_cm), 0) / jumps.length : 0;

  // Top 5 por distancia total
  const playerDistances = new Map<string, number>();
  gps.forEach(g => {
    playerDistances.set(g.player_id, (playerDistances.get(g.player_id) || 0) + Number(g.total_distance_m));
  });
  const top5 = [...playerDistances.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([player_id, total]) => ({ player_id, total_distance_m: total }));

  return { avgDistance, avgMaxSpeed, avgJumpHeight, top5, gpsCount: gps.length, jumpCount: jumps.length, strengthCount: strength.length };
}
