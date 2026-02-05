'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ManualIngestForm } from './manual-form';
import { CsvIngestForm } from './csv-form';

interface IngestClientProps {
  userId: string;
}

export function IngestClient({ userId }: IngestClientProps) {
  const [tab, setTab] = useState<'manual' | 'csv'>('manual');

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('manual')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'manual' ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          ✏️ Carga manual
        </button>
        <button
          onClick={() => setTab('csv')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'csv' ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          📄 Importar CSV
        </button>
      </div>

      {tab === 'manual' ? <ManualIngestForm userId={userId} /> : <CsvIngestForm userId={userId} />}
    </div>
  );
}
