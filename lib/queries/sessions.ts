import { type SupabaseClient } from '@supabase/supabase-js';
import { type TrainingSession } from '../../types/database';

export async function getSessions(supabase: SupabaseClient): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .order('session_date', { ascending: false });
  if (error) throw error;
  return data as TrainingSession[];
}

export async function getSessionById(supabase: SupabaseClient, id: string): Promise<TrainingSession | null> {
  const { data } = await supabase.from('training_sessions').select('*').eq('id', id).single();
  return data as TrainingSession | null;
}

export async function createSession(supabase: SupabaseClient, payload: Omit<TrainingSession, 'id' | 'created_at'>, userId: string): Promise<TrainingSession> {
  const { data, error } = await supabase.from('training_sessions').insert({ ...payload, created_by: userId }).select('*').single();
  if (error) throw error;
  return data as TrainingSession;
}
