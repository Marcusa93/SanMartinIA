// ─── Database types (mirrors SQL schema) ─────────────────────
// Generated from migrations — keep in sync manually or via supabase gen types

export type PlayerStatus = 'active' | 'injured' | 'rehab' | 'inactive';
export type UserRole = 'superadmin' | 'company_dev' | 'admin_pf' | 'admin_staff' | 'viewer';
export type ScopeType = 'player' | 'group' | 'metric_family';
export type MetricFamily = 'gps' | 'strength' | 'jumps';
export type JumpTestType = 'CMJ' | 'SJ' | 'DJ' | 'other';
export type ChatRole = 'user' | 'assistant' | 'system';
export type DataSource = 'manual' | 'csv' | 'api';

export interface Player {
  id: string;
  club_player_code: string;
  first_name: string;
  last_name: string;
  position: string | null;
  birthdate: string | null;       // ISO date string
  height_cm: number | null;
  weight_kg: number | null;
  status: PlayerStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionAssignment {
  id: string;
  user_id: string;
  scope_type: ScopeType;
  scope_id: string;
  created_at: string;
  created_by: string | null;
}

export interface TrainingSession {
  id: string;
  session_date: string;        // ISO date
  session_name: string;
  microcycle_label: string | null;
  session_type: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface GpsMetric {
  id: string;
  player_id: string;
  session_id: string;
  total_distance_m: number;
  high_speed_distance_m: number | null;
  sprint_distance_m: number | null;
  max_speed_kmh: number | null;
  player_load: number | null;
  accel_count: number | null;
  decel_count: number | null;
  source: DataSource;
  import_batch_id: string | null;
  created_by: string;
  created_at: string;
}

export interface StrengthMetric {
  id: string;
  player_id: string;
  session_id: string | null;
  exercise_name: string;
  set_count: number | null;
  reps: number | null;
  load_kg: number | null;
  rpe: number | null;
  estimated_1rm: number | null;
  source: DataSource;
  import_batch_id: string | null;
  created_by: string;
  created_at: string;
}

export interface JumpMetric {
  id: string;
  player_id: string;
  session_id: string | null;
  test_type: JumpTestType;
  jump_height_cm: number;
  rsi: number | null;
  peak_power_w: number | null;
  asymmetry_pct: number | null;
  source: DataSource;
  import_batch_id: string | null;
  created_by: string;
  created_at: string;
}

export interface ChatThread {
  id: string;
  created_by: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: ChatRole;
  content: string;
  citations_json: { sources?: string[] } | null;
  created_at: string;
}

// ─── Supabase DB type (for createSupabaseClient generics) ─────
export interface Database {
  public: {
    Tables: {
      players: { Row: Player; Insert: Omit<Player, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Player, 'id'>> };
      user_profiles: { Row: UserProfile; Insert: Omit<UserProfile, 'created_at' | 'updated_at'>; Update: Partial<UserProfile> };
      permission_assignments: { Row: PermissionAssignment; Insert: Omit<PermissionAssignment, 'id' | 'created_at'>; Update: Partial<PermissionAssignment> };
      training_sessions: { Row: TrainingSession; Insert: Omit<TrainingSession, 'id' | 'created_at'>; Update: Partial<TrainingSession> };
      gps_metrics: { Row: GpsMetric; Insert: Omit<GpsMetric, 'id' | 'created_at'>; Update: Partial<GpsMetric> };
      strength_metrics: { Row: StrengthMetric; Insert: Omit<StrengthMetric, 'id' | 'created_at'>; Update: Partial<StrengthMetric> };
      jump_metrics: { Row: JumpMetric; Insert: Omit<JumpMetric, 'id' | 'created_at'>; Update: Partial<JumpMetric> };
      chat_threads: { Row: ChatThread; Insert: Omit<ChatThread, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ChatThread> };
      chat_messages: { Row: ChatMessage; Insert: Omit<ChatMessage, 'id' | 'created_at'>; Update: Partial<ChatMessage> };
    };
  };
}
