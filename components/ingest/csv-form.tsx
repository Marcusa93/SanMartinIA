'use client';

import { useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import Papa from 'papaparse';
import { createClient } from '../../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select } from '../ui/input';
import { v4 as uuidv4 } from 'uuid';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Trash2, Clock } from 'lucide-react';

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

const FAMILY_CONFIG = {
  gps: {
    label: '📡 GPS (carga externa)',
    icon: '📡',
    color: 'text-blue-400',
    columns: 'player_id, session_id, total_distance_m, high_speed_distance_m, sprint_distance_m, max_speed_kmh, player_load, accel_count, decel_count',
  },
  strength: {
    label: '💪 Fuerza (gimnasio)',
    icon: '💪',
    color: 'text-emerald-400',
    columns: 'player_id, session_id (opcional), exercise_name, set_count, reps, load_kg, rpe, estimated_1rm',
  },
  jumps: {
    label: '🦘 Saltos',
    icon: '🦘',
    color: 'text-amber-400',
    columns: 'player_id, session_id (opcional), test_type (CMJ|SJ|DJ|other), jump_height_cm, rsi, peak_power_w, asymmetry_pct',
  },
};

interface ImportHistory {
  id: string;
  family: string;
  filename: string;
  imported: number;
  errors: number;
  timestamp: Date;
}

export function CsvIngestForm({ userId }: CsvIngestFormProps) {
  const [family, setFamily] = useState<'gps' | 'strength' | 'jumps'>('gps');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<ImportHistory[]>([]);

  const processFile = useCallback((file: File) => {
    setError('');
    setResult(null);
    setFilename(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setHeaders(res.meta.fields || []);
        setRows(res.data as Record<string, string>[]);
      },
      error: () => setError('Error al parsear CSV'),
    });
  }, []);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      processFile(file);
    } else {
      setError('Por favor, arrastrá un archivo CSV válido');
    }
  };

  const clearFile = () => {
    setRows([]);
    setHeaders([]);
    setFilename('');
    setResult(null);
    setError('');
  };

  // Validate a single row
  const validateRow = (row: Record<string, string>): string[] => {
    const errs: string[] = [];
    Object.entries(RANGES).forEach(([key, [min, max]]) => {
      if (row[key] !== undefined && row[key] !== '') {
        const v = Number(row[key]);
        if (isNaN(v)) errs.push(`${key}: no es número`);
        else if (v < min || v > max) errs.push(`${key}: fuera de rango`);
      }
    });
    // Required checks
    if (family === 'gps' && !row.player_id) errs.push('player_id requerido');
    if (family === 'gps' && !row.session_id) errs.push('session_id requerido');
    if (family === 'gps' && !row.total_distance_m) errs.push('total_distance_m requerido');
    if (family === 'jumps' && !row.jump_height_cm) errs.push('jump_height_cm requerido');
    if (family === 'jumps' && !row.test_type) errs.push('test_type requerido');
    if (family === 'strength' && !row.exercise_name) errs.push('exercise_name requerido');
    return errs;
  };

  const validRowCount = rows.filter(r => validateRow(r).length === 0).length;
  const invalidRowCount = rows.length - validRowCount;

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
            total_distance_m: Number(row.total_distance_m),
            high_speed_distance_m: row.high_speed_distance_m ? Number(row.high_speed_distance_m) : null,
            sprint_distance_m: row.sprint_distance_m ? Number(row.sprint_distance_m) : null,
            max_speed_kmh: row.max_speed_kmh ? Number(row.max_speed_kmh) : null,
            player_load: row.player_load ? Number(row.player_load) : null,
            accel_count: row.accel_count ? Number(row.accel_count) : null,
            decel_count: row.decel_count ? Number(row.decel_count) : null,
          });
        } else if (family === 'strength') {
          await (supabase.from('strength_metrics') as any).insert({
            ...base,
            session_id: row.session_id || null,
            exercise_name: row.exercise_name,
            set_count: row.set_count ? Number(row.set_count) : null,
            reps: row.reps ? Number(row.reps) : null,
            load_kg: row.load_kg ? Number(row.load_kg) : null,
            rpe: row.rpe ? Number(row.rpe) : null,
            estimated_1rm: row.estimated_1rm ? Number(row.estimated_1rm) : null,
          });
        } else {
          await (supabase.from('jump_metrics') as any).insert({
            ...base,
            session_id: row.session_id || null,
            test_type: row.test_type,
            jump_height_cm: Number(row.jump_height_cm),
            rsi: row.rsi ? Number(row.rsi) : null,
            peak_power_w: row.peak_power_w ? Number(row.peak_power_w) : null,
            asymmetry_pct: row.asymmetry_pct ? Number(row.asymmetry_pct) : null,
          });
        }
        imported++;
      } catch { errors++; }
    }

    setResult({ imported, errors });
    setHistory(prev => [{
      id: batchId,
      family,
      filename,
      imported,
      errors,
      timestamp: new Date(),
    }, ...prev].slice(0, 5));
    setImporting(false);
  };

  const preview = rows.slice(0, 8);
  const config = FAMILY_CONFIG[family];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Familia */}
          <Select
            label="Familia de métrica"
            value={family}
            onChange={e => { setFamily(e.target.value as any); clearFile(); }}
            options={[
              { value: 'gps', label: '📡 GPS (carga externa)' },
              { value: 'strength', label: '💪 Fuerza (gimnasio)' },
              { value: 'jumps', label: '🦘 Saltos' },
            ]}
          />

          {/* Drag & Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : filename
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="csv-upload"
            />

            {filename ? (
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {rows.length} filas • {headers.length} columnas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {validRowCount > 0 && (
                    <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-medium">
                      {validRowCount} válidas
                    </span>
                  )}
                  {invalidRowCount > 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">
                      {invalidRowCount} con errores
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); clearFile(); }}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
                  isDragging ? 'bg-primary/20 scale-110' : 'bg-secondary'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <p className="font-medium text-foreground mb-1">
                  {isDragging ? 'Soltá el archivo aquí' : 'Arrastrá tu archivo CSV'}
                </p>
                <p className="text-sm text-muted-foreground">
                  o hacé clic para seleccionar
                </p>
              </div>
            )}
          </div>

          {/* Column reference */}
          <div className="rounded-lg bg-secondary/50 border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <span>{config.icon}</span>
              Columnas esperadas para {config.label}:
            </p>
            <p className="text-xs font-mono text-foreground/80 break-all">
              {config.columns}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <XCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <span>👁️</span>
                Previsualización ({preview.length} de {rows.length} filas)
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold w-8">#</th>
                      {headers.slice(0, 6).map(h => (
                        <th key={h} className="text-left px-3 py-2.5 text-muted-foreground font-semibold">{h}</th>
                      ))}
                      {headers.length > 6 && (
                        <th className="px-3 py-2.5 text-muted-foreground">+{headers.length - 6}</th>
                      )}
                      <th className="px-3 py-2.5 text-center text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => {
                      const errs = validateRow(row);
                      return (
                        <tr key={i} className={`border-t border-border ${errs.length ? 'bg-destructive/5' : ''}`}>
                          <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                          {headers.slice(0, 6).map(h => (
                            <td key={h} className="px-3 py-2 text-foreground truncate max-w-[120px]">{row[h] || '-'}</td>
                          ))}
                          {headers.length > 6 && <td className="px-3 py-2 text-muted-foreground">...</td>}
                          <td className="px-3 py-2 text-center">
                            {errs.length ? (
                              <span className="inline-flex items-center gap-1 text-destructive" title={errs.join('; ')}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Import button */}
              <div className="mt-4 flex items-center gap-4">
                <Button
                  onClick={doImport}
                  isLoading={importing}
                  disabled={validRowCount === 0}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Importar {validRowCount} filas válidas
                </Button>
                {result && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      {result.imported} importadas
                    </span>
                    {result.errors > 0 && (
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle className="w-4 h-4" />
                        {result.errors} errores
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Historial de importaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map(h => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{FAMILY_CONFIG[h.family as keyof typeof FAMILY_CONFIG]?.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-xs">
                      {h.imported} ✓
                    </span>
                    {h.errors > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-xs">
                        {h.errors} ✗
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
