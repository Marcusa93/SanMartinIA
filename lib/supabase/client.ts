'use client';

import { createBrowserClient } from '@supabase/ssr';
import { createMockClient } from '../mock/client';

/** true when the mock_session cookie is present (browser only) */
function isMockMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('mock_session='));
}

export function createClient(): any {
  if (isMockMode()) return createMockClient();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
