'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlayerCreateSchema, type PlayerCreateInput } from '../../types/schemas';
import { createClient } from '../../lib/supabase/client';
import { type Player } from '../../types/database';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { getPositions } from '../../lib/utils';

interface PlayerModalProps {
  open:    boolean;
  onClose: () => void;
  player:  Player | null;
  onSave:  () => void;
}

export function PlayerModal({ open, onClose, player, onSave }: PlayerModalProps) {
  const isEdit = !!player;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlayerCreateInput>({
    resolver: zodResolver(PlayerCreateSchema),
    defaultValues: {
      club_player_code: '',
      first_name: '',
      last_name: '',
      position: '',
      birthdate: '',
      height_cm: '',
      weight_kg: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open && player) {
      reset({
        club_player_code: player.club_player_code,
        first_name:       player.first_name,
        last_name:        player.last_name,
        position:         player.position || '',
        birthdate:        player.birthdate || '',
        height_cm:        player.height_cm != null ? String(player.height_cm) : '',
        weight_kg:        player.weight_kg != null ? String(player.weight_kg) : '',
        status:           player.status,
      });
    } else if (open) {
      reset({ club_player_code: '', first_name: '', last_name: '', position: '', birthdate: '', height_cm: '', weight_kg: '', status: 'active' });
    }
  }, [open, player, reset]);

  const onSubmit = async (data: PlayerCreateInput) => {
    const supabase = createClient();
    const common = {
      first_name: data.first_name.trim(),
      last_name:  data.last_name.trim(),
      position:   data.position || null,
      birthdate:  data.birthdate || null,
      height_cm:  data.height_cm ? Number(data.height_cm) : null,
      weight_kg:  data.weight_kg ? Number(data.weight_kg) : null,
      status:     data.status,
    };
    if (isEdit) {
      await (supabase.from('players') as any).update(common).eq('id', player!.id);
    } else {
      await (supabase.from('players') as any).insert({ club_player_code: data.club_player_code, ...common });
    }
    onSave();
  };

  if (!open) return null;

  const positions = getPositions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40">
        <div className="p-6 border-b border-slate-700/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">{isEdit ? 'Editar jugador' : 'Nuevo jugador'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
          <Input
            id="club_player_code"
            label="Digital ID (código)"
            placeholder="SMT-031"
            disabled={isEdit}
            error={errors.club_player_code?.message}
            {...register('club_player_code')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" placeholder="Juan" error={errors.first_name?.message} {...register('first_name')} />
            <Input label="Apellido" placeholder="García" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Select
            label="Posición"
            options={[{ value: '', label: '— Seleccionar —' }, ...positions.map(p => ({ value: p, label: p }))]}
            {...register('position')}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Fecha nac." type="date" {...register('birthdate')} />
            <Input label="Altura (cm)" type="number" placeholder="178" {...register('height_cm')} />
            <Input label="Peso (kg)" type="number" placeholder="73" {...register('weight_kg')} />
          </div>
          <Select
            label="Estado"
            options={[
              { value: 'active',   label: 'Activo' },
              { value: 'injured',  label: 'Lesionado' },
              { value: 'rehab',    label: 'Rehabilitación' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>{isEdit ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
