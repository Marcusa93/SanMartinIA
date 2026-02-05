import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatDate } from '../../lib/utils';
import { StrengthMetric } from '../../types/database';

interface PlayerStrengthTableProps {
    strength: StrengthMetric[];
}

export function PlayerStrengthTable({ strength }: PlayerStrengthTableProps) {
    if (strength.length === 0) return null;

    return (
        <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-lg">Fuerza — Registro</CardTitle></CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {['Fecha', 'Ejercicio', 'Series', 'Reps', 'Carga kg', '1RM est.'].map(h => (
                                    <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {strength.map(s => (
                                <tr key={s.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                                    <td className="px-3 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                                    <td className="px-3 py-3 text-foreground font-medium">{s.exercise_name}</td>
                                    <td className="px-3 py-3 text-muted-foreground">{s.set_count || '—'}</td>
                                    <td className="px-3 py-3 text-muted-foreground">{s.reps || '—'}</td>
                                    <td className="px-3 py-3 text-muted-foreground">{s.load_kg || '—'}</td>
                                    <td className="px-3 py-3 text-primary font-bold">{s.estimated_1rm || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
