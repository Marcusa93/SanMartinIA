import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerChartsProps {
    gpsChartData: any[];
    cmjData: any[];
}

export function PlayerCharts({ gpsChartData, cmjData }: PlayerChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
                <CardHeader><CardTitle>Carga externa (distancia)</CardTitle></CardHeader>
                <CardContent>
                    {gpsChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={gpsChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                                <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} domain={['dataMin - 500', 'dataMax + 500']} />
                                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12 }} />
                                <Line type="monotone" dataKey="distancia" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="text-sm text-muted-foreground text-center py-8">Sin datos de GPS.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Saltos CMJ</CardTitle></CardHeader>
                <CardContent>
                    {cmjData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={cmjData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} />
                                <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} domain={['dataMin - 3', 'dataMax + 3']} />
                                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-foreground)', fontSize: 12 }} />
                                <Line type="monotone" dataKey="altura" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="text-sm text-muted-foreground text-center py-8">Sin datos de saltos.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
