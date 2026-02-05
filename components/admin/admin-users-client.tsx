'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { type UserProfile } from '../../types/database';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { ROLE_LABELS } from '../../lib/utils';

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.from('user_profiles').select('*').order('full_name');
      setUsers((data || []) as UserProfile[]);
      setLoading(false);
    })();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient();
    await (supabase.from('user_profiles') as any).update({ role: newRole }).eq('user_id', userId);
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole as any } : u));
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    const supabase = createClient();
    await (supabase.from('user_profiles') as any).update({ active }).eq('user_id', userId);
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, active } : u));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  const roles = ['superadmin', 'company_dev', 'admin_pf', 'admin_staff', 'viewer'];

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Rol</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.user_id} className={`border-b border-slate-700/30 ${i % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                <td className="px-5 py-3 font-medium text-slate-200">{u.full_name}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.user_id, e.target.value)}
                    className="bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-md px-2 py-1 focus:border-red-500 focus:outline-none"
                  >
                    {roles.map(r => <option key={r} value={r} className="bg-slate-800">{ROLE_LABELS[r]}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleToggleActive(u.user_id, !u.active)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      u.active
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-slate-600/30 border-slate-600 text-slate-400 hover:bg-slate-600/50'
                    }`}
                  >
                    {u.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{u.user_id.slice(0, 12)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p>No hay usuarios registrados.</p>
            <p className="text-xs mt-1">Creá usuarios desde Supabase Studio → Auth → Users</p>
          </div>
        )}
      </div>
    </Card>
  );
}
