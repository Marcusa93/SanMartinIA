-- ============================================================
-- MIGRATION 002: Row Level Security Policies
-- ============================================================
-- Helper: obtiene el role del usuario actual desde user_profiles.
-- Se usa en todas las políticas.
-- ============================================================

-- ─── HELPER FUNCTION ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
  RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ═══════════════════════════════════════════════════════════════
-- PLAYERS
-- ═══════════════════════════════════════════════════════════════
-- superadmin / admin_pf / admin_staff: full SELECT
-- viewer: SELECT solo donde tiene permission_assignment scope_type='player'
-- company_dev: deny by default en prod (sin policy de SELECT → bloqueo)

CREATE POLICY "players: superadmin/admin read all" ON public.players
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

CREATE POLICY "players: viewer read assigned" ON public.players
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'viewer'
    AND EXISTS (
      SELECT 1 FROM public.permission_assignments pa
      WHERE pa.user_id = auth.uid()
        AND pa.scope_type = 'player'
        AND pa.scope_id   = public.players.id::text
    )
  );

-- company_dev: NO policy → deny by default.
-- TODO: para entornos dev, añadir policy condicionada a APP_ENV (env var custom claim).
-- Ejemplo futuro:
-- CREATE POLICY "players: company_dev dev-only" ON public.players
--   FOR SELECT USING (
--     get_user_role(auth.uid()) = 'company_dev'
--     AND current_setting('app.env', true) = 'dev'
--   );

CREATE POLICY "players: admin_pf/superadmin insert" ON public.players
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf')
  );

CREATE POLICY "players: admin_pf/superadmin update" ON public.players
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf')
  );

-- ═══════════════════════════════════════════════════════════════
-- USER_PROFILES
-- ═══════════════════════════════════════════════════════════════
-- superadmin: everything
-- others: own profile only (SELECT)

CREATE POLICY "profiles: superadmin all" ON public.user_profiles
  FOR ALL USING (
    get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "profiles: own row select" ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- PERMISSION_ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "perms: superadmin all" ON public.permission_assignments
  FOR ALL USING (
    get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "perms: admin_pf read+write" ON public.permission_assignments
  FOR ALL USING (
    get_user_role(auth.uid()) = 'admin_pf'
  );

CREATE POLICY "perms: own assignments read" ON public.permission_assignments
  FOR SELECT USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- TRAINING_SESSIONS
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "sessions: admin+ read all" ON public.training_sessions
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

CREATE POLICY "sessions: viewer read all" ON public.training_sessions
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'viewer'
  );

CREATE POLICY "sessions: admin_pf/staff/superadmin insert" ON public.training_sessions
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

-- ═══════════════════════════════════════════════════════════════
-- GPS_METRICS
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "gps: admin+ read all" ON public.gps_metrics
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

CREATE POLICY "gps: viewer read assigned players" ON public.gps_metrics
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'viewer'
    AND (
      EXISTS (
        SELECT 1 FROM public.permission_assignments pa
        WHERE pa.user_id   = auth.uid()
          AND pa.scope_type = 'player'
          AND pa.scope_id   = public.gps_metrics.player_id::text
      )
      OR EXISTS (
        SELECT 1 FROM public.permission_assignments pa
        WHERE pa.user_id   = auth.uid()
          AND pa.scope_type = 'metric_family'
          AND pa.scope_id   = 'gps'
      )
    )
  );

CREATE POLICY "gps: admin+staff insert" ON public.gps_metrics
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

-- ═══════════════════════════════════════════════════════════════
-- STRENGTH_METRICS
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "strength: admin+ read all" ON public.strength_metrics
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

CREATE POLICY "strength: viewer read assigned" ON public.strength_metrics
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'viewer'
    AND (
      EXISTS (
        SELECT 1 FROM public.permission_assignments pa
        WHERE pa.user_id = auth.uid()
          AND pa.scope_type = 'player'
          AND pa.scope_id = public.strength_metrics.player_id::text
      )
      OR EXISTS (
        SELECT 1 FROM public.permission_assignments pa
        WHERE pa.user_id = auth.uid()
          AND pa.scope_type = 'metric_family'
          AND pa.scope_id = 'strength'
      )
    )
  );

CREATE POLICY "strength: admin+staff insert" ON public.strength_metrics
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

-- ═══════════════════════════════════════════════════════════════
-- JUMP_METRICS
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "jumps: admin+ read all" ON public.jump_metrics
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

CREATE POLICY "jumps: viewer read assigned" ON public.jump_metrics
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'viewer'
    AND (
      EXISTS (
        SELECT 1 FROM public.permission_assignments pa
        WHERE pa.user_id = auth.uid()
          AND pa.scope_type = 'player'
          AND pa.scope_id = public.jump_metrics.player_id::text
      )
      OR EXISTS (
        SELECT 1 FROM public.permission_assignments pa
        WHERE pa.user_id = auth.uid()
          AND pa.scope_type = 'metric_family'
          AND pa.scope_id = 'jumps'
      )
    )
  );

CREATE POLICY "jumps: admin+staff insert" ON public.jump_metrics
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin_pf', 'admin_staff')
  );

-- ═══════════════════════════════════════════════════════════════
-- CHAT_THREADS & CHAT_MESSAGES
-- ═══════════════════════════════════════════════════════════════
-- Each user sees only their own threads/messages.

CREATE POLICY "threads: own threads" ON public.chat_threads
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "threads: superadmin all" ON public.chat_threads
  FOR SELECT USING (get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "messages: own thread messages" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads ct
      WHERE ct.id = public.chat_messages.thread_id
        AND ct.created_by = auth.uid()
    )
  );

CREATE POLICY "messages: superadmin read all" ON public.chat_messages
  FOR SELECT USING (get_user_role(auth.uid()) = 'superadmin');
