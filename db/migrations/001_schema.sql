-- ============================================================
-- MIGRATION 001: Core schema for San Martín Performance Lab MVP
-- ============================================================
-- Run against Supabase project (Studio > SQL Editor or CLI)
-- ============================================================

-- ─── ENUMS ────────────────────────────────────────────────────
CREATE TYPE player_status AS ENUM ('active', 'injured', 'rehab', 'inactive');
CREATE TYPE user_role    AS ENUM ('superadmin', 'company_dev', 'admin_pf', 'admin_staff', 'viewer');
CREATE TYPE scope_type   AS ENUM ('player', 'group', 'metric_family');
CREATE TYPE metric_family AS ENUM ('gps', 'strength', 'jumps');
CREATE TYPE jump_test_type AS ENUM ('CMJ', 'SJ', 'DJ', 'other');
CREATE TYPE chat_role    AS ENUM ('user', 'assistant', 'system');
CREATE TYPE data_source  AS ENUM ('manual', 'csv', 'api');

-- ─── PLAYERS ──────────────────────────────────────────────────
CREATE TABLE public.players (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  club_player_code  text        NOT NULL UNIQUE,                        -- "Player Digital ID" legible: SMT-001
  first_name        text        NOT NULL,
  last_name         text        NOT NULL,
  position          text,                                               -- Portero / Defensor / Centrocampista / Delantero / Medio
  birthdate         date,
  height_cm         numeric(5,1),
  weight_kg         numeric(5,1),
  status            player_status DEFAULT 'active' NOT NULL,
  avatar_url        text,                                               -- TODO: upload to Supabase Storage later
  created_at        timestamptz DEFAULT now() NOT NULL,
  updated_at        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_players_code   ON public.players (club_player_code);
CREATE INDEX idx_players_status ON public.players (status);

-- ─── USER PROFILES (1:1 con auth.users) ──────────────────────
CREATE TABLE public.user_profiles (
  user_id   uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text        NOT NULL,
  role      user_role   NOT NULL DEFAULT 'viewer',
  active    boolean     NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ─── PERMISSION ASSIGNMENTS ──────────────────────────────────
CREATE TABLE public.permission_assignments (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope_type scope_type  NOT NULL,
  scope_id   text        NOT NULL,   -- player UUID (text) | metric_family enum value | group id (future)
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid        REFERENCES auth.users(id)
);

CREATE INDEX idx_perms_user ON public.permission_assignments (user_id, scope_type);
-- TODO: when groups are introduced, add idx on scope_id where scope_type = 'group'

-- ─── TRAINING SESSIONS ───────────────────────────────────────
CREATE TABLE public.training_sessions (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date     date        NOT NULL,
  session_name     text        NOT NULL,                                -- ej: "MD-2 AM"
  microcycle_label text,                                                -- ej: "Semana 3 – Apertura"
  session_type     text,                                                -- ej: "campo", "gimnasio", "recuperación"
  notes            text,
  created_at       timestamptz DEFAULT now() NOT NULL,
  created_by       uuid        REFERENCES auth.users(id)
);

CREATE INDEX idx_sessions_date ON public.training_sessions (session_date DESC);

-- ─── GPS METRICS (carga externa) ─────────────────────────────
CREATE TABLE public.gps_metrics (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id            uuid        NOT NULL REFERENCES public.players(id),
  session_id           uuid        NOT NULL REFERENCES public.training_sessions(id),
  total_distance_m     numeric(8,1) NOT NULL,
  high_speed_distance_m numeric(7,1),                                   -- distancia a alta velocidad
  sprint_distance_m    numeric(6,1),
  max_speed_kmh        numeric(4,1),
  player_load          numeric(6,1),                                    -- carga externa composite (si aplica)
  accel_count          smallint,
  decel_count          smallint,
  -- trazabilidad
  source               data_source  NOT NULL DEFAULT 'manual',
  import_batch_id      uuid,                                            -- para agrupar imports CSV
  created_by           uuid         NOT NULL REFERENCES auth.users(id),
  created_at           timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX idx_gps_player_session ON public.gps_metrics (player_id, session_id);
CREATE INDEX idx_gps_player_date    ON public.gps_metrics (player_id, created_at DESC);

-- ─── STRENGTH METRICS (gimnasio) ─────────────────────────────
CREATE TABLE public.strength_metrics (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id       uuid        NOT NULL REFERENCES public.players(id),
  session_id      uuid        REFERENCES public.training_sessions(id), -- puede ser NULL si es "gimnasio" sin sesión campo
  exercise_name   text        NOT NULL,                                 -- ej: "Squat", "Bench Press"
  set_count       smallint,
  reps            smallint,
  load_kg         numeric(6,2),
  rpe             numeric(3,1),                                         -- Rate of Perceived Exertion (1-10)
  estimated_1rm   numeric(6,2),                                         -- 1RM estimado (Epley/Brzycki)
  -- trazabilidad
  source          data_source  NOT NULL DEFAULT 'manual',
  import_batch_id uuid,
  created_by      uuid         NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX idx_strength_player ON public.strength_metrics (player_id, created_at DESC);

-- ─── JUMP METRICS ────────────────────────────────────────────
CREATE TABLE public.jump_metrics (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id       uuid        NOT NULL REFERENCES public.players(id),
  session_id      uuid        REFERENCES public.training_sessions(id),
  test_type       jump_test_type NOT NULL,
  jump_height_cm  numeric(5,1) NOT NULL,
  rsi             numeric(4,2),                                         -- Reactive Strength Index (DJ)
  peak_power_w    numeric(7,1),                                         -- Potencia pico (Watt)
  asymmetry_pct   numeric(5,1),                                         -- % asimetría bilateral
  -- trazabilidad
  source          data_source  NOT NULL DEFAULT 'manual',
  import_batch_id uuid,
  created_by      uuid         NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX idx_jumps_player ON public.jump_metrics (player_id, created_at DESC);
CREATE INDEX idx_jumps_type   ON public.jump_metrics (player_id, test_type);

-- ─── CHAT THREADS & MESSAGES ─────────────────────────────────
CREATE TABLE public.chat_threads (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid        NOT NULL REFERENCES auth.users(id),
  title      text        DEFAULT 'Nueva conversación',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.chat_messages (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id      uuid        NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  role           chat_role   NOT NULL,
  content        text        NOT NULL,
  citations_json jsonb,                                                  -- {"sources": ["gps_metrics (últimos 14 días)", ...]}
  created_at     timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_chat_thread ON public.chat_messages (thread_id, created_at);

-- ─── TRIGGERS: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_threads_updated_at
  BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS: ENABLE ─────────────────────────────────────────────
ALTER TABLE public.players              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_metrics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_metrics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jump_metrics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages        ENABLE ROW LEVEL SECURITY;
