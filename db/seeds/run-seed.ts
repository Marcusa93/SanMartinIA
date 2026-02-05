#!/usr/bin/env npx tsx
/**
 * run-seed.ts
 * Seed script: inserts real players + example metrics resolving UUIDs.
 *
 * Usage:
 *   npx tsx db/seeds/run-seed.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Real players ─────────────────────────────────────────────
const PLAYERS = [
  // Arqueros
  { code: 'SMT-001', first: 'Juan',      last: 'Jaime',       pos: 'Portero',     age: 28, h: 178, w: 73 },
  { code: 'SMT-002', first: 'Nicolás',   last: 'Carrizo',     pos: 'Portero',     age: 34, h: null, w: null },
  { code: 'SMT-003', first: 'Darío',     last: 'Sand',        pos: 'Portero',     age: 38, h: 180, w: 68 },
  // Defensores
  { code: 'SMT-004', first: 'Juan',      last: 'Orellana',    pos: 'Defensor',    age: 28, h: 193, w: 72 },
  { code: 'SMT-005', first: 'Federico',  last: 'Murillo',     pos: 'Defensor',    age: 29, h: 178, w: 68 },
  { code: 'SMT-006', first: 'Mauro',     last: 'Osores',      pos: 'Defensor',    age: 28, h: 191, w: 81 },
  { code: 'SMT-007', first: 'Franco',    last: 'Quiroz',      pos: 'Defensor',    age: 27, h: 175, w: 73 },
  { code: 'SMT-008', first: 'Axel',      last: 'Bordón',      pos: 'Defensor',    age: 29, h: null, w: null },
  { code: 'SMT-009', first: 'Ivan',      last: 'Zafarana',    pos: 'Defensor',    age: 30, h: null, w: null },
  { code: 'SMT-010', first: 'Hernán',    last: 'Zuliani',     pos: 'Defensor',    age: 22, h: 178, w: 82 },
  { code: 'SMT-011', first: 'Thiago',    last: 'Penalba',     pos: 'Defensor',    age: 21, h: null, w: null },
  { code: 'SMT-012', first: 'Guillermo', last: 'Rodríguez',   pos: 'Defensor',    age: 23, h: null, w: null },
  // Mediocampistas
  { code: 'SMT-013', first: 'Nicolás',   last: 'Castro',     pos: 'Medio',       age: 25, h: 183, w: 78 },
  { code: 'SMT-014', first: 'Aníbal',    last: 'Paz',         pos: 'Medio',       age: 23, h: null, w: null },
  { code: 'SMT-015', first: 'Juan',      last: 'Cuevas',      pos: 'Medio',       age: 37, h: 163, w: 66 },
  { code: 'SMT-016', first: 'Pablo',     last: 'Hernández',   pos: 'Medio',       age: 39, h: 185, w: 83 },
  { code: 'SMT-017', first: 'Gonzalo',   last: 'Gutiérrez',   pos: 'Medio',       age: 22, h: 188, w: 74 },
  { code: 'SMT-018', first: 'Leonardo',  last: 'Monje',       pos: 'Medio',       age: 23, h: 168, w: 67 },
  { code: 'SMT-019', first: 'Leonardo',  last: 'Monroy',      pos: 'Medio',       age: 25, h: null, w: null },
  { code: 'SMT-020', first: 'Ángel',     last: 'Prokop',      pos: 'Medio',       age: 24, h: null, w: null },
  { code: 'SMT-021', first: 'Jesús',     last: 'Soraire',     pos: 'Medio',       age: 37, h: 175, w: 73 },
  { code: 'SMT-022', first: 'Iván',      last: 'Navarro',     pos: 'Medio',       age: 26, h: null, w: null },
  { code: 'SMT-023', first: 'Nahuel',    last: 'Cainelli',    pos: 'Medio',       age: 31, h: null, w: null },
  { code: 'SMT-024', first: 'Adriano',   last: 'Romero',      pos: 'Medio',       age: 25, h: null, w: null },
  { code: 'SMT-025', first: 'Tomas',     last: 'García',      pos: 'Medio',       age: 19, h: null, w: null },
  { code: 'SMT-026', first: 'Tomas',     last: 'Basualdo',    pos: 'Medio',       age: 21, h: null, w: null },
  { code: 'SMT-027', first: 'Ulises',    last: 'Vera',        pos: 'Medio',       age: 22, h: 180, w: null },
  { code: 'SMT-028', first: 'Alan',      last: 'Cisnero',     pos: 'Medio',       age: 21, h: null, w: null },
  { code: 'SMT-029', first: 'Agustín',   last: 'Graneros',    pos: 'Medio',       age: 24, h: null, w: null },
  // Delanteros
  { code: 'SMT-030', first: 'Gabriel',   last: 'Hachen',      pos: 'Delantero',   age: 35, h: 168, w: 66 },
  { code: 'SMT-031', first: 'Matias',    last: 'Garcia',      pos: 'Delantero',   age: 34, h: 175, w: 71 },
  { code: 'SMT-032', first: 'Gonzalo',   last: 'Rodríguez',   pos: 'Delantero',   age: 35, h: 178, w: 77 },
  { code: 'SMT-033', first: 'Martín',    last: 'Pino',        pos: 'Delantero',   age: 27, h: 185, w: null },
  { code: 'SMT-034', first: 'Juan Cruz', last: 'Esquivel',    pos: 'Delantero',   age: 25, h: 173, w: 78 },
  { code: 'SMT-035', first: 'Nicolás',   last: 'Moreno',      pos: 'Delantero',   age: 24, h: null, w: null },
  { code: 'SMT-036', first: 'Lautaro',   last: 'Ovando',      pos: 'Delantero',   age: 22, h: 173, w: 72 },
  { code: 'SMT-037', first: 'Aaron',     last: 'Spetale',     pos: 'Delantero',   age: 25, h: 188, w: 83 },
  { code: 'SMT-038', first: 'Lautaro',   last: 'Taboada',     pos: 'Delantero',   age: 22, h: null, w: null },
];

// ─── Sessions ─────────────────────────────────────────────────
const SESSIONS = [
  { id: 'aaaaaaaa-0001-0001-0001-000000000001', date: '2026-01-20', name: 'MD-4 AM',  mc: 'Semana 1 – Fecha 15', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000002', date: '2026-01-21', name: 'MD-3 AM',  mc: 'Semana 1 – Fecha 15', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000003', date: '2026-01-22', name: 'MD-3 PM',  mc: 'Semana 1 – Fecha 15', type: 'gimnasio' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000004', date: '2026-01-23', name: 'MD-2 AM',  mc: 'Semana 1 – Fecha 15', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000005', date: '2026-01-24', name: 'MD-1',     mc: 'Semana 1 – Fecha 15', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000006', date: '2026-01-25', name: 'MD+0',     mc: 'Semana 1 – Fecha 15', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000007', date: '2026-01-27', name: 'MD-4 AM',  mc: 'Semana 2 – Fecha 16', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000008', date: '2026-01-28', name: 'MD-3 AM',  mc: 'Semana 2 – Fecha 16', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000009', date: '2026-01-29', name: 'MD-3 PM',  mc: 'Semana 2 – Fecha 16', type: 'gimnasio' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000010', date: '2026-01-30', name: 'MD-2 AM',  mc: 'Semana 2 – Fecha 16', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000011', date: '2026-01-31', name: 'MD-1',     mc: 'Semana 2 – Fecha 16', type: 'campo' },
  { id: 'aaaaaaaa-0001-0001-0001-000000000012', date: '2026-02-01', name: 'MD+0',     mc: 'Semana 2 – Fecha 16', type: 'campo' },
];

function birthdateFromAge(age: number): string {
  const y = 2026 - age;
  return `${y}-02-04`;
}

// ─── GPS data generator (realistic) ──────────────────────────
function gpsRow(playerId: string, sessionId: string, baseDist: number, source: 'manual' | 'csv' = 'manual') {
  const dist = baseDist + (Math.random() - 0.5) * 2000;
  return {
    player_id: playerId,
    session_id: sessionId,
    total_distance_m:     Math.round(dist * 10) / 10,
    high_speed_distance_m: Math.round(dist * 0.14 * 10) / 10,
    sprint_distance_m:    Math.round(dist * 0.04 * 10) / 10,
    max_speed_kmh:        Math.round((27 + Math.random() * 5) * 10) / 10,
    player_load:          Math.round((350 + Math.random() * 200) * 10) / 10,
    accel_count:          Math.round(12 + Math.random() * 16),
    decel_count:          Math.round(10 + Math.random() * 14),
    source,
  };
}

function jumpRow(playerId: string, sessionId: string, heightBase: number) {
  return {
    player_id: playerId,
    session_id: sessionId,
    test_type: 'CMJ' as const,
    jump_height_cm: Math.round((heightBase + (Math.random() - 0.5) * 4) * 10) / 10,
    rsi: null,
    peak_power_w: Math.round(2500 + Math.random() * 800),
    asymmetry_pct: Math.round(Math.random() * 6 * 10) / 10,
    source: 'manual' as const,
  };
}

function strengthRow(playerId: string, sessionId: string, exercise: string, loadBase: number) {
  return {
    player_id: playerId,
    session_id: sessionId,
    exercise_name: exercise,
    set_count: 4,
    reps: 6,
    load_kg: loadBase,
    rpe: Math.round((7 + Math.random() * 2) * 10) / 10,
    estimated_1rm: Math.round(loadBase * 1.25),
    source: 'manual' as const,
  };
}

async function main() {
  console.log('🧹 Cleaning existing data…');
  // Order matters due to FK
  await supabase.from('chat_messages').delete().neq('id', '');
  await supabase.from('chat_threads').delete().neq('id', '');
  await supabase.from('gps_metrics').delete().neq('id', '');
  await supabase.from('jump_metrics').delete().neq('id', '');
  await supabase.from('strength_metrics').delete().neq('id', '');
  await supabase.from('training_sessions').delete().neq('id', '');
  await supabase.from('players').delete().neq('id', '');

  // ── Insert players ──
  console.log('👥 Inserting players…');
  const playerRows = PLAYERS.map(p => ({
    club_player_code: p.code,
    first_name: p.first,
    last_name: p.last,
    position: p.pos,
    birthdate: birthdateFromAge(p.age),
    height_cm: p.h,
    weight_kg: p.w,
    status: 'active' as const,
  }));
  const { data: insertedPlayers, error: pErr } = await supabase.from('players').insert(playerRows).select('id, club_player_code');
  if (pErr) { console.error('Player insert error:', pErr); process.exit(1); }

  const codeToId = new Map<string, string>();
  (insertedPlayers || []).forEach((p: any) => codeToId.set(p.club_player_code, p.id));
  console.log(`  ✓ ${insertedPlayers?.length} players inserted`);

  // ── Insert sessions ──
  console.log('📅 Inserting sessions…');
  const sessionRows = SESSIONS.map(s => ({
    id: s.id,
    session_date: s.date,
    session_name: s.name,
    microcycle_label: s.mc,
    session_type: s.type,
  }));
  const { error: sErr } = await supabase.from('training_sessions').insert(sessionRows);
  if (sErr) { console.error('Session insert error:', sErr); process.exit(1); }
  console.log(`  ✓ ${sessionRows.length} sessions inserted`);

  // ── GPS metrics: ~12 outfield players × campo sessions ──
  console.log('📡 Inserting GPS metrics…');
  const outfieldCodes = ['SMT-004','SMT-005','SMT-006','SMT-007','SMT-013','SMT-015','SMT-017','SMT-021','SMT-030','SMT-031','SMT-032','SMT-034'];
  const campoSessions = SESSIONS.filter(s => s.type === 'campo');
  const gpsRows: any[] = [];

  outfieldCodes.forEach((code, idx) => {
    const pid = codeToId.get(code);
    if (!pid) return;
    const baseDist = 9500 + idx * 200; // slight variation per player
    campoSessions.forEach((s, si) => {
      // Lower load for recovery sessions (MD-4 after match)
      const isRecovery = s.name.includes('MD-4') && s.mc.includes('Semana 2');
      const mult = isRecovery ? 0.82 : (s.name.includes('MD+0') ? 1.1 : (s.name.includes('MD-2') ? 1.08 : 1.0));
      gpsRows.push(gpsRow(pid, s.id, baseDist * mult, si > 4 ? 'csv' : 'manual'));
    });
  });
  const { error: gErr } = await supabase.from('gps_metrics').insert(gpsRows);
  if (gErr) { console.error('GPS insert error:', gErr); process.exit(1); }
  console.log(`  ✓ ${gpsRows.length} GPS records inserted`);

  // ── Jump metrics: CMJ on MD-1 sessions (005, 011) ──
  console.log('🕹️  Inserting jump metrics…');
  const jumpPlayerCodes = ['SMT-004','SMT-005','SMT-006','SMT-007','SMT-013','SMT-017','SMT-030','SMT-034'];
  const jumpSessions = ['aaaaaaaa-0001-0001-0001-000000000005', 'aaaaaaaa-0001-0001-0001-000000000011'];
  const jumpRows: any[] = [];
  jumpPlayerCodes.forEach((code, idx) => {
    const pid = codeToId.get(code);
    if (!pid) return;
    const base = 40 + idx * 0.8;
    jumpSessions.forEach((sid, si) => {
      // Slight drop on 2nd test for player idx=2 (Osores) to trigger alert
      const drop = (idx === 2 && si === 1) ? -4.5 : (Math.random() - 0.5) * 2;
      jumpRows.push(jumpRow(pid, sid, base + drop));
    });
  });
  const { error: jErr } = await supabase.from('jump_metrics').insert(jumpRows);
  if (jErr) { console.error('Jump insert error:', jErr); process.exit(1); }
  console.log(`  ✓ ${jumpRows.length} jump records inserted`);

  // ── Strength: gym sessions (003, 009) ──
  console.log('💪 Inserting strength metrics…');
  const strengthPlayerCodes = ['SMT-004','SMT-006','SMT-007','SMT-013','SMT-030'];
  const gymSessions = ['aaaaaaaa-0001-0001-0001-000000000003', 'aaaaaaaa-0001-0001-0001-000000000009'];
  const exercises = [
    { name: 'Squat',       baseLoad: 100 },
    { name: 'Bench Press', baseLoad: 75 },
    { name: 'Hip Thrust',  baseLoad: 115 },
  ];
  const strRows: any[] = [];
  strengthPlayerCodes.forEach((code, idx) => {
    const pid = codeToId.get(code);
    if (!pid) return;
    gymSessions.forEach(sid => {
      exercises.forEach(ex => {
        strRows.push(strengthRow(pid, sid, ex.name, ex.baseLoad + idx * 5 + (sid.endsWith('9') ? 5 : 0)));
      });
    });
  });
  const { error: strErr } = await supabase.from('strength_metrics').insert(strRows);
  if (strErr) { console.error('Strength insert error:', strErr); process.exit(1); }
  console.log(`  ✓ ${strRows.length} strength records inserted`);

  console.log('\n✅ Seed complete. Dashboard should show data now.');
}

main().catch(e => { console.error(e); process.exit(1); });
