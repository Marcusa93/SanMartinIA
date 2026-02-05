import { z } from 'zod';

// ─── Player ───────────────────────────────────────────────────
// Form uses string fields for all inputs; empty→null conversion happens in onSubmit.
export const PlayerCreateSchema = z.object({
  club_player_code: z.string().min(3).max(20).regex(/^[A-Z0-9\-]+$/, 'Solo letras mayúsculas, números y guiones'),
  first_name:       z.string().min(1).max(80),
  last_name:        z.string().min(1).max(80),
  position:         z.string().max(40),
  birthdate:        z.string(),
  height_cm:        z.string(),
  weight_kg:        z.string(),
  status:           z.enum(['active', 'injured', 'rehab', 'inactive']),
});

export type PlayerCreateInput = z.infer<typeof PlayerCreateSchema>;
export type PlayerUpdateInput = Partial<PlayerCreateInput>;

// ─── Training Session ────────────────────────────────────────
export const SessionCreateSchema = z.object({
  session_date:     z.string().date(),
  session_name:     z.string().min(1).max(100).trim(),
  microcycle_label: z.string().max(60).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  session_type:     z.string().max(40).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  notes:            z.string().max(2000).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
});

export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;

// ─── GPS Metric ──────────────────────────────────────────────
export const GpsMetricSchema = z.object({
  player_id:              z.string().uuid(),
  session_id:             z.string().uuid(),
  total_distance_m:       z.coerce.number().min(0).max(15000),
  high_speed_distance_m:  z.coerce.number().min(0).max(5000).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  sprint_distance_m:      z.coerce.number().min(0).max(3000).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  max_speed_kmh:          z.coerce.number().min(0).max(45).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  player_load:            z.coerce.number().min(0).max(5000).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  accel_count:            z.coerce.number().int().min(0).max(200).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  decel_count:            z.coerce.number().int().min(0).max(200).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
});

export type GpsMetricInput = z.infer<typeof GpsMetricSchema>;

// ─── Strength Metric ─────────────────────────────────────────
export const StrengthMetricSchema = z.object({
  player_id:      z.string().uuid(),
  session_id:     z.string().uuid().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  exercise_name:  z.string().min(1).max(80).trim(),
  set_count:      z.coerce.number().int().min(0).max(50).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  reps:           z.coerce.number().int().min(0).max(100).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  load_kg:        z.coerce.number().min(0).max(500).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  rpe:            z.coerce.number().min(0).max(10).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  estimated_1rm:  z.coerce.number().min(0).max(600).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
});

export type StrengthMetricInput = z.infer<typeof StrengthMetricSchema>;

// ─── Jump Metric ─────────────────────────────────────────────
export const JumpMetricSchema = z.object({
  player_id:      z.string().uuid(),
  session_id:     z.string().uuid().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  test_type:      z.enum(['CMJ', 'SJ', 'DJ', 'other']),
  jump_height_cm: z.coerce.number().min(0).max(100),
  rsi:            z.coerce.number().min(0).max(5).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  peak_power_w:   z.coerce.number().min(0).max(5000).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  asymmetry_pct:  z.coerce.number().min(0).max(50).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
});

export type JumpMetricInput = z.infer<typeof JumpMetricSchema>;

// ─── User management ─────────────────────────────────────────
export const UserCreateSchema = z.object({
  email:     z.string().email(),
  full_name: z.string().min(2).max(100).trim(),
  role:      z.enum(['superadmin', 'company_dev', 'admin_pf', 'admin_staff', 'viewer']),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
