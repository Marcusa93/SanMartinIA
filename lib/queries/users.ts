import { type SupabaseClient } from '@supabase/supabase-js';
import { type UserProfile } from '../../types/database';

export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
  const { data } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
  return data as UserProfile | null;
}

export async function getAllUserProfiles(supabase: SupabaseClient): Promise<UserProfile[]> {
  const { data, error } = await supabase.from('user_profiles').select('*').order('full_name');
  if (error) throw error;
  return data as UserProfile[];
}

export async function updateUserProfile(supabase: SupabaseClient, userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).select('*').single();
  if (error) throw error;
  return data as UserProfile;
}
