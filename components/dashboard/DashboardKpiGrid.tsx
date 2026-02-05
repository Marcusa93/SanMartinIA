import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { formatNumber } from '../../lib/utils';
import { Player } from '../../types/database';

interface DashboardKpiGridProps {
    players: Player[];
    stats: {
        avgDist: number;
        avgSpeed: number;
        avgJump: number;
    };
    itemVariant: any;
}

export function DashboardKpiGrid({ players, stats, itemVariant }: DashboardKpiGridProps) {
    const activePlayers = players.filter(p => p.status === 'active').length;

    const kpis = [
        { label: 'Jugadores activos', value: activePlayers, unit: '', color: 'text-emerald-600' },
        { label: 'Dist. promedio (14d)', value: formatNumber(stats.avgDist, 0), unit: 'm', color: 'text-red-500' },
        { label: 'Vel. máx promedio', value: formatNumber(stats.avgSpeed, 1), unit: 'km/h', color: 'text-purple-600' },
        { label: 'CMJ promedio', value: formatNumber(stats.avgJump, 1), unit: 'cm', color: 'text-amber-600' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map(kpi => (
                <motion.div key={kpi.label} variants={itemVariant} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="py-5">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">{kpi.label}</p>
                            <p className={`text-2xl font-bold ${kpi.color}`}>
                                {kpi.value}<span className="text-xs font-normal text-muted-foreground ml-1">{kpi.unit}</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
