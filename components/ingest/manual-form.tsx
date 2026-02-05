'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { createClient } from '../../lib/supabase/client';
import { type Player, type TrainingSession } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';

interface ManualIngestFormProps { userId: string; }

export function ManualIngestForm({ userId }: ManualIngestFormProps) {
  const [players, setPlayers]     = useState<Player[]>([]);
  const [sessions, setSessions]   = useState<TrainingSession[]>([]);
  const [family, setFamily]       = useState<'gps' | 'strength' | 'jumps'>('gps');
  const [playerId, setPlayerId]   = useState('');
  const [sessionId, setSessionId] = useState('');
  const [fields, setFields]       = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: p } = await supabase.from('players').select('*').order('last_name');
      const { data: s } = await supabase.from('training_sessions').select('*').order('session_date', { ascending: false });
      setPlayers((p || []) as Player[]);
      setSessions((s || []) as TrainingSession[]);
    })();
  }, []);

  // Reset fields when family changes
  useEffect(() => { setFields({}); setError(''); setSuccess(''); }, [family]);

  const fieldDefs: Record<string, { label: string; unit?: string; required?: boolean; max?: number }[]> = {
    gps: [
      { label: 'total_distance_m',       unit: 'm',    required: true,  max: 15000 },
      { label: 'high_speed_distance_m',  unit: 'm' },
      { label: 'sprint_distance_m',      unit: 'm' },
      { label: 'max_speed_kmh',          unit: 'km/h', max: 45 },
      { label: 'player_load',            unit: 'u.a.' },
      { label: 'accel_count',            unit: '' },
      { label: 'decel_count',            unit: '' },
    ],
    strength: [
      { label: 'exercise_name', required: true },
      { label: 'set_count',     unit: 'series' },
      { label: 'reps',          unit: 'reps' },
      { label: 'load_kg',       unit: 'kg',  max: 500 },
      { label: 'rpe',           unit: '/10', max: 10 },
      { label: 'estimated_1rm', unit: 'kg',  max: 600 },
    ],
    jumps: [
      { label: 'test_type',       required: true },   // dropdown handled separately
      { label: 'jump_height_cm',  unit: 'cm', required: true, max: 100 },
      { label: 'rsi',             unit: '' },
      { label: 'peak_power_w',    unit: 'W',  max: 5000 },
      { label: 'asymmetry_pct',   unit: '%',  max: 50 },
    ],
  };

  const validate = (): string | null => {
    if (!playerId) return 'Seleccionar jugador';
    if (!sessionId && family !== 'strength') return 'Seleccionar sesión';
    const defs = fieldDefs[family];
    for (const d of defs) {
      if (d.required && !fields[d.label]) return `${d.label} es obligatorio`;
      if (d.max && fields[d.label] && Number(fields[d.label]) > d.max) return `${d.label} excede máximo (${d.max})`;
      if (fields[d.label] && isNaN(Number(fields[d.label])) && d.unit !== undefined) return `${d.label} debe ser un número`;
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    const supabase = createClient();

    try {
      if (family === 'gps') {
        await (supabase.from('gps_metrics') as any).insert({
          player_id:            playerId,
          session_id:           sessionId,
          total_distance_m:     Number(fields.total_distance_m),
          high_speed_distance_m: fields.high_speed_distance_m ? Number(fields.high_speed_distance_m) : null,
          sprint_distance_m:    fields.sprint_distance_m ? Number(fields.sprint_distance_m) : null,
          max_speed_kmh:        fields.max_speed_kmh ? Number(fields.max_speed_kmh) : null,
          player_load:          fields.player_load ? Number(fields.player_load) : null,
          accel_count:          fields.accel_count ? Number(fields.accel_count) : null,
          decel_count:          fields.decel_count ? Number(fields.decel_count) : null,
          source:               'manual',
          created_by:           userId,
        });
      } else if (family === 'strength') {
        await (supabase.from('strength_metrics') as any).insert({
          player_id:      playerId,
          session_id:     sessionId || null,
          exercise_name:  fields.exercise_name,
          set_count:      fields.set_count ? Number(fields.set_count) : null,
          reps:           fields.reps ? Number(fields.reps) : null,
          load_kg:        fields.load_kg ? Number(fields.load_kg) : null,
          rpe:            fields.rpe ? Number(fields.rpe) : null,
          estimated_1rm:  fields.estimated_1rm ? Number(fields.estimated_1rm) : null,
          source:         'manual',
          created_by:     userId,
        });
      } else {
        await (supabase.from('jump_metrics') as any).insert({
          player_id:     playerId,
          session_id:    sessionId || null,
          test_type:     fields.test_type,
          jump_height_cm: Number(fields.jump_height_cm),
          rsi:           fields.rsi ? Number(fields.rsi) : null,
          peak_power_w:  fields.peak_power_w ? Number(fields.peak_power_w) : null,
          asymmetry_pct: fields.asymmetry_pct ? Number(fields.asymmetry_pct) : null,
          source:        'manual',
          created_by:    userId,
        });
      }
      setSuccess('✅ Dato cargado exitosamente');
      setFields({});
    } catch (e: any) {
      setError('Error al guardar: ' + (e.message || 'desconocido'));
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga manual</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
          {/* Familia */}
          <Select
            label="Familia de métrica"
            value={family}
            onChange={e => setFamily(e.target.value as any)}
            options={[
              { value: 'gps',      label: '📡 GPS (carga externa)' },
              { value: 'strength', label: '💪 Fuerza (gimnasio)' },
              { value: 'jumps',    label: '🕹️ Saltos' },
            ]}
          />

          {/* Jugador */}
          <Select
            label="Jugador"
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
            options={[{ value: '', label: '— Seleccionar —' }, ...players.map(p => ({ value: p.id, label: `${p.club_player_code} – ${p.first_name} ${p.last_name}` }))]}
          />

          {/* Sesión */}
          <Select
            label="Sesión"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            options={[{ value: '', label: '— Seleccionar —' }, ...sessions.map(s => ({ value: s.id, label: `${s.session_date} | ${s.session_name} ${s.microcycle_label ? '– ' + s.microcycle_label : ''}` }))]}
          />

          {/* Dynamic fields */}
          {fieldDefs[family].map(d => {
            if (d.label === 'test_type') {
              return (
                <Select
                  key={d.label}
                  label="Tipo de test"
                  value={fields[d.label] || ''}
                  onChange={e => setFields(prev => ({ ...prev, [d.label]: e.target.value }))}
                  options={[
                    { value: '', label: '— Seleccionar —' },
                    { value: 'CMJ', label: 'CMJ (Counter Movement Jump)' },
                    { value: 'SJ',  label: 'SJ (Squat Jump)' },
                    { value: 'DJ',  label: 'DJ (Drop Jump)' },
                    { value: 'other', label: 'Otro' },
                  ]}
                />
              );
            }
            return (
              <Input
                key={d.label}
                label={`${d.label}${d.unit ? ` (${d.unit})` : ''}${d.required ? ' *' : ''}`}
                type={d.label === 'exercise_name' ? 'text' : 'number'}
                step="any"
                value={fields[d.label] || ''}
                onChange={e => setFields(prev => ({ ...prev, [d.label]: e.target.value }))}
              />
            );
          })}

          {error   && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{success}</p>}

          <Button type="submit" isLoading={saving} className="mt-2">Guardar</Button>
        </form>
      </CardContent>
    </Card>
  );
}
