import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Player360Viewer from '../Player360Viewer';

interface DashboardChartsProps {
    stats: {
        top5: any[];
        loadBySession: any[];
    };
    itemVariant: any;
}

export function DashboardCharts({ stats, itemVariant }: DashboardChartsProps) {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top 5 bar */}
                <motion.div variants={itemVariant}>
                    <Card className="overflow-hidden h-full">
                        <CardHeader><CardTitle>🏆 Top 5 — Distancia acumulada (14d)</CardTitle></CardHeader>
                        <CardContent>
                            {stats.top5.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.top5} layout="vertical" margin={{ left: 10, right: 20 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#D00000" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#D00000" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                                        <XAxis type="number" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="total" fill="url(#colorTotal)" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos.</p>}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3D Player Viewer Demo */}
                <motion.div variants={itemVariant}>
                    <Player360Viewer
                        modelUrl="/Lucas_Diarte_360_alpha_v2.webm"
                        className="h-[300px] md:h-[400px] w-full"
                        label={stats.top5[0]?.name || "Jugador Destacado"}
                    />
                </motion.div>
            </div>

            {/* Legacy Load Chart */}
            <motion.div variants={itemVariant}>
                <Card className="overflow-hidden">
                    <CardHeader><CardTitle>📊 Carga del equipo por sesión</CardTitle></CardHeader>
                    <CardContent>
                        {stats.loadBySession.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={stats.loadBySession}>
                                    <defs>
                                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos.</p>}
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}
