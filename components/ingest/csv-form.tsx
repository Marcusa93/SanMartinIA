'use client';

import { useState, type ChangeEvent } from 'react';
import Papa from 'papaparse';
import { createClient } from '../../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select } from '../ui/input';
import { v4 as uuidv4 } from 'uuid';

interface CsvIngestFormProps { userId: string; }

// Validation ranges
const RANGES: Record<string, [number, number]> = {
  total_distance_m:      [0, 15000],
  high_speed_distance_m: [0, 5000],
  sprint_distance_m:     [0, 3000],
  max_speed_kmh:         [0, 45],
  player_load:           [0, 5000],
  accel_count:           [0, 200],
  decel_count:           [0, 200],
  jump_height_cm:        [0, 100],
  load_kg:               [0, 500],
  rpe:                   [0, 10],
  estimated_1rm:         [0, 600],
  rsi:                   [0, 5],
  peak_power_w:          [0, 5000],
  asymmetry_pct:         [0, 50],
  set_count:             [0, 50],
  reps:                  [0, 100],
};

export function CsvIngestForm({ userId }: CsvIngestFormProps) {
  const [family, setFamily]       = useState<'gps' | 'strength' | 'jumps'>('gps');
  const [rows, setRows]           = useState<Record<string, string>[]>([]);
  const [headers, setHeaders]     = useState<string[]>([]);
  const [error, setError]         = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState<{ imported: number; errors: number } | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setError(''); setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setHeaders(res.meta.fields || []);
        setRows(res.data as Record<string, string>[]);
      },
      error: () => setError('Error al parsear CSV'),
    });
  };

  // Validate a single row
  const validateRow = (row: Record<string, string>): string[] => {
    const errs: string[] = [];
    Object.entries(RANGES).forEach(([key, [min, max]]) => {
      if (row[key] !== undefined && row[key] !== '') {
        const v = Number(row[key]);
        if (isNaN(v)) errs.push(`${key}: no es número`);
        else if (v < min || v > max) errs.push(`${key}: fuera de rango [${min}-${max}]`);
      }
    });
    // Required checks
    if (family === 'gps'      && !row.player_id)          errs.push('player_id requerido');
    if (family === 'gps'      && !row.session_id)         errs.push('session_id requerido');
    if (family === 'gps'      && !row.total_distance_m)   errs.push('total_distance_m requerido');
    if (family === 'jumps'    && !row.jump_height_cm)     errs.push('jump_height_cm requerido');
    if (family === 'jumps'    && !row.test_type)          errs.push('test_type requerido');
    if (family === 'strength' && !row.exercise_name)      errs.push('exercise_name requerido');
    return errs;
  };

  const doImport = async () => {
    setImporting(true);
    setError('');
    const supabase = createClient();
    const batchId = uuidv4();
    let imported = 0, errors = 0;

    for (const row of rows) {
      const errs = validateRow(row);
      if (errs.length) { errors++; continue; }

      try {
        const base = { player_id: row.player_id, source: 'csv' as const, import_batch_id: batchId, created_by: userId };
        if (family === 'gps') {
          await (supabase.from('gps_metrics') as any).insert({
            ...base,
            session_id: row.session_id,
            total_distance_m:     Number(row.total_distance_m),
            high_speed_distance_m: row.high_speed_distance_m ? Number(row.high_speed_distance_m) : null,
            sprint_distance_m:    row.sprint_distance_m ? Number(row.sprint_distance_m) : null,
            max_speed_kmh:        row.max_speed_kmh ? Number(row.max_speed_kmh) : null,
            player_load:          row.player_load ? Number(row.player_load) : null,
            accel_count:          row.accel_count ? Number(row.accel_count) : null,
            decel_count:          row.decel_count ? Number(row.decel_count) : null,
          });
        } else if (family === 'strength') {
          await (supabase.from('strength_metrics') as any).insert({
            ...base,
            session_id:    row.session_id || null,
            exercise_name: row.exercise_name,
            set_count:     row.set_count ? Number(row.set_count) : null,
            reps:          row.reps ? Number(row.reps) : null,
            load_kg:       row.load_kg ? Number(row.load_kg) : null,
            rpe:           row.rpe ? Number(row.rpe) : null,
            estimated_1rm: row.estimated_1rm ? Number(row.estimated_1rm) : null,
          });
        } else {
          await (supabase.from('jump_metrics') as any).insert({
            ...base,
            session_id:    row.session_id || null,
            test_type:     row.test_type,
            jump_height_cm: Number(row.jump_height_cm),
            rsi:           row.rsi ? Number(row.rsi) : null,
            peak_power_w:  row.peak_power_w ? Number(row.peak_power_w) : null,
            asymmetry_pct: row.asymmetry_pct ? Number(row.asymmetry_pct) : null,
          });
        }
        imported++;
      } catch { errors++; }
    }

    setResult({ imported, errors });
    setImporting(false);
  };

  const preview = rows.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar CSV</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 max-w-3xl">
        {/* Familia */}
        <Select
          label="Familia de métrica"
          value={family}
          onChange={e => { setFamily(e.target.value as any); setRows([]); setHeaders([]); }}
          options={[
            { value: 'gps',      label: '📡 GPS (carga externa)' },
            { value: 'strength', label: '💪 Fuerza (gimnasio)' },
            { value: 'jumps',    label: '🕹️ Saltos' },
          ]}
        />

        {/* File input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Archivo CSV</label>
          <div className="rounded-lg border border-dashed border-slate-600 p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="absolute opacity-0 w-0 h-0"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <p className="text-slate-400 text-sm">📄 Arrastrá o hacé clic para subir CSV</p>
              <p className="text-slate-600 text-xs mt-1">Columnas esperadas: player_id, session_id, + campos de la familia</p>
            </label>
          </div>
        </div>

        {/* Column reference */}
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer hover:text-slate-300">📋 Columnas esperadas según familia</summary>
          <div className="mt-2 bg-slate-800 rounded-lg p-3 font-mono whitespace-pre">
            {family === 'gps' && `player_id, session_id, total_distance_m, high_speed_distance_m, sprint_distance_m, max_speed_kmh, player_load, accel_count, decel_count`}
            {family === 'strength' && `player_id, session_id (opcional), exercise_name, set_count, reps, load_kg, rpe, estimated_1rm`}
            {family === 'jumps' && `player_id, session_id (opcional), test_type (CMJ|SJ|DJ|other), jump_height_cm, rsi, peak_power_w, asymmetry_pct`}
          </div>
        </details>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Preview table */}
        {preview.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Previsualización ({preview.length} de {rows.length} filas):</p>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-xs">
                <thead className="bg-slate-800">
                  <tr>
                    {headers.map(h => <th key={h} className="text-left px-3 py-2 text-slate-400 font-semibold">{h}</th>)}
                    <th className="px-3 py-2 text-slate-400">Validación</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => {
                    const errs = validateRow(row);
                    return (
                      <tr key={i} className={`border-t border-slate-700/50 ${errs.length ? 'bg-red-900/15' : ''}`}>
                        {headers.map(h => <td key={h} className="px-3 py-1.5 text-slate-300">{row[h] || ''}</td>)}
                        <td className="px-3 py-1.5">
                          {errs.length ? <span className="text-red-400">⚠ {errs.join('; ')}</span> : <span className="text-emerald-400">✓</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Import button */}
            <div className="mt-4 flex items-center gap-4">
              <Button onClick={doImport} isLoading={importing}>Importar {rows.length} filas</Button>
              {result && (
                <p className="text-sm">
                  <span className="text-emerald-400">{result.imported} importad{result.imported !== 1 ? 'as' : 'a'}</span>
                  {result.errors > 0 && <span className="text-red-400 ml-2">| {result.errors} error{result.errors !== 1 ? 'es' : ''}</span>}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
