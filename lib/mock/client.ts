/**
 * lib/mock/client.ts
 * Fake Supabase client for Demo / Mock mode.
 * Mimics the chaining API: .from().select().eq().order().limit().single()
 * Every component already calls createClient() — when mock mode is active
 * this is returned instead of the real browser client.
 */

import {
  MOCK_PLAYERS,
  MOCK_SESSIONS,
  MOCK_GPS,
  MOCK_JUMPS,
  MOCK_STRENGTH,
  MOCK_USERS,
} from './data';

// ── mutable tables for chat (in-memory, session-only) ─────────
let MOCK_CHAT_THREADS: any[] = [];
let MOCK_CHAT_MESSAGES: any[] = [];

// ── table registry ────────────────────────────────────────────
const TABLES: Record<string, any[]> = {
  players:            MOCK_PLAYERS,
  training_sessions:  MOCK_SESSIONS,
  gps_metrics:        MOCK_GPS,
  jump_metrics:       MOCK_JUMPS,
  strength_metrics:   MOCK_STRENGTH,
  user_profiles:      MOCK_USERS,
  chat_threads:       MOCK_CHAT_THREADS,
  chat_messages:      MOCK_CHAT_MESSAGES,
};

// ── mutable table refs (for insert/delete) ────────────────────
const MUTABLE_TABLES: Record<string, { get: () => any[], set: (v: any[]) => void }> = {
  chat_threads: {
    get: () => MOCK_CHAT_THREADS,
    set: (v) => { MOCK_CHAT_THREADS = v; TABLES.chat_threads = v; },
  },
  chat_messages: {
    get: () => MOCK_CHAT_MESSAGES,
    set: (v) => { MOCK_CHAT_MESSAGES = v; TABLES.chat_messages = v; },
  },
};

// ── tiny ilike matcher ────────────────────────────────────────
function ilike(value: string | null, pattern: string): boolean {
  if (value == null) return false;
  // pattern comes as  %foo%  →  strip %  →  case-insensitive includes
  const core = pattern.replace(/%/g, '');
  return value.toLowerCase().includes(core.toLowerCase());
}

// ── QueryBuilder ──────────────────────────────────────────────
class QueryBuilder {
  private _table: string;
  private _rows: any[];
  private _filters: Array<(row: any) => boolean> = [];
  private _orderCol: string | null = null;
  private _orderAsc = true;
  private _limit: number | null = null;
  private _single = false;
  private _insertData: any = null;
  private _updateData: any = null;
  private _isDelete = false;

  constructor(table: string) {
    this._table = table;
    this._rows  = TABLES[table] || [];
  }

  // ── chainable query methods ─────────────────────────────────
  select(_cols?: string) { return this; }

  eq(col: string, val: any) {
    // handle nested col like "gps_metrics.player_id" → strip prefix
    const key = col.includes('.') ? col.split('.').pop()! : col;
    this._filters.push((row: any) => row[key] == val); // eslint-disable-line eqeqeq
    return this;
  }

  neq(col: string, val: any) {
    const key = col.includes('.') ? col.split('.').pop()! : col;
    this._filters.push((row: any) => row[key] != val); // eslint-disable-line eqeqeq
    return this;
  }

  gte(col: string, val: any) {
    const key = col.includes('.') ? col.split('.').pop()! : col;
    this._filters.push((row: any) => {
      const v = row[key];
      if (v == null) return false;
      return String(v) >= String(val);
    });
    return this;
  }

  lte(col: string, val: any) {
    const key = col.includes('.') ? col.split('.').pop()! : col;
    this._filters.push((row: any) => {
      const v = row[key];
      if (v == null) return false;
      return String(v) <= String(val);
    });
    return this;
  }

  // .or(`first_name.ilike.%foo%,last_name.ilike.%foo%,club_player_code.ilike.%foo%`)
  or(expr: string) {
    this._filters.push((row: any) => {
      const parts = expr.split(',');
      return parts.some(part => {
        const segments = part.trim().split('.');
        // col.ilike.%pattern%
        if (segments.length >= 3 && segments[1] === 'ilike') {
          const col  = segments[0];
          const pat  = segments.slice(2).join('.');
          return ilike(row[col], pat);
        }
        return false;
      });
    });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const key = col.includes('.') ? col.split('.').pop()! : col;
    this._orderCol = key;
    this._orderAsc = opts?.ascending !== false;
    return this;
  }

  limit(n: number) { this._limit = n; return this; }
  single()         { this._single = true; return this; }

  // ── write methods (work for mutable tables) ────────────────
  insert(data: any) {
    this._insertData = data;
    return this;
  }

  update(data: any) {
    this._updateData = data;
    return this;
  }

  delete() {
    this._isDelete = true;
    return this;
  }

  // ── make it thenable so  `await builder`  works ────────────
  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    try {
      const mutable = MUTABLE_TABLES[this._table];

      // ── INSERT ──
      if (this._insertData != null) {
        const newRow = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...this._insertData,
        };
        if (mutable) {
          const rows = mutable.get();
          rows.push(newRow);
          mutable.set(rows);
        }
        const data = this._single ? newRow : [newRow];
        return resolve({ data, error: null });
      }

      // ── DELETE ──
      if (this._isDelete) {
        if (mutable) {
          const rows = mutable.get();
          const filtered = rows.filter(row => !this._filters.every(fn => fn(row)));
          mutable.set(filtered);
        }
        return resolve({ data: null, error: null });
      }

      // ── UPDATE ──
      if (this._updateData != null) {
        if (mutable) {
          const rows = mutable.get();
          rows.forEach(row => {
            if (this._filters.every(fn => fn(row))) {
              Object.assign(row, this._updateData);
            }
          });
          mutable.set(rows);
        }
        return resolve({ data: null, error: null });
      }

      // ── SELECT ──
      let result = this._rows.filter(row => this._filters.every(fn => fn(row)));

      if (this._orderCol) {
        const col = this._orderCol;
        const asc = this._orderAsc;
        result = result.slice().sort((a, b) => {
          const av = a[col] ?? '';
          const bv = b[col] ?? '';
          if (av < bv) return asc ? -1 : 1;
          if (av > bv) return asc ?  1 : -1;
          return 0;
        });
      }

      if (this._limit != null) result = result.slice(0, this._limit);

      const data = this._single ? (result[0] ?? null) : result;
      return resolve({ data, error: null, count: result.length });
    } catch (e) {
      if (reject) return reject(e);
      return resolve({ data: null, error: e });
    }
  }

  // support for  .catch()  just in case
  catch(fn: (e: any) => any) { return this.then(undefined as any, fn); }
}

// ── mock auth ─────────────────────────────────────────────────
const mockAuth = {
  signOut: async () => ({ error: null }),
  getUser: async () => ({
    data: {
      user: {
        id: 'mock-user-001',
        email: 'demo@sanmartin.local',
      },
    },
  }),
  signInWithPassword: async () => ({ data: {}, error: null }),
};

// ── exported factory ──────────────────────────────────────────
export function createMockClient() {
  return {
    from(table: string) {
      return new QueryBuilder(table);
    },
    auth: mockAuth,
  };
}
