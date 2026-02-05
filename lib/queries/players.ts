import { type SupabaseClient } from '@supabase/supabase-js';
import { type Player } from '../../types/database';

export async function getPlayers(supabase: SupabaseClient, filters?: {
  status?: string;
  position?: string;
  search?: string;
}): Promise<Player[]> {
  let query = supabase.from('players').select('*').order('last_name', { ascending: true });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.position) query = query.eq('position', filters.position);
  if (filters?.search) {
    const s = `%${filters.search}%`;
    query = query.or(`first_name.ilike.${s},last_name.ilike.${s},club_player_code.ilike.${s}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Player[];
}

export async function getPlayerById(supabase: SupabaseClient, id: string): Promise<Player | null> {
  const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
  if (error) return null;
  return data as Player;
}

export async function createPlayer(supabase: SupabaseClient, payload: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
  const { data, error } = await supabase.from('players').insert(payload).select('*').single();
  if (error) throw error;
  return data as Player;
}

export async function updatePlayer(supabase: SupabaseClient, id: string, payload: Partial<Player>): Promise<Player> {
  const { data, error } = await supabase.from('players').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Player;
}

export function getPositions(): string[] {
  return ['Portero', 'Defensor', 'Medio', 'Delantero'];
}
