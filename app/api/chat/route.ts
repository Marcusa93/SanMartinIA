import { NextResponse } from 'next/server';
import { processQuestion } from '../../../lib/chat/engine';
import { getMockChatResponse } from '../../../lib/mock/data';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
  const cookieStore = await (await import('next/headers')).cookies();

  // ── Mock mode: skip auth, return canned response ──────────
  const isMock = cookieStore.getAll().some((c: any) => c.name === 'mock_session');

  const body = await request.json();
  const { question } = body;
  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'Pregunta inválida' }, { status: 400 });
  }

  if (isMock) {
    const result = getMockChatResponse(question);
    return NextResponse.json({ content: result.content, citations: result.citations });
  }

  // ── Real mode: verify Supabase auth ─────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* no-op */ },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const result = await processQuestion(question, { userId: user.id });
    return NextResponse.json({ content: result.content, citations: result.citations });
  } catch (e: any) {
    console.error('[chat/route] error:', e);
    return NextResponse.json({ content: 'Error interno al procesar tu pregunta. Intentá de nuevo.', citations: [] });
  }
}
