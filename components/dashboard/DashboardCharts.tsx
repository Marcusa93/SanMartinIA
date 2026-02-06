'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, LineChart, Line, ComposedChart, Legend
} from 'recharts';
import Player360Viewer from '../Player360Viewer';

interface DashboardChartsProps {
    stats: {
        top5: any[];
        loadBySession: any[];
        dailyLoad: any[];
        cmjTrend: any[];
        speedTrend: any[];
    };
    itemVariant: any;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-xs text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
                    {p.name}: <span className="font-medium text-foreground">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export function DashboardCharts({ stats, itemVariant }: DashboardChartsProps) {
    return (
        <>
            {/* Row 1: Top 5 + Player360 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={itemVariant}>
                    <Card className="overflow-hidden h-full">
                        <CardHeader><CardTitle>🏆 Top 5 — Distancia acumulada (14d)</CardTitle></CardHeader>
                        <CardContent>
                            {stats.top5.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={stats.top5} layout="vertical" margin={{ left: 10, right: 20 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                                        <XAxis type="number" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}km`} />
                                        <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total" name="Distancia (m)" fill="url(#colorTotal)" radius={[0, 6, 6, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos.</p>}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariant}>
                    <Player360Viewer
                        modelUrl="/Lucas_Diarte_360_alpha_v2.webm"
                        className="h-[280px] md:h-[350px] w-full"
                        label={stats.top5[0]?.name || "Jugador Destacado"}
                    />
                </motion.div>
            </div>

            {/* Row 2: Daily Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Daily Load & Distance */}
                <motion.div variants={itemVariant}>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📈 Carga diaria del equipo
                                <span className="text-xs font-normal text-muted-foreground">(últimos 7 días)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.dailyLoad.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <ComposedChart data={stats.dailyLoad} margin={{ left: 0, right: 10 }}>
                                        <defs>
                                            <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        <Area yAxisId="left" type="monotone" dataKey="distance" name="Distancia (km)" stroke="#3b82f6" strokeWidth={2} fill="url(#colorDistance)" />
                                        <Line yAxisId="right" type="monotone" dataKey="load" name="Player Load" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de carga diaria.</p>}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* CMJ Trend */}
                <motion.div variants={itemVariant}>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🦘 Tendencia CMJ
                                <span className="text-xs font-normal text-muted-foreground">(promedio equipo)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.cmjTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={stats.cmjTrend} margin={{ left: 0, right: 10 }}>
                                        <defs>
                                            <linearGradient id="colorCMJ" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}cm`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="height" name="CMJ (cm)" stroke="#10b981" strokeWidth={2} fill="url(#colorCMJ)" dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de CMJ.</p>}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Row 3: Speed Trend + Load by Session */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Speed Trend */}
                <motion.div variants={itemVariant}>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                ⚡ Velocidad máxima por sesión
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.speedTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={stats.speedTrend} margin={{ left: 0, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}km/h`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        <Line type="monotone" dataKey="max" name="Máx (km/h)" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                                        <Line type="monotone" dataKey="avg" name="Prom (km/h)" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} strokeDasharray="4 2" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de velocidad.</p>}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Load by Session */}
                <motion.div variants={itemVariant}>
                    <Card className="overflow-hidden">
                        <CardHeader><CardTitle>📊 Carga total por sesión</CardTitle></CardHeader>
                        <CardContent>
                            {stats.loadBySession.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={stats.loadBySession} margin={{ left: 0, right: 10 }}>
                                        <defs>
                                            <linearGradient id="colorSession" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total" name="Distancia (m)" fill="url(#colorSession)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos.</p>}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}
