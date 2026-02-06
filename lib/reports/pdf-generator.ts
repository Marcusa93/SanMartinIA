import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Alert } from '../../hooks/useDashboardData';
import { Player } from '../../types/database';

interface ReportData {
  players: Player[];
  alerts: Alert[];
  stats: {
    avgDist: number;
    avgSpeed: number;
    avgJump: number;
    top5: { name: string; total: number }[];
  };
  gpsData: any[];
  jumpData: any[];
  strengthData: any[];
  dateRange: { from: string; to: string };
}

export function generateWeeklyReport(data: ReportData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // ─── Header ─────────────────────────────────────────────────
  doc.setFillColor(185, 28, 28); // Red-700
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('C.A. SAN MARTÍN', 14, 18);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Performance Lab - Reporte Semanal', 14, 28);

  doc.setFontSize(10);
  doc.text(`Período: ${data.dateRange.from} al ${data.dateRange.to}`, 14, 36);

  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageWidth - 50, 36);

  yPos = 50;

  // ─── KPIs Summary ───────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de KPIs', 14, yPos);
  yPos += 8;

  const kpiData = [
    ['Distancia Promedio', `${(data.stats.avgDist / 1000).toFixed(2)} km`],
    ['Velocidad Máx. Promedio', `${data.stats.avgSpeed.toFixed(1)} km/h`],
    ['CMJ Promedio', `${data.stats.avgJump.toFixed(1)} cm`],
    ['Jugadores Activos', `${data.players.filter(p => p.status === 'active').length}`],
    ['Jugadores Lesionados', `${data.players.filter(p => p.status === 'injured').length}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: kpiData,
    theme: 'striped',
    headStyles: { fillColor: [185, 28, 28], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ─── Alerts Section ─────────────────────────────────────────
  if (data.alerts.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Alertas Activas', 14, yPos);
    yPos += 8;

    const alertsData = data.alerts.slice(0, 10).map(a => [
      a.severity === 'critical' ? '🔴' : '🟡',
      a.player,
      a.type.toUpperCase(),
      a.msg,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['', 'Jugador', 'Tipo', 'Detalle']],
      body: alertsData,
      theme: 'striped',
      headStyles: { fillColor: [185, 28, 28], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { fontStyle: 'bold', cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ─── Top 5 Distance ─────────────────────────────────────────
  if (data.stats.top5.length > 0) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 5 - Distancia Total', 14, yPos);
    yPos += 8;

    const top5Data = data.stats.top5.map((p, i) => [
      `${i + 1}°`,
      p.name,
      `${(p.total / 1000).toFixed(2)} km`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Pos', 'Jugador', 'Distancia']],
      body: top5Data,
      theme: 'striped',
      headStyles: { fillColor: [185, 28, 28], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { fontStyle: 'bold' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ─── Player Status Table ────────────────────────────────────
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estado del Plantel', 14, yPos);
  yPos += 8;

  const playerData = data.players.map(p => {
    const statusIcon = p.status === 'active' ? '✓' : p.status === 'injured' ? '✗' : '○';
    const statusText = p.status === 'active' ? 'Activo' : p.status === 'injured' ? 'Lesionado' : 'Recuperación';
    return [
      `${p.first_name} ${p.last_name}`,
      p.position || '-',
      statusIcon,
      statusText,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Jugador', 'Posición', '', 'Estado']],
    body: playerData,
    theme: 'striped',
    headStyles: { fillColor: [185, 28, 28], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { cellWidth: 10, halign: 'center' },
    },
  });

  // ─── Footer ─────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `San Martín Performance Lab - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadReport(doc: jsPDF, filename: string) {
  doc.save(filename);
}
