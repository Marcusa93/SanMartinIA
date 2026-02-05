-- ============================================================
-- SEED: Jugadores reales del plantel de San Martín de Tucumán
-- Datos proporcionados por el club.
-- Ejecutar DESPUÉS de migrations 001 + 002.
-- Si ya existen filas ficticias (seed.sql), hacen TRUNCATE primero:
--   TRUNCATE public.players CASCADE;
-- ============================================================

-- Edad → birthdate aproximada (base: 2026-02-04)
-- Altura: se convierte de m a cm. Peso en kg.
-- Campos opcionales quedan NULL cuando no se proporcionó dato.

INSERT INTO public.players
  (club_player_code, first_name, last_name, position, birthdate, height_cm, weight_kg, status)
VALUES
-- ──────── ARQUEROS ──────────────────────────────────────────
  ('SMT-001', 'Juan',     'Jaime',          'Portero',      '1998-02-04', 178.0, 73.0, 'active'),
  ('SMT-002', 'Nicolás',  'Carrizo',        'Portero',      '1992-02-04', NULL,  NULL,  'active'),
  ('SMT-003', 'Darío',    'Sand',           'Portero',      '1988-02-04', 180.0, 68.0, 'active'),

-- ──────── DEFENSORES ────────────────────────────────────────
  ('SMT-004', 'Juan',     'Orellana',       'Defensor',     '1998-02-04', 193.0, 72.0, 'active'),
  ('SMT-005', 'Federico', 'Murillo',        'Defensor',     '1997-02-04', 178.0, 68.0, 'active'),
  ('SMT-006', 'Mauro',    'Osores',         'Defensor',     '1998-02-04', 191.0, 81.0, 'active'),
  ('SMT-007', 'Franco',   'Quiroz',         'Defensor',     '1999-02-04', 175.0, 73.0, 'active'),
  ('SMT-008', 'Axel',     'Bordón',         'Defensor',     '1997-02-04', NULL,  NULL,  'active'),
  ('SMT-009', 'Ivan',     'Zafarana',       'Defensor',     '1996-02-04', NULL,  NULL,  'active'),
  ('SMT-010', 'Hernán',   'Zuliani',        'Defensor',     '2004-02-04', 178.0, 82.0, 'active'),
  ('SMT-011', 'Thiago',   'Penalba',        'Defensor',     '2005-02-04', NULL,  NULL,  'active'),
  ('SMT-012', 'Guillermo','Rodríguez',      'Defensor',     '2003-02-04', NULL,  NULL,  'active'),

-- ──────── MEDIOCAMPISTAS ────────────────────────────────────
  ('SMT-013', 'Nicolás',  'Castro',        'Medio',        '2001-02-04', 183.0, 78.0, 'active'),
  ('SMT-014', 'Aníbal',   'Paz',            'Medio',        '2003-02-04', NULL,  NULL,  'active'),
  ('SMT-015', 'Juan',     'Cuevas',         'Medio',        '1989-02-04', 163.0, 66.0, 'active'),
  ('SMT-016', 'Pablo',    'Hernández',      'Medio',        '1987-02-04', 185.0, 83.0, 'active'),
  ('SMT-017', 'Gonzalo',  'Gutiérrez',      'Medio',        '2004-02-04', 188.0, 74.0, 'active'),
  ('SMT-018', 'Leonardo', 'Monje',          'Medio',        '2003-02-04', 168.0, 67.0, 'active'),
  ('SMT-019', 'Leonardo', 'Monroy',         'Medio',        '2001-02-04', NULL,  NULL,  'active'),
  ('SMT-020', 'Ángel',    'Prokop',         'Medio',        '2002-02-04', NULL,  NULL,  'active'),
  ('SMT-021', 'Jesús',    'Soraire',        'Medio',        '1989-02-04', 175.0, 73.0, 'active'),
  ('SMT-022', 'Iván',     'Navarro',        'Medio',        '2000-02-04', NULL,  NULL,  'active'),
  ('SMT-023', 'Nahuel',   'Cainelli',       'Medio',        '1995-02-04', NULL,  NULL,  'active'),
  ('SMT-024', 'Adriano',  'Romero',         'Medio',        '2001-02-04', NULL,  NULL,  'active'),
  ('SMT-025', 'Tomas',    'García',         'Medio',        '2007-02-04', NULL,  NULL,  'active'),
  ('SMT-026', 'Tomas',    'Basualdo',       'Medio',        '2005-02-04', NULL,  NULL,  'active'),
  ('SMT-027', 'Ulises',   'Vera',           'Medio',        '2004-02-04', 180.0, NULL,  'active'),
  ('SMT-028', 'Alan',     'Cisnero',        'Medio',        '2005-02-04', NULL,  NULL,  'active'),
  ('SMT-029', 'Agustín',  'Graneros',       'Medio',        '2002-02-04', NULL,  NULL,  'active'),

-- ──────── DELANTEROS ────────────────────────────────────────
  ('SMT-030', 'Gabriel',  'Hachen',         'Delantero',    '1991-02-04', 168.0, 66.0, 'active'),
  ('SMT-031', 'Matias',   'Garcia',         'Delantero',    '1992-02-04', 175.0, 71.0, 'active'),  -- "Matias Ariel Garcia"
  ('SMT-032', 'Gonzalo',  'Rodríguez',      'Delantero',    '1991-02-04', 178.0, 77.0, 'active'),
  ('SMT-033', 'Martín',   'Pino',           'Delantero',    '1999-02-04', 185.0, NULL,  'active'),
  ('SMT-034', 'Juan Cruz','Esquivel',       'Delantero',    '2001-02-04', 173.0, 78.0, 'active'),
  ('SMT-035', 'Nicolás',  'Moreno',         'Delantero',    '2002-02-04', NULL,  NULL,  'active'),
  ('SMT-036', 'Lautaro',  'Ovando',         'Delantero',    '2004-02-04', 173.0, 72.0, 'active'),
  ('SMT-037', 'Aaron',    'Spetale',        'Delantero',    '2001-02-04', 188.0, 83.0, 'active'),
  ('SMT-038', 'Lautaro',  'Taboada',        'Delantero',    '2004-02-04', NULL,  NULL,  'active');

-- ─── TRAINING SESSIONS (ejemplo: 2 semanas recientes) ───────
-- Usamos fechas cercanas al presente para que el dashboard "luce" con datos.

INSERT INTO public.training_sessions (id, session_date, session_name, microcycle_label, session_type, notes)
VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', '2026-01-20', 'MD-4 AM',  'Semana 1 – Fecha 15', 'campo',         'Activación + posesión'),
  ('aaaaaaaa-0001-0001-0001-000000000002', '2026-01-21', 'MD-3 AM',  'Semana 1 – Fecha 15', 'campo',         'Patrón de juego'),
  ('aaaaaaaa-0001-0001-0001-000000000003', '2026-01-22', 'MD-3 PM',  'Semana 1 – Fecha 15', 'gimnasio',      'Fuerza tren inferior'),
  ('aaaaaaaa-0001-0001-0001-000000000004', '2026-01-23', 'MD-2 AM',  'Semana 1 – Fecha 15', 'campo',         'Alta intensidad'),
  ('aaaaaaaa-0001-0001-0001-000000000005', '2026-01-24', 'MD-1',     'Semana 1 – Fecha 15', 'campo',         'Revisión + tests saltos'),
  ('aaaaaaaa-0001-0001-0001-000000000006', '2026-01-25', 'MD+0',     'Semana 1 – Fecha 15', 'campo',         'Partido – Fecha 15'),
  ('aaaaaaaa-0001-0001-0001-000000000007', '2026-01-27', 'MD-4 AM',  'Semana 2 – Fecha 16', 'campo',         'Recuperación activa'),
  ('aaaaaaaa-0001-0001-0001-000000000008', '2026-01-28', 'MD-3 AM',  'Semana 2 – Fecha 16', 'campo',         'Transiciones'),
  ('aaaaaaaa-0001-0001-0001-000000000009', '2026-01-29', 'MD-3 PM',  'Semana 2 – Fecha 16', 'gimnasio',      'Potencia'),
  ('aaaaaaaa-0001-0001-0001-000000000010', '2026-01-30', 'MD-2 AM',  'Semana 2 – Fecha 16', 'campo',         'Velocidad + reactividad'),
  ('aaaaaaaa-0001-0001-0001-000000000011', '2026-01-31', 'MD-1',     'Semana 2 – Fecha 16', 'campo',         'Tests CMJ + revisión'),
  ('aaaaaaaa-0001-0001-0001-000000000012', '2026-02-01', 'MD+0',     'Semana 2 – Fecha 16', 'campo',         'Partido – Fecha 16');

-- ─── GPS METRICS (ejemplo con jugadores reales) ─────────────
-- Usamos los UUIDs que Supabase generará para los players. Como no los conocemos,
-- el seed de métricas debe ejecutarse con un script que resuelva los IDs por club_player_code.
-- Para demo inmediata, dejamos un EJEMPLO con subquery:

INSERT INTO public.gps_metrics (player_id, session_id, total_distance_m, high_speed_distance_m, sprint_distance_m, max_speed_kmh, player_load, accel_count, decel_count, source)
SELECT
  p.id,
  's'::text::uuid,  -- placeholder; se reemplaza abajo
  9800, 1200, 320, 28.4, 420, 18, 15, 'manual'
FROM public.players p
WHERE p.club_player_code = 'SMT-004'
LIMIT 0;  -- Deshabilitado: usar script run-seed.ts que resuelve IDs

-- ============================================================
-- NOTA: Las métricas de ejemplo con IDs reales se insertan
-- mediante el script TypeScript: db/seeds/run-seed.ts
-- que resuelve club_player_code → uuid antes de insertar.
-- ============================================================
