'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Alert } from '../../hooks/useDashboardData';
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Heart, Activity } from 'lucide-react';
import Link from 'next/link';

interface DashboardAlertsProps {
    alerts: Alert[];
    itemVariant: any;
}

const ALERT_CONFIG = {
    load: {
        icon: TrendingUp,
        label: 'Carga Alta',
        bgWarning: 'bg-amber-500/10 border-amber-500/30',
        bgCritical: 'bg-orange-500/15 border-orange-500/40',
        iconColor: 'text-amber-500',
    },
    jump: {
        icon: TrendingDown,
        label: 'Caída CMJ',
        bgWarning: 'bg-blue-500/10 border-blue-500/30',
        bgCritical: 'bg-blue-600/15 border-blue-600/40',
        iconColor: 'text-blue-500',
    },
    fatigue: {
        icon: Zap,
        label: 'Fatiga',
        bgWarning: 'bg-purple-500/10 border-purple-500/30',
        bgCritical: 'bg-purple-600/15 border-purple-600/40',
        iconColor: 'text-purple-500',
    },
    injury: {
        icon: Heart,
        label: 'Lesión',
        bgWarning: 'bg-red-500/10 border-red-500/30',
        bgCritical: 'bg-red-600/20 border-red-600/50',
        iconColor: 'text-red-500',
    },
    strength: {
        icon: Activity,
        label: 'Fuerza',
        bgWarning: 'bg-emerald-500/10 border-emerald-500/30',
        bgCritical: 'bg-emerald-600/15 border-emerald-600/40',
        iconColor: 'text-emerald-500',
    },
};

export function DashboardAlerts({ alerts, itemVariant }: DashboardAlertsProps) {
    if (alerts.length === 0) {
        return (
            <motion.div variants={itemVariant}>
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-lg">✓</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Sin alertas activas</p>
                                <p className="text-xs text-muted-foreground">Todos los indicadores dentro de parámetros normales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    return (
        <motion.div variants={itemVariant}>
            <Card className={criticalCount > 0 ? 'border-red-500/40 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className={criticalCount > 0 ? 'text-red-500' : 'text-amber-500'} size={20} />
                            Alertas Inteligentes
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {criticalCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs font-semibold">
                                    {criticalCount} crítica{criticalCount > 1 ? 's' : ''}
                                </span>
                            )}
                            {warningCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-semibold">
                                    {warningCount} aviso{warningCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {alerts.map((alert, i) => {
                            const config = ALERT_CONFIG[alert.type];
                            const Icon = config.icon;
                            const bgClass = alert.severity === 'critical' ? config.bgCritical : config.bgWarning;

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass} transition-all hover:scale-[1.01]`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-white/10'}`}>
                                        <Icon size={16} className={alert.severity === 'critical' ? 'text-red-500' : config.iconColor} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {alert.playerId ? (
                                                <Link
                                                    href={`/players/${alert.playerId}`}
                                                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                                                >
                                                    {alert.player}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-bold text-foreground">{alert.player}</p>
                                            )}
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                alert.severity === 'critical'
                                                    ? 'bg-red-500/30 text-red-400'
                                                    : 'bg-amber-500/30 text-amber-400'
                                            }`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.msg}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
