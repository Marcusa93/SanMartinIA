import { createServerComponentClient } from '../supabase/server';
import { type UserProfile, type UserRole } from '../../types/database';
import { MOCK_PROFILE } from '../mock/data';

/**
 * Returns the authenticated user's profile (including role).
 * Returns null if not authenticated or no profile exists.
 */
export async function getSession(cookies: () => ReadonlyArray<{ name: string; value: string }>) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { user, profile: profile as UserProfile | null };
}

/**
 * Mock-aware wrapper used by every server page.
 * If the mock_session cookie is present → returns the mock superadmin profile
 * without touching Supabase at all.
 */
export async function getMockAwareSession(cookies: () => ReadonlyArray<{ name: string; value: string }>) {
  const allCookies = cookies();
  const isMock = allCookies.some(c => c.name === 'mock_session');
  if (isMock) {
    return {
      user: { id: 'mock-user-001', email: 'demo@sanmartin.local' },
      profile: MOCK_PROFILE as unknown as UserProfile,
    };
  }
  return getSession(cookies);
}

/**
 * Role-based access check. Returns true if user has one of the allowed roles.
 */
export function hasRole(profile: UserProfile | null, allowed: UserRole[]): boolean {
  if (!profile) return false;
  return allowed.includes(profile.role);
}

/**
 * Roles that can write metrics / manage roster.
 */
export const WRITER_ROLES: UserRole[] = ['superadmin', 'admin_pf', 'admin_staff'];
export const ADMIN_ROLES:  UserRole[] = ['superadmin', 'admin_pf'];
export const ALL_ROLES:    UserRole[] = ['superadmin', 'company_dev', 'admin_pf', 'admin_staff', 'viewer'];
