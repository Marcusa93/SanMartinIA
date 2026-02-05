import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Alert } from '../../hooks/useDashboardData';

interface DashboardAlertsProps {
    alerts: Alert[];
    itemVariant: any;
}

export function DashboardAlerts({ alerts, itemVariant }: DashboardAlertsProps) {
    if (alerts.length === 0) return null;

    return (
        <motion.div variants={itemVariant}>
            <Card className="border-red-500/30 bg-red-500/10">
                <CardHeader>
                    <CardTitle>⚠️ Alertas automáticas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        {alerts.map((a, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${a.type === 'load' ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-red-500/15 border border-red-500/30'}`}>
                                <span className="text-base">{a.type === 'load' ? '📈' : '📉'}</span>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{a.player}</p>
                                    <p className="text-xs text-muted-foreground">{a.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
