'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { type Player } from '../../types/database';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../ui/empty-state';
import { Input, Select } from '../ui/input';
import { STATUS_LABELS, STATUS_COLORS, getPositions, POSITION_LABELS, POSITION_ICONS } from '../../lib/utils';
import { PlayerModal } from './player-modal';

interface RosterClientProps {
  role: string;
}

export function RosterClient({ role }: RosterClientProps) {
  const [players, setPlayers]   = useState<Player[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  const canWrite = ['superadmin', 'admin_pf'].includes(role);

  const fetchPlayers = useCallback(async () => {
    const supabase = createClient();
    let q = supabase.from('players').select('*').order('last_name');
    if (statusFilter)   q = q.eq('status', statusFilter);
    if (positionFilter) q = q.eq('position', positionFilter);
    if (search) {
      const s = `%${search}%`;
      q = q.or(`first_name.ilike.${s},last_name.ilike.${s},club_player_code.ilike.${s}`);
    }
    const { data } = await q;
    setPlayers((data || []) as Player[]);
    setLoading(false);
  }, [search, statusFilter, positionFilter]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const positions = getPositions();

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input
            label="Buscar"
            placeholder="Nombre o código…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            label="Estado"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'active', label: 'Activo' },
              { value: 'injured', label: 'Lesionado' },
              { value: 'rehab', label: 'Rehabilitación' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
          />
        </div>
        {canWrite && (
          <Button onClick={() => { setEditPlayer(null); setModalOpen(true); }}>
            + Nuevo jugador
          </Button>
        )}
      </div>

      {/* Position chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { value: '', label: 'Todos', icon: '👤' },
          ...positions.map(p => ({ value: p, label: POSITION_LABELS[p], icon: POSITION_ICONS[p] })),
        ].map(chip => {
          const active = positionFilter === chip.value;
          return (
            <button
              key={chip.value || '__all__'}
              onClick={() => setPositionFilter(chip.value)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-red-700 text-white border-red-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              <span>{chip.icon}</span>
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">👥</span>}
          title="Sin jugadores"
          message="No hay jugadores que coincidan con los filtros aplicados."
          cta={canWrite ? { label: '+ Agregar jugador', onClick: () => { setEditPlayer(null); setModalOpen(true); } } : undefined}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Digital ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jugador</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Posición</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={p.id} className={`border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors ${i % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-red-400 font-semibold tracking-wide">{p.club_player_code}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-100">{p.first_name} {p.last_name}</td>
                    <td className="px-5 py-3 text-slate-400">{p.position || '—'}</td>
                    <td className="px-5 py-3">
                      <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 flex items-center gap-3">
                      <Link href={`/players/${p.id}`} className="text-xs text-red-400 hover:text-red-300 transition-colors">Ver perfil</Link>
                      {canWrite && (
                        <button onClick={() => { setEditPlayer(p); setModalOpen(true); }} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Editar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-slate-600 mt-3">{players.length} jugador{players.length !== 1 ? 'es' : ''} encontrado{players.length !== 1 ? 's' : ''}</p>

      <PlayerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        player={editPlayer}
        onSave={() => { setModalOpen(false); fetchPlayers(); }}
      />
    </div>
  );
}
