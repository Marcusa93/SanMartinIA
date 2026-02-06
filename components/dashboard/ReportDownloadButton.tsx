'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { FileDown, Loader2, Check } from 'lucide-react';
import { generateWeeklyReport, downloadReport } from '../../lib/reports/pdf-generator';
import { Alert } from '../../hooks/useDashboardData';
import { Player } from '../../types/database';

interface ReportDownloadButtonProps {
  players: Player[];
  alerts: Alert[];
  stats: {
    avgDist: number;
    avgSpeed: number;
    avgJump: number;
    top5: { name: string; total: number }[];
  };
  gpsData?: any[];
  jumpData?: any[];
  strengthData?: any[];
}

export function ReportDownloadButton({
  players,
  alerts,
  stats,
  gpsData = [],
  jumpData = [],
  strengthData = [],
}: ReportDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      // Calculate date range (last 14 days)
      const to = new Date();
      const from = new Date(Date.now() - 14 * 86400000);

      const dateRange = {
        from: from.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
        to: to.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      const doc = generateWeeklyReport({
        players,
        alerts,
        stats,
        gpsData,
        jumpData,
        strengthData,
        dateRange,
      });

      const filename = `SanMartin_Reporte_${to.toISOString().split('T')[0]}.pdf`;
      downloadReport(doc, filename);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error generating report:', error);
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      size="sm"
      className={`gap-2 transition-all ${success ? 'border-emerald-500 text-emerald-500' : ''}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : success ? (
        <Check className="w-4 h-4" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {loading ? 'Generando...' : success ? 'Descargado' : 'Descargar Reporte'}
    </Button>
  );
}
