import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export const STATUS_LABELS: Record<string, string> = {
  active:   'Activo',
  injured:  'Lesionado',
  rehab:    'Rehabilitación',
  inactive: 'Inactivo',
};

export const STATUS_COLORS: Record<string, string> = {
  active:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  injured:  'bg-red-500/20 text-red-300 border-red-500/40',
  rehab:    'bg-amber-500/20 text-amber-300 border-amber-500/40',
  inactive: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

export const ROLE_LABELS: Record<string, string> = {
  superadmin:  'Super Admin',
  company_dev: 'Dev Empresa',
  admin_pf:    'PF Institucional',
  admin_staff: 'Staff Admin',
  viewer:      'Visualizador',
};

export function getPositions(): string[] {
  return ['Portero', 'Defensor', 'Medio', 'Delantero'];
}

// ─── Position chip labels & icons ──────────────────────────
// Keys = raw DB / mock values.  Labels = what the user sees in the UI.
export const POSITION_LABELS: Record<string, string> = {
  Portero:   'Arqueros',
  Defensor:  'Defensores',
  Medio:     'Mediocampistas',
  Delantero: 'Delanteros',
};

export const POSITION_ICONS: Record<string, string> = {
  Portero:   '🧤',
  Defensor:  '🛡️',
  Medio:     '⚙️',
  Delantero: '⚽',
};
