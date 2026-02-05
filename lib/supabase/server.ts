import { createServerClient } from '@supabase/ssr';

export function createServerComponentClient({
  cookies,
}: {
  cookies: () => ReadonlyArray<{ name: string; value: string }>;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [...cookies()];
        },
      },
    }
  );
}

// Service-role client for server-only operations (migrations, seed, chat RAG)
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() { /* no-op: service client doesn't need cookies */ },
      },
    }
  );
}
