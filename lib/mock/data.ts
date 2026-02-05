/**
 * lib/mock/data.ts
 * Static mock data that mirrors the real schema.
 * Used when MOCK_MODE cookie is set — no Supabase calls needed.
 */

// ─── Players (subset of real roster) ─────────────────────────────────────────
export const MOCK_PLAYERS = [
  { id: 'mp-001', club_player_code: 'SMT-001', first_name: 'Juan',      last_name: 'Jaime',       position: 'Portero',    birthdate: '1998-02-04', height_cm: 178, weight_kg: 73,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-004', club_player_code: 'SMT-004', first_name: 'Juan',      last_name: 'Orellana',    position: 'Defensor',  birthdate: '1998-02-04', height_cm: 193, weight_kg: 72,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-005', club_player_code: 'SMT-005', first_name: 'Federico', last_name: 'Murillo',     position: 'Defensor',  birthdate: '1997-02-04', height_cm: 178, weight_kg: 68,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-006', club_player_code: 'SMT-006', first_name: 'Mauro',     last_name: 'Osores',      position: 'Defensor',  birthdate: '1998-02-04', height_cm: 191, weight_kg: 81,  status: 'injured',  avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-007', club_player_code: 'SMT-007', first_name: 'Franco',    last_name: 'Quiroz',      position: 'Defensor',  birthdate: '1999-02-04', height_cm: 175, weight_kg: 73,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-010', club_player_code: 'SMT-010', first_name: 'Hernán',    last_name: 'Zuliani',     position: 'Defensor',  birthdate: '2004-02-04', height_cm: 178, weight_kg: 82,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-013', club_player_code: 'SMT-013', first_name: 'Nicolás',   last_name: 'Castro',     position: 'Medio',     birthdate: '2001-02-04', height_cm: 183, weight_kg: 78,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-015', club_player_code: 'SMT-015', first_name: 'Juan',      last_name: 'Cuevas',      position: 'Medio',     birthdate: '1989-02-04', height_cm: 163, weight_kg: 66,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-017', club_player_code: 'SMT-017', first_name: 'Gonzalo',   last_name: 'Gutiérrez',   position: 'Medio',     birthdate: '2004-02-04', height_cm: 188, weight_kg: 74,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-021', club_player_code: 'SMT-021', first_name: 'Jesús',     last_name: 'Soraire',     position: 'Medio',     birthdate: '1989-02-04', height_cm: 175, weight_kg: 73,  status: 'rehab',    avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-030', club_player_code: 'SMT-030', first_name: 'Gabriel',   last_name: 'Hachen',      position: 'Delantero', birthdate: '1991-02-04', height_cm: 168, weight_kg: 66,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-031', club_player_code: 'SMT-031', first_name: 'Matias',    last_name: 'Garcia',      position: 'Delantero', birthdate: '1992-02-04', height_cm: 175, weight_kg: 71,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-032', club_player_code: 'SMT-032', first_name: 'Gonzalo',   last_name: 'Rodríguez',   position: 'Delantero', birthdate: '1991-02-04', height_cm: 178, weight_kg: 77,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-034', club_player_code: 'SMT-034', first_name: 'Juan Cruz', last_name: 'Esquivel',    position: 'Delantero', birthdate: '2001-02-04', height_cm: 173, weight_kg: 78,  status: 'active',   avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mp-037', club_player_code: 'SMT-037', first_name: 'Aaron',     last_name: 'Spetale',     position: 'Delantero', birthdate: '2001-02-04', height_cm: 188, weight_kg: 83,  status: 'inactive', avatar_url: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
];

// ─── Training sessions ───────────────────────────────────────────────────────
export const MOCK_SESSIONS = [
  { id: 'ms-01', session_date: '2026-01-20', session_name: 'MD-4 AM',  microcycle_label: 'Semana 1 – Fecha 15', session_type: 'campo',    notes: null, created_at: '2026-01-20T09:00:00Z', created_by: null },
  { id: 'ms-02', session_date: '2026-01-21', session_name: 'MD-3 AM',  microcycle_label: 'Semana 1 – Fecha 15', session_type: 'campo',    notes: 'Trabajo de posesión', created_at: '2026-01-21T09:00:00Z', created_by: null },
  { id: 'ms-03', session_date: '2026-01-22', session_name: 'MD-3 PM',  microcycle_label: 'Semana 1 – Fecha 15', session_type: 'gimnasio', notes: null, created_at: '2026-01-22T16:00:00Z', created_by: null },
  { id: 'ms-04', session_date: '2026-01-23', session_name: 'MD-2 AM',  microcycle_label: 'Semana 1 – Fecha 15', session_type: 'campo',    notes: 'Estrategias de partido', created_at: '2026-01-23T09:00:00Z', created_by: null },
  { id: 'ms-05', session_date: '2026-01-24', session_name: 'MD-1',     microcycle_label: 'Semana 1 – Fecha 15', session_type: 'campo',    notes: 'Activación', created_at: '2026-01-24T10:00:00Z', created_by: null },
  { id: 'ms-06', session_date: '2026-01-25', session_name: 'MD+0',     microcycle_label: 'Semana 1 – Fecha 15', session_type: 'campo',    notes: 'Partido vs Tucumán', created_at: '2026-01-25T16:00:00Z', created_by: null },
  { id: 'ms-07', session_date: '2026-01-27', session_name: 'MD-4 AM',  microcycle_label: 'Semana 2 – Fecha 16', session_type: 'campo',    notes: 'Recuperación activa', created_at: '2026-01-27T09:00:00Z', created_by: null },
  { id: 'ms-08', session_date: '2026-01-28', session_name: 'MD-3 AM',  microcycle_label: 'Semana 2 – Fecha 16', session_type: 'campo',    notes: null, created_at: '2026-01-28T09:00:00Z', created_by: null },
  { id: 'ms-09', session_date: '2026-01-29', session_name: 'MD-3 PM',  microcycle_label: 'Semana 2 – Fecha 16', session_type: 'gimnasio', notes: null, created_at: '2026-01-29T16:00:00Z', created_by: null },
  { id: 'ms-10', session_date: '2026-01-30', session_name: 'MD-2 AM',  microcycle_label: 'Semana 2 – Fecha 16', session_type: 'campo',    notes: null, created_at: '2026-01-30T09:00:00Z', created_by: null },
  { id: 'ms-11', session_date: '2026-01-31', session_name: 'MD-1',     microcycle_label: 'Semana 2 – Fecha 16', session_type: 'campo',    notes: 'Activación', created_at: '2026-01-31T10:00:00Z', created_by: null },
  { id: 'ms-12', session_date: '2026-02-01', session_name: 'MD+0',     microcycle_label: 'Semana 2 – Fecha 16', session_type: 'campo',    notes: 'Partido vs Boca Unidos', created_at: '2026-02-01T16:00:00Z', created_by: null },
];

// ─── GPS metrics ──────────────────────────────────────────────────────────────
// 12 outfield players × 10 campo sessions = 120 rows
const OUTFIELD_IDS = ['mp-004','mp-005','mp-006','mp-007','mp-013','mp-015','mp-017','mp-021','mp-030','mp-031','mp-032','mp-034'];
const CAMPO_SESSIONS = ['ms-01','ms-02','ms-04','ms-05','ms-06','ms-07','ms-08','ms-10','ms-11','ms-12'];

function seeded(seed: number): number {
  // Simple deterministic pseudo-random based on seed
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const MOCK_GPS: any[] = (() => {
  const rows: any[] = [];
  let idx = 0;
  OUTFIELD_IDS.forEach((pid, pi) => {
    const baseDist = 9500 + pi * 200;
    CAMPO_SESSIONS.forEach((sid, si) => {
      idx++;
      const session = MOCK_SESSIONS.find(s => s.id === sid)!;
      // Week 2 recovery (ms-07) has lower load
      const isRecovery = sid === 'ms-07';
      const isMatch    = sid === 'ms-06' || sid === 'ms-12';
      const mult = isRecovery ? 0.78 : isMatch ? 1.12 : 1.0;
      const noise = (seeded(idx) - 0.5) * 1600;
      const dist  = Math.round((baseDist * mult + noise) * 10) / 10;
      rows.push({
        id:                    `gps-${String(idx).padStart(3,'0')}`,
        player_id:             pid,
        session_id:            sid,
        total_distance_m:      dist,
        high_speed_distance_m: Math.round(dist * 0.14 * 10) / 10,
        sprint_distance_m:     Math.round(dist * 0.04 * 10) / 10,
        max_speed_kmh:         Math.round((27 + seeded(idx + 500) * 5) * 10) / 10,
        player_load:           Math.round((350 + seeded(idx + 1000) * 200) * 10) / 10,
        accel_count:           Math.round(12 + seeded(idx + 1500) * 16),
        decel_count:           Math.round(10 + seeded(idx + 2000) * 14),
        source:                si > 4 ? 'csv' : 'manual',
        import_batch_id:       null,
        created_by:            null,
        created_at:            session.session_date + 'T' + (isMatch ? '18' : '10') + ':30:00Z',
        // embed player & session for joined queries
        players:               { first_name: MOCK_PLAYERS.find(p => p.id === pid)?.first_name, last_name: MOCK_PLAYERS.find(p => p.id === pid)?.last_name },
        training_sessions:     { session_date: session.session_date, session_name: session.session_name },
      });
    });
  });
  return rows;
})();

// ─── Jump metrics (CMJ on MD-1 sessions: ms-05, ms-11) ─────────────────────
const JUMP_PLAYER_IDS = ['mp-004','mp-005','mp-006','mp-007','mp-013','mp-017','mp-030','mp-034'];
const JUMP_SESSIONS   = ['ms-05', 'ms-11'];

export const MOCK_JUMPS: any[] = (() => {
  const rows: any[] = [];
  let idx = 0;
  JUMP_PLAYER_IDS.forEach((pid, pi) => {
    const base = 40 + pi * 0.8;
    JUMP_SESSIONS.forEach((sid, si) => {
      idx++;
      const session = MOCK_SESSIONS.find(s => s.id === sid)!;
      // Osores (mp-006, pi=2) drops 11% on second test → triggers alert
      const drop = (pi === 2 && si === 1) ? -4.8 : (seeded(idx + 3000) - 0.5) * 2;
      rows.push({
        id:             `jmp-${String(idx).padStart(2,'0')}`,
        player_id:      pid,
        session_id:     sid,
        test_type:      'CMJ',
        jump_height_cm: Math.round((base + drop) * 10) / 10,
        rsi:            null,
        peak_power_w:   Math.round(2500 + seeded(idx + 4000) * 800),
        asymmetry_pct:  Math.round(seeded(idx + 5000) * 6 * 10) / 10,
        source:         'manual',
        import_batch_id: null,
        created_by:     null,
        created_at:     session.session_date + 'T11:00:00Z',
        players:        { first_name: MOCK_PLAYERS.find(p => p.id === pid)?.first_name, last_name: MOCK_PLAYERS.find(p => p.id === pid)?.last_name },
      });
    });
  });
  return rows;
})();

// ─── Strength metrics (gym sessions: ms-03, ms-09) ──────────────────────────
const STR_PLAYER_IDS = ['mp-004','mp-006','mp-007','mp-013','mp-030'];
const STR_SESSIONS   = ['ms-03', 'ms-09'];
const EXERCISES      = [
  { name: 'Squat',       baseLoad: 100 },
  { name: 'Bench Press', baseLoad: 75  },
  { name: 'Hip Thrust',  baseLoad: 115 },
];

export const MOCK_STRENGTH: any[] = (() => {
  const rows: any[] = [];
  let idx = 0;
  STR_PLAYER_IDS.forEach((pid, pi) => {
    STR_SESSIONS.forEach((sid, si) => {
      const session = MOCK_SESSIONS.find(s => s.id === sid)!;
      EXERCISES.forEach(ex => {
        idx++;
        const load = ex.baseLoad + pi * 5 + (si === 1 ? 5 : 0);
        rows.push({
          id:             `str-${String(idx).padStart(2,'0')}`,
          player_id:      pid,
          session_id:     sid,
          exercise_name:  ex.name,
          set_count:      4,
          reps:           6,
          load_kg:        load,
          rpe:            Math.round((7 + seeded(idx + 6000) * 2) * 10) / 10,
          estimated_1rm:  Math.round(load * 1.25),
          source:         'manual',
          import_batch_id: null,
          created_by:     null,
          created_at:     session.session_date + 'T17:00:00Z',
        });
      });
    });
  });
  return rows;
})();

// ─── User profiles (mock admin panel) ────────────────────────────────────────
export const MOCK_USERS = [
  { user_id: 'mock-user-001', full_name: 'Administrador',   role: 'superadmin',  active: true,  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { user_id: 'mock-user-002', full_name: 'Carlos Méndez',   role: 'admin_pf',    active: true,  created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
  { user_id: 'mock-user-003', full_name: 'Laura Fernández', role: 'admin_staff', active: true,  created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
  { user_id: 'mock-user-004', full_name: 'Pedro Díaz',      role: 'viewer',      active: true,  created_at: '2026-01-03T00:00:00Z', updated_at: '2026-01-03T00:00:00Z' },
  { user_id: 'mock-user-005', full_name: 'Ana Solari',      role: 'viewer',      active: false, created_at: '2026-01-03T00:00:00Z', updated_at: '2026-01-03T00:00:00Z' },
];

// ─── The "current" mock session profile (superadmin) ─────────────────────────
export const MOCK_PROFILE = MOCK_USERS[0];

// ─── Chat: deterministic canned responses keyed by keyword patterns ──────────
export const MOCK_CHAT_RESPONSES: { pattern: RegExp; content: string; citations: string[] }[] = [
  {
    pattern: /carga|gps|distancia|load/i,
    content: `📡 **Carga externa — últimas 14 sesiones**\n\n- Promedio distancia plantel: **10 247 m**\n- Sesión más exigente: MD+0 Fecha 16 (11 820 m promedio)\n- Sesión de menor carga: MD-4 Semana 2 — recuperación activa (7 920 m)\n\n⚠️ Se detectó un aumento de carga >30% en la transición Semana 1 → Semana 2 para varios jugadores. Revisar plan de carga.`,
    citations: ['gps_metrics (últimas 14 sesiones)', 'training_sessions'],
  },
  {
    pattern: /cmj|salto|jump/i,
    content: `🕹️ **Datos de CMJ — período 14d**\n\n| Jugador | MD-1 (Sem 1) | MD-1 (Sem 2) | Δ% |\n|---|---|---|---|\n| Orellana | 40.2 cm | 39.8 cm | -1.0% |\n| Murillo | 41.0 cm | 41.3 cm | +0.7% |\n| **Osores** | **41.8 cm** | **37.0 cm** | **-11.5%** ⚠️ |\n| Quiroz | 42.6 cm | 42.2 cm | -0.9% |\n\n📉 Osores presenta caída de CMJ >10%. Recomendado: revisión de carga y estado físico.`,
    citations: ['jump_metrics (CMJ, últimas 14d)', 'players'],
  },
  {
    pattern: /fuerza|strength|squat|bench|hip/i,
    content: `💪 **Fuerza — resumen gimnasio (últimas 2 sesiones)**\n\n- **Squat**: 1RM estimado promedio 131 kg (rango 125–145 kg)\n- **Bench Press**: 1RM estimado promedio 103 kg\n- **Hip Thrust**: 1RM estimado promedio 156 kg\n\nTodos los atletas completaron 4×6 con RPE entre 7.2 y 8.8.`,
    citations: ['strength_metrics (sesiones ms-03, ms-09)'],
  },
  {
    pattern: /plantel|equipo|estado|resumen|summary/i,
    content: `👥 **Resumen del plantel**\n\n- **Activos**: 12\n- **Lesionados**: 1 (Osores — en revisión)\n- **Rehabilitación**: 1 (Soraire)\n- **Inactivos**: 1 (Spetale)\n\n📊 15 jugadores registrados en total. Última sesión registrada: MD+0 Fecha 16 (02/02).`,
    citations: ['players', 'training_sessions'],
  },
  {
    pattern: /velocidad|speed|max.speed/i,
    content: `🏃 **Velocidad máxima — últimas 14 sesiones**\n\n- Promedio plantel: **29.4 km/h**\n- Máximo individual: Gutiérrez con **31.2 km/h** (MD+0 Fecha 16)\n- Mínimo de período: Cuevas con **27.8 km/h** (MD-4 Semana 2 — recuperación)`,
    citations: ['gps_metrics.max_speed_kmh (últimas 14d)'],
  },
];

export function getMockChatResponse(question: string): { content: string; citations: string[] } {
  for (const entry of MOCK_CHAT_RESPONSES) {
    if (entry.pattern.test(question)) return { content: entry.content, citations: entry.citations };
  }
  return {
    content: `🤖 No encontré datos específicos para esa consulta en el sistema.\n\nPodés preguntar sobre:\n- Carga externa / GPS\n- Saltos CMJ\n- Fuerza (squat, bench, hip thrust)\n- Estado del plantel`,
    citations: [],
  };
}
