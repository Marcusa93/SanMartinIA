'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ManualIngestForm } from './manual-form';
import { CsvIngestForm } from './csv-form';

interface IngestClientProps {
  userId: string;
}

export function IngestClient({ userId }: IngestClientProps) {
  const [tab, setTab] = useState<'manual' | 'csv'>('csv');

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('manual')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'manual'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
        >
          ✏️ Carga manual
        </button>
        <button
          onClick={() => setTab('csv')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'csv'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
        >
          📄 Importar CSV
        </button>
      </div>

      {tab === 'manual' ? <ManualIngestForm userId={userId} /> : <CsvIngestForm userId={userId} />}
    </div>
  );
}
