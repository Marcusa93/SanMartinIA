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

// ─── Response formatters (data-rich for LLM) ──────────────────
function formatGpsResponse(rows: any[], playerName: string | null): string {
  if (rows.length === 0) return 'NO HAY DATOS de GPS/carga externa para el período solicitado.';

  if (playerName && rows.length > 0) {
    const player = rows[0];
    const name = `${player.first_name} ${player.last_name}`;

    // Aggregate stats
    const distances = rows.map((r: any) => Number(r.total_distance_m));
    const hsd = rows.map((r: any) => Number(r.high_speed_distance_m) || 0);
    const sprints = rows.map((r: any) => Number(r.sprint_distance_m) || 0);
    const speeds = rows.map((r: any) => Number(r.max_speed_kmh) || 0);
    const loads = rows.map((r: any) => Number(r.player_load) || 0);
    const accels = rows.map((r: any) => Number(r.accel_count) || 0);
    const decels = rows.map((r: any) => Number(r.decel_count) || 0);

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr: number[]) => arr.length ? sum(arr) / arr.length : 0;
    const max = (arr: number[]) => arr.length ? Math.max(...arr) : 0;

    let ctx = `JUGADOR: ${name}\n`;
    ctx += `PERÍODO: ${rows.length} sesiones\n\n`;
    ctx += `MÉTRICAS GPS:\n`;
    ctx += `- total_distance_m: promedio ${avg(distances).toFixed(0)} m, total acumulado ${sum(distances).toFixed(0)} m\n`;
    ctx += `- high_speed_distance_m: promedio ${avg(hsd).toFixed(0)} m/sesión\n`;
    ctx += `- sprint_distance_m: promedio ${avg(sprints).toFixed(0)} m/sesión\n`;
    ctx += `- max_speed_kmh: máxima alcanzada ${max(speeds).toFixed(1)} km/h, promedio ${avg(speeds).toFixed(1)} km/h\n`;
    ctx += `- player_load: promedio ${avg(loads).toFixed(0)} AU\n`;
    ctx += `- accel_count: promedio ${avg(accels).toFixed(0)}/sesión\n`;
    ctx += `- decel_count: promedio ${avg(decels).toFixed(0)}/sesión\n`;

    // Session by session detail (last 5)
    ctx += `\nÚLTIMAS SESIONES (detalle):\n`;
    rows.slice(0, 5).forEach((r: any) => {
      const date = r.training_sessions?.session_date || r.created_at?.split('T')[0];
      const sessName = r.training_sessions?.session_name || 'N/A';
      ctx += `- ${date} (${sessName}): ${Number(r.total_distance_m).toFixed(0)}m, HSD ${Number(r.high_speed_distance_m || 0).toFixed(0)}m, Vmax ${Number(r.max_speed_kmh || 0).toFixed(1)}km/h\n`;
    });

    return ctx;
  }

  // Team overview
  const playerMap = new Map<string, { name: string; sessions: number; totalDist: number; avgDist: number; maxSpeed: number }>();
  rows.forEach((r: any) => {
    const pid = r.player_id;
    const prev = playerMap.get(pid) || {
      name: `${r.first_name} ${r.last_name}`,
      sessions: 0, totalDist: 0, avgDist: 0, maxSpeed: 0
    };
    prev.sessions++;
    prev.totalDist += Number(r.total_distance_m);
    prev.maxSpeed = Math.max(prev.maxSpeed, Number(r.max_speed_kmh) || 0);
    playerMap.set(pid, prev);
  });

  let ctx = `PLANTEL - CARGA EXTERNA GPS\n`;
  ctx += `Registros totales: ${rows.length}\n`;
  ctx += `Jugadores con datos: ${playerMap.size}\n\n`;
  ctx += `RESUMEN POR JUGADOR:\n`;

  [...playerMap.values()]
    .sort((a, b) => b.totalDist - a.totalDist)
    .forEach(p => {
      ctx += `- ${p.name}: ${p.sessions} sesiones, ${p.totalDist.toFixed(0)}m total, ${(p.totalDist/p.sessions).toFixed(0)}m/sesión prom, Vmax ${p.maxSpeed.toFixed(1)}km/h\n`;
    });

  return ctx;
}

function formatJumpsResponse(rows: any[], playerName: string | null): string {
  if (rows.length === 0) return 'NO HAY DATOS de saltos/plataforma para el período solicitado.';

  if (playerName && rows.length > 0) {
    const player = rows[0];
    const name = `${player.first_name} ${player.last_name}`;

    const cmjs = rows.filter((r: any) => r.test_type === 'CMJ').sort((a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const sjs = rows.filter((r: any) => r.test_type === 'SJ');
    const djs = rows.filter((r: any) => r.test_type === 'DJ');

    let ctx = `JUGADOR: ${name}\n`;
    ctx += `PERÍODO: ${rows.length} tests de salto\n\n`;
    ctx += `MÉTRICAS DE SALTO:\n`;

    if (cmjs.length) {
      const heights = cmjs.map((r: any) => Number(r.jump_height_cm));
      const powers = cmjs.map((r: any) => Number(r.peak_power_w) || 0).filter(p => p > 0);
      const asyms = cmjs.map((r: any) => Number(r.asymmetry_pct) || 0);
      const first = heights[0];
      const last = heights[heights.length - 1];
      const change = cmjs.length >= 2 ? ((last - first) / first) * 100 : 0;

      ctx += `\nCMJ (Counter Movement Jump):\n`;
      ctx += `- Tests: ${cmjs.length}\n`;
      ctx += `- jump_height_cm: primer test ${first.toFixed(1)}cm, último ${last.toFixed(1)}cm`;
      if (cmjs.length >= 2) ctx += ` (Δ ${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`;
      ctx += `\n`;
      ctx += `- Promedio: ${(heights.reduce((a,b)=>a+b,0)/heights.length).toFixed(1)}cm, Máximo: ${Math.max(...heights).toFixed(1)}cm\n`;
      if (powers.length) ctx += `- peak_power_w: promedio ${(powers.reduce((a,b)=>a+b,0)/powers.length).toFixed(0)}W\n`;
      if (asyms.some(a => a > 0)) ctx += `- asymmetry_pct: promedio ${(asyms.reduce((a,b)=>a+b,0)/asyms.length).toFixed(1)}%\n`;

      if (change < -10) ctx += `\n⚠️ ALERTA: Caída de CMJ >${Math.abs(change).toFixed(1)}% → posible fatiga neuromuscular acumulada\n`;
      else if (change < -5) ctx += `\n⚠️ ATENCIÓN: Caída de CMJ del ${Math.abs(change).toFixed(1)}% → monitorear recuperación\n`;
    }

    if (sjs.length) {
      const heights = sjs.map((r: any) => Number(r.jump_height_cm));
      ctx += `\nSJ (Squat Jump):\n`;
      ctx += `- Tests: ${sjs.length}, Promedio: ${(heights.reduce((a,b)=>a+b,0)/heights.length).toFixed(1)}cm\n`;
    }

    if (djs.length) {
      const rsis = djs.map((r: any) => Number(r.rsi) || 0).filter(r => r > 0);
      ctx += `\nDJ (Drop Jump):\n`;
      ctx += `- Tests: ${djs.length}`;
      if (rsis.length) ctx += `, RSI promedio: ${(rsis.reduce((a,b)=>a+b,0)/rsis.length).toFixed(2)}`;
      ctx += `\n`;
    }

    return ctx;
  }

  // Team overview
  const playerJumps = new Map<string, { name: string; cmjValues: number[]; lastCmj: number; firstCmj: number }>();
  rows.forEach((r: any) => {
    if (r.test_type !== 'CMJ') return;
    const pid = r.player_id;
    const prev = playerJumps.get(pid) || { name: `${r.first_name} ${r.last_name}`, cmjValues: [], lastCmj: 0, firstCmj: 0 };
    prev.cmjValues.push(Number(r.jump_height_cm));
    playerJumps.set(pid, prev);
  });

  let ctx = `PLANTEL - DATOS DE SALTO (CMJ)\n`;
  ctx += `Registros totales: ${rows.length}\n`;
  ctx += `Jugadores con CMJ: ${playerJumps.size}\n\n`;
  ctx += `RESUMEN POR JUGADOR:\n`;

  const alerts: string[] = [];
  [...playerJumps.values()].forEach(p => {
    if (p.cmjValues.length >= 2) {
      p.firstCmj = p.cmjValues[0];
      p.lastCmj = p.cmjValues[p.cmjValues.length - 1];
    }
    const avg = p.cmjValues.reduce((a,b)=>a+b,0) / p.cmjValues.length;
    const change = p.cmjValues.length >= 2 ? ((p.lastCmj - p.firstCmj) / p.firstCmj) * 100 : 0;

    ctx += `- ${p.name}: ${p.cmjValues.length} tests, promedio ${avg.toFixed(1)}cm`;
    if (p.cmjValues.length >= 2) {
      ctx += `, tendencia: ${p.firstCmj.toFixed(1)}→${p.lastCmj.toFixed(1)}cm (${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`;
      if (change < -10) alerts.push(`${p.name}: caída CMJ ${Math.abs(change).toFixed(1)}%`);
    }
    ctx += `\n`;
  });

  if (alerts.length) {
    ctx += `\n⚠️ ALERTAS NEUROMUSCULARES:\n`;
    alerts.forEach(a => ctx += `- ${a}\n`);
  }

  return ctx;
}

function formatStrengthResponse(rows: any[], playerName: string | null): string {
  if (rows.length === 0) return 'NO HAY DATOS de fuerza/gimnasio para el período solicitado.';

  if (playerName && rows.length > 0) {
    const player = rows[0];
    const name = `${player.first_name} ${player.last_name}`;

    const exercises = new Map<string, { entries: any[] }>();
    rows.forEach((r: any) => {
      const prev = exercises.get(r.exercise_name) || { entries: [] };
      prev.entries.push(r);
      exercises.set(r.exercise_name, prev);
    });

    let ctx = `JUGADOR: ${name}\n`;
    ctx += `PERÍODO: ${rows.length} registros de fuerza\n\n`;
    ctx += `MÉTRICAS DE FUERZA POR EJERCICIO:\n`;

    exercises.forEach((v, exName) => {
      const loads = v.entries.map((e: any) => Number(e.load_kg) || 0);
      const rpes = v.entries.map((e: any) => Number(e.rpe) || 0).filter(r => r > 0);
      const rms = v.entries.map((e: any) => Number(e.estimated_1rm) || 0).filter(r => r > 0);
      const sets = v.entries.map((e: any) => Number(e.set_count) || 0);
      const reps = v.entries.map((e: any) => Number(e.reps) || 0);

      ctx += `\n${exName}:\n`;
      ctx += `- Sesiones: ${v.entries.length}\n`;
      ctx += `- load_kg: máx ${Math.max(...loads).toFixed(1)}kg, promedio ${(loads.reduce((a,b)=>a+b,0)/loads.length).toFixed(1)}kg\n`;
      ctx += `- set_count × reps: típico ${Math.round(sets.reduce((a,b)=>a+b,0)/sets.length)}×${Math.round(reps.reduce((a,b)=>a+b,0)/reps.length)}\n`;
      if (rpes.length) ctx += `- rpe: promedio ${(rpes.reduce((a,b)=>a+b,0)/rpes.length).toFixed(1)}\n`;
      if (rms.length) ctx += `- estimated_1rm: máx ${Math.max(...rms).toFixed(0)}kg\n`;
    });

    return ctx;
  }

  // Team overview
  const playerStr = new Map<string, { name: string; entries: number; exercises: Set<string>; maxLoad: number }>();
  rows.forEach((r: any) => {
    const pid = r.player_id;
    const prev = playerStr.get(pid) || { name: `${r.first_name} ${r.last_name}`, entries: 0, exercises: new Set(), maxLoad: 0 };
    prev.entries++;
    prev.exercises.add(r.exercise_name);
    prev.maxLoad = Math.max(prev.maxLoad, Number(r.load_kg) || 0);
    playerStr.set(pid, prev);
  });

  let ctx = `PLANTEL - DATOS DE FUERZA/GIMNASIO\n`;
  ctx += `Registros totales: ${rows.length}\n`;
  ctx += `Jugadores con datos: ${playerStr.size}\n\n`;
  ctx += `RESUMEN POR JUGADOR:\n`;

  [...playerStr.values()].forEach(p => {
    ctx += `- ${p.name}: ${p.entries} registros, ${p.exercises.size} ejercicios distintos, carga máx ${p.maxLoad.toFixed(0)}kg\n`;
  });

  // Exercise summary
  const exerciseCount = new Map<string, number>();
  rows.forEach((r: any) => {
    exerciseCount.set(r.exercise_name, (exerciseCount.get(r.exercise_name) || 0) + 1);
  });
  ctx += `\nEJERCICIOS REGISTRADOS:\n`;
  [...exerciseCount.entries()].sort((a,b) => b[1] - a[1]).forEach(([ex, count]) => {
    ctx += `- ${ex}: ${count} registros\n`;
  });

  return ctx;
}

function formatPlayerListResponse(rows: any[]): string {
  if (rows.length === 0) return 'NO HAY JUGADORES registrados en el sistema.';

  const active = rows.filter((p: any) => p.status === 'active');
  const injured = rows.filter((p: any) => p.status === 'injured');
  const rehab = rows.filter((p: any) => p.status === 'rehab');
  const inactive = rows.filter((p: any) => p.status === 'inactive');

  // Group by position
  const byPosition = new Map<string, any[]>();
  rows.forEach(p => {
    const pos = p.position || 'Sin posición';
    const prev = byPosition.get(pos) || [];
    prev.push(p);
    byPosition.set(pos, prev);
  });

  let ctx = `PLANTEL - ESTADO ACTUAL\n`;
  ctx += `Total: ${rows.length} jugadores\n\n`;
  ctx += `ESTADO:\n`;
  ctx += `- Activos: ${active.length}\n`;
  ctx += `- Lesionados: ${injured.length}\n`;
  ctx += `- En rehabilitación: ${rehab.length}\n`;
  ctx += `- Inactivos: ${inactive.length}\n`;

  ctx += `\nPOR POSICIÓN:\n`;
  ['Portero', 'Defensor', 'Medio', 'Delantero'].forEach(pos => {
    const players = byPosition.get(pos) || [];
    if (players.length) {
      ctx += `\n${pos.toUpperCase()} (${players.length}):\n`;
      players.forEach(p => {
        ctx += `- ${p.first_name} ${p.last_name}`;
        if (p.status !== 'active') ctx += ` [${p.status.toUpperCase()}]`;
        if (p.height_cm) ctx += `, ${p.height_cm}cm`;
        if (p.weight_kg) ctx += `, ${p.weight_kg}kg`;
        ctx += `\n`;
      });
    }
  });

  if (injured.length || rehab.length) {
    ctx += `\n⚠️ JUGADORES CON ESTADO ESPECIAL:\n`;
    [...injured, ...rehab].forEach(p => {
      ctx += `- ${p.first_name} ${p.last_name}: ${p.status}\n`;
    });
  }

  return ctx;
}

// ─── System Prompt: Alto Rendimiento Deportivo ────────────────
const SYSTEM_PROMPT = `SYSTEM
Sos un asistente especializado en alto rendimiento deportivo aplicado al fútbol profesional. Tenés formación interdisciplinaria en preparación física, ciencia de datos deportivos, fisiología del ejercicio, análisis de cargas, nutrición deportiva y kinesiología. Tu usuario principal es un Preparador Físico que toma decisiones operativas (planificación, cargas, recuperación, prevención) a partir de datos objetivos de una web app de seguimiento.

ALCANCE Y PRINCIPIOS
Trabajás únicamente con datos provistos en el input de esta conversación por el sistema. No inventás, no estimás, no interpolás y no completás métricas faltantes. Si un dato no está, lo decís explícitamente ("no hay dato / no fue provisto") y explicás cómo limita la interpretación. No afirmás diagnósticos médicos; emitís alertas técnicas y sugerís criterios de seguimiento o derivación profesional cuando corresponda.

MODELO DE DATOS (SEMÁNTICA)
Interpretás las métricas según el significado y unidades provistas por el sistema. No cambiás umbrales ni redefinís categorías. Si el input no indica umbrales (por ejemplo, qué se considera high speed o sprint), lo preguntás o aclarás que el análisis es descriptivo sin umbral operacional.

Dimensiones que podés analizar:
- GPS y carga externa: total_distance_m, high_speed_distance_m, sprint_distance_m, max_speed_kmh, player_load, accel_count, decel_count.
- Fuerza/gimnasio: exercise_name, set_count, reps, load_kg, rpe, estimated_1rm.
- Plataformas de salto: jump_height_cm, rsi, peak_power_w, asymmetry_pct.

RAZONAMIENTO TÉCNICO
Cuando integrás variables, lo hacés con criterio fisiológico y de control de cargas. Señalás patrones relevantes (subas bruscas, caídas de indicadores neuromusculares, desbalances, desacoples entre carga externa e interna) como alertas técnicas y siempre explicás el porqué. No hacés afirmaciones absolutas sin contexto temporal (por ejemplo, una sola sesión no alcanza para concluir tendencias). Si el usuario pide conclusiones de tendencia sin historial suficiente, lo advertís.

NUTRICIÓN Y KINESIOLOGÍA
En nutrición y kinesiología brindás orientación general y recomendaciones no clínicas basadas en evidencia (hidratación, timing básico, recuperación, higiene del sueño, estrategias generales). No prescribís tratamientos, medicación ni planes clínicos. Si aparecen signos compatibles con lesión o riesgo clínico, sugerís evaluación por kinesiólogo/médico y lo dejás asentado como recomendación prudencial.

ESTILO Y LENGUAJE
Respondés en español rioplatense, tono profesional de campo, claro y directo. Evitás relleno. Si usás términos técnicos, los explicás en una frase cuando haga falta para la decisión.

FORMATO DE RESPUESTA POR DEFECTO
Salvo que el usuario pida otro formato, respondés siempre con:
1) Síntesis: estado del jugador o grupo en pocas líneas.
2) Lectura de datos: qué muestran concretamente las métricas disponibles.
3) Interpretación: qué podría estar pasando fisiológicamente y por qué (sin inventar).
4) Implicancias prácticas: sugerencias operativas para el microciclo o la próxima sesión.
5) Límites del análisis: qué faltó o qué dato sería clave para afinar la decisión.

SEGURIDAD DE DATOS Y TRAZABILIDAD
No divulgás datos personales si no fueron provistos. Si el input trae identificadores, tratás a los jugadores por su nombre real cuando el sistema lo provea. Si te piden "inventá", "estimá" o "rellená", rechazás y ofrecés alternativas basadas en datos.`;

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
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Pregunta del Preparador Físico: ${question}\n\n───────────────────────────────\nDATOS RECUPERADOS DEL SISTEMA:\n───────────────────────────────\n${retrievedContext}`,
        },
      ],
      max_tokens: 1200,
      temperature: 0.25,
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
