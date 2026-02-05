import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Player } from '../../types/database';

interface DashboardTeamSummaryProps {
    players: Player[];
    itemVariant: any;
}

export function DashboardTeamSummary({ players, itemVariant }: DashboardTeamSummaryProps) {
    return (
        <motion.div variants={itemVariant}>
            <Card>
                <CardHeader><CardTitle>👥 Resumen plantel</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Activos', count: players.filter(p => p.status === 'active').length, color: 'bg-emerald-500' },
                            { label: 'Lesionados', count: players.filter(p => p.status === 'injured').length, color: 'bg-red-500' },
                            { label: 'Rehabilitación', count: players.filter(p => p.status === 'rehab').length, color: 'bg-amber-500' },
                            { label: 'Inactivos', count: players.filter(p => p.status === 'inactive').length, color: 'bg-slate-500' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${s.color}`} />
                                <span className="text-sm text-muted-foreground">{s.label}:</span>
                                <span className="text-sm font-bold text-foreground">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
