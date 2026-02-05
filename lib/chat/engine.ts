/**
 * Chat Engine — RAG interno + OpenRouter LLM
 *
 * Flujo:
 * 1. Detectar intent por keywords.
 * 2. Ejecutar query contra Supabase (service role).
 * 3. Formatear contexto recuperado.
 * 4. Si LLM_PROVIDER está configurado → enviar contexto al LLM y devolver su respuesta.
 *    Si no → devolver el texto formateado directamente.
 *
 * REGLA: NUNCA inventar datos. El LLM recibe solo datos reales como contexto.
 */

import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

interface ChatContext {
  userId: string;
}

interface ChatResponse {
  content: string;
  citations: string[];
}

// ─── Keyword matchers ─────────────────────────────────────────
function detectIntent(question: string): 'gps' | 'jump' | 'strength' | 'player_list' | 'unknown' {
  const q = question.toLowerCase();
  if (/carga|distancia|velocidad|gps|sprint|high.speed|accel|decel|player.load/.test(q)) return 'gps';
  if (/salto|cmj|sj|dj|jump|potencia|asimetr/.test(q)) return 'jump';
  if (/fuerza|squat|bench|hip|1rm|rpe|ejercicio|strength/.test(q)) return 'strength';
  if (/plantel|jugadores|lista|activ|herido/.test(q)) return 'player_list';
  return 'unknown';
}

function extractPlayerName(question: string): string | null {
  const match = question.match(/(?:de|del|sobre|jugador)\s+([A-ZÀÁÂÃÄÅ-ÿa-z]+(?:\s+[A-ZÀÁÂÃÄÅ-ÿa-z]+)?)/i);
  return match ? match[1].trim() : null;
}

function getDateRange(question: string): { since: string } {
  const q = question.toLowerCase();
  let days = 7;
  if (/14|dos semana|2 semana|últimas 2/.test(q)) days = 14;
  if (/30|mes|último mes/.test(q)) days = 30;
  if (/esta semana/.test(q)) days = 7;
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  return { since };
}

// ─── Supabase admin client (service role) ────────────────────
function getSupabase() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Query executors ──────────────────────────────────────────
async function queryGps(playerName: string | null, since: string): Promise<{ rows: any[]; citations: string[] }> {
  const supabase = getSupabase();
  let playerId: string | null = null;

  if (playerName) {
    const { data: players } = await supabase
      .from('players')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${playerName}%,last_name.ilike.%${playerName}%`);
    if (players && players.length > 0) playerId = players[0].id;
  }

  let q = supabase
    .from('gps_metrics')
    .select('gps_metrics.*, players.first_name, players.last_name, training_sessions.session_date, training_sessions.session_name')
    .gte('gps_metrics.created_at', since)
    .order('gps_metrics.created_at', { ascending: false })
    .limit(50);

  if (playerId) q = q.eq('gps_metrics.player_id', playerId);

  const { data } = await q;
  return { rows: data || [], citations: [`gps_metrics (desde ${since})`] };
}

async function queryJumps(playerName: string | null, since: string): Promise<{ rows: any[]; citations: string[] }> {
  const supabase = getSupabase();
  let playerId: string | null = null;

  if (playerName) {
    const { data: players } = await supabase
      .from('players')
      .select('id')
      .or(`first_name.ilike.%${playerName}%,last_name.ilike.%${playerName}%`);
    if (players && players.length > 0) playerId = players[0].id;
  }

  let q = supabase
    .from('jump_metrics')
    .select('jump_metrics.*, players.first_name, players.last_name')
    .gte('jump_metrics.created_at', since)
    .order('jump_metrics.created_at', { ascending: false })
    .limit(50);

  if (playerId) q = q.eq('jump_metrics.player_id', playerId);

  const { data } = await q;
  return { rows: data || [], citations: [`jump_metrics (desde ${since})`] };
}

async function queryStrength(playerName: string | null, since: string): Promise<{ rows: any[]; citations: string[] }> {
  const supabase = getSupabase();
  let playerId: string | null = null;

  if (playerName) {
    const { data: players } = await supabase
      .from('players')
      .select('id')
      .or(`first_name.ilike.%${playerName}%,last_name.ilike.%${playerName}%`);
    if (players && players.length > 0) playerId = players[0].id;
  }

  let q = supabase
    .from('strength_metrics')
    .select('strength_metrics.*, players.first_name, players.last_name')
    .gte('strength_metrics.created_at', since)
    .order('strength_metrics.created_at', { ascending: false })
    .limit(50);

  if (playerId) q = q.eq('strength_metrics.player_id', playerId);

  const { data } = await q;
  return { rows: data || [], citations: [`strength_metrics (desde ${since})`] };
}

async function queryPlayerList(): Promise<{ rows: any[]; citations: string[] }> {
  const supabase = getSupabase();
  const { data } = await supabase.from('players').select('*').order('last_name');
  return { rows: data || [], citations: ['players'] };
}

// ─── Response formatters ──────────────────────────────────────
function formatGpsResponse(rows: any[], playerName: string | null): string {
  if (rows.length === 0) return 'No tengo datos suficientes de GPS para ese período. Te sugiero cargar datos desde el módulo "Carga".';

  if (playerName && rows.length > 0) {
    const player = rows[0];
    const name = `${player.first_name} ${player.last_name}`;
    const avg = (rows.reduce((s: number, r: any) => s + Number(r.total_distance_m), 0) / rows.length).toFixed(0);
    const maxSpeed = Math.max(...rows.map((r: any) => Number(r.max_speed_kmh) || 0)).toFixed(1);
    const totalDist = rows.reduce((s: number, r: any) => s + Number(r.total_distance_m), 0).toFixed(0);
    return `📊 **${name} — Carga externa:**\n- Sesiones registradas: ${rows.length}\n- Distancia total acumulada: ${totalDist} m\n- Distancia promedio/sesión: ${avg} m\n- Velocidad máxima alcanzada: ${maxSpeed} km/h`;
  }

  const avg = (rows.reduce((s: number, r: any) => s + Number(r.total_distance_m), 0) / rows.length).toFixed(0);
  const playerMap = new Map<string, { name: string; total: number }>();
  rows.forEach((r: any) => {
    const prev = playerMap.get(r.player_id) || { name: `${r.first_name} ${r.last_name}`, total: 0 };
    prev.total += Number(r.total_distance_m);
    playerMap.set(r.player_id, prev);
  });
  const ranking = [...playerMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  const top = ranking.map((p, i) => `  ${i + 1}. ${p.name}: ${p.total.toFixed(0)} m`).join('\n');

  return `📊 **Carga externa del plantel:**\n- Registros totales: ${rows.length}\n- Distancia promedio/sesión: ${avg} m\n\n🏆 **Top 5 por distancia acumulada:**\n${top}`;
}

function formatJumpsResponse(rows: any[], playerName: string | null): string {
  if (rows.length === 0) return 'No tengo datos suficientes de saltos para ese período. Te sugiero cargar datos desde el módulo "Carga".';

  if (playerName && rows.length > 0) {
    const player = rows[0];
    const name = `${player.first_name} ${player.last_name}`;
    const cmjs = rows.filter((r: any) => r.test_type === 'CMJ');
    const sjs = rows.filter((r: any) => r.test_type === 'SJ');
    let resp = `📊 **${name} — Saltos:**\n`;
    if (cmjs.length) {
      const heights = cmjs.map((r: any) => Number(r.jump_height_cm));
      resp += `- CMJ: ${cmjs.length} tests | Último: ${heights[0].toFixed(1)} cm | Máximo: ${Math.max(...heights).toFixed(1)} cm\n`;
    }
    if (sjs.length) {
      const heights = sjs.map((r: any) => Number(r.jump_height_cm));
      resp += `- SJ: ${sjs.length} tests | Último: ${heights[0].toFixed(1)} cm | Máximo: ${Math.max(...heights).toFixed(1)} cm\n`;
    }
    if (cmjs.length >= 2) {
      const sorted = cmjs.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const first = Number(sorted[0].jump_height_cm);
      const last  = Number(sorted[sorted.length - 1].jump_height_cm);
      const change = ((last - first) / first) * 100;
      if (change < -8) resp += `\n⚠️ **Alerta:** Caída de CMJ del ${Math.abs(change).toFixed(1)}% respecto al inicio del período. Revisar recuperación.\n`;
      else if (change > 3) resp += `\n✅ Mejora de CMJ del ${change.toFixed(1)}% respecto al inicio del período.\n`;
    }
    return resp;
  }

  const playerJumps = new Map<string, { name: string; jumps: number[] }>();
  rows.forEach((r: any) => {
    if (r.test_type !== 'CMJ') return;
    const prev = playerJumps.get(r.player_id) || { name: `${r.first_name} ${r.last_name}`, jumps: [] };
    prev.jumps.push(Number(r.jump_height_cm));
    playerJumps.set(r.player_id, prev);
  });
  const alerts: string[] = [];
  playerJumps.forEach((v) => {
    if (v.jumps.length < 2) return;
    const first = v.jumps[v.jumps.length - 1];
    const last  = v.jumps[0];
    const change = ((last - first) / first) * 100;
    if (change < -8) alerts.push(`⚠️ ${v.name}: caída de ${Math.abs(change).toFixed(1)}% (${first.toFixed(1)} → ${last.toFixed(1)} cm)`);
  });
  if (alerts.length) return `📊 **Alertas de caída CMJ en el plantel:**\n${alerts.join('\n')}`;
  return `📊 **Saltos del plantel:** ${rows.length} registros. No se detectaron caídas significativas (>8%) en el período.`;
}

function formatStrengthResponse(rows: any[], playerName: string | null): string {
  if (rows.length === 0) return 'No tengo datos suficientes de fuerza para ese período. Te sugiero cargar datos desde el módulo "Carga".';

  if (playerName && rows.length > 0) {
    const player = rows[0];
    const name = `${player.first_name} ${player.last_name}`;
    const exercises = new Map<string, { sets: number; maxLoad: number; max1rm: number }>();
    rows.forEach((r: any) => {
      const prev = exercises.get(r.exercise_name) || { sets: 0, maxLoad: 0, max1rm: 0 };
      prev.sets += Number(r.set_count) || 0;
      prev.maxLoad = Math.max(prev.maxLoad, Number(r.load_kg) || 0);
      prev.max1rm = Math.max(prev.max1rm, Number(r.estimated_1rm) || 0);
      exercises.set(r.exercise_name, prev);
    });
    let resp = `📊 **${name} — Fuerza:**\n`;
    exercises.forEach((v, ex) => {
      resp += `- **${ex}:** ${v.sets} series | Carga máx: ${v.maxLoad} kg`;
      if (v.max1rm > 0) resp += ` | 1RM est: ${v.max1rm} kg`;
      resp += '\n';
    });
    return resp;
  }

  return `📊 **Fuerza del plantel:** ${rows.length} registros de ejercicios en el período.`;
}

function formatPlayerListResponse(rows: any[]): string {
  if (rows.length === 0) return 'No hay jugadores registrados aún.';
  const active = rows.filter((p: any) => p.status === 'active');
  const injured = rows.filter((p: any) => p.status === 'injured');
  const rehab = rows.filter((p: any) => p.status === 'rehab');
  return `👥 **Plantel (${rows.length} jugadores):**\n- Activos: ${active.length}\n- Lesionados: ${injured.length}\n- Rehabilitación: ${rehab.length}\n\nPara ver detalle individual, visitá la sección "Plantel".`;
}

// ─── OpenRouter LLM call ──────────────────────────────────────
async function callOpenRouterLLM(question: string, retrievedContext: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY!;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://sanmartin-perflab.local',
      'X-Title': 'San Martín Performance Lab',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Sos un asistente de análisis deportivo para el club San Martín de Tucumán. ' +
            'SOLO usás los datos proporcionados en el contexto. NUNCA inventás números ni hechos que no estén en el contexto. ' +
            'Respondés en español (argentino). Sos conciso y profesional. ' +
            'Si el contexto no tiene información suficiente para responder, decilo claramente.',
        },
        {
          role: 'user',
          content: `Pregunta: ${question}\n\nContexto recuperado del sistema:\n${retrievedContext}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[OpenRouter] error:', res.status, err);
    throw new Error('LLM call failed');
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

// ─── MAIN ENTRY ───────────────────────────────────────────────
export async function processQuestion(question: string, _ctx: ChatContext): Promise<ChatResponse> {
  const intent = detectIntent(question);
  const playerName = extractPlayerName(question);
  const { since } = getDateRange(question);

  let content: string;
  let citations: string[] = [];

  switch (intent) {
    case 'gps': {
      const { rows, citations: c } = await queryGps(playerName, since);
      citations = c;
      content = formatGpsResponse(rows, playerName);
      break;
    }
    case 'jump': {
      const { rows, citations: c } = await queryJumps(playerName, since);
      citations = c;
      content = formatJumpsResponse(rows, playerName);
      break;
    }
    case 'strength': {
      const { rows, citations: c } = await queryStrength(playerName, since);
      citations = c;
      content = formatStrengthResponse(rows, playerName);
      break;
    }
    case 'player_list': {
      const { rows, citations: c } = await queryPlayerList();
      citations = c;
      content = formatPlayerListResponse(rows);
      break;
    }
    default: {
      content =
        'No entendí tu pregunta. Puedo ayudarte con:\n' +
        '- **Carga externa (GPS):** distancia, velocidad, sprints del plantel o un jugador\n' +
        '- **Saltos:** CMJ, SJ, alertas de caída\n' +
        '- **Fuerza:** ejercicios, 1RM, series\n' +
        '- **Plantel:** resumen de estado del equipo\n\n' +
        'Ejemplo: *"¿Cómo viene la carga de García esta semana?"*';
      citations = [];
    }
  }

  // ── LLM enhancement: if provider configured, send context to LLM ──
  if (process.env.LLM_PROVIDER && content && intent !== 'unknown') {
    try {
      const llmAnswer = await callOpenRouterLLM(question, content);
      if (llmAnswer.trim()) {
        content = llmAnswer.trim();
      }
    } catch {
      // LLM failed → fall back to keyword-formatted content (already set)
      console.warn('[chat/engine] LLM call failed, using keyword fallback');
    }
  }

  return { content, citations };
}
