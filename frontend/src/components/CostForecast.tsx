import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { TrendingUp, AlertOctagon, Activity } from 'lucide-react';

const data = [
    { day: '1', cost: 45 },
    { day: '5', cost: 52 },
    { day: '10', cost: 48 },
    { day: '15', cost: 61 },
    { day: '20', cost: 55 },
    { day: '25', cost: 67 },
    { day: '30', cost: 72 },
    { day: '35', cost: 75, isForecast: true },
    { day: '40', cost: 79, isForecast: true },
];

const forecastStats = [
    { label: 'Current spend', value: '$67.00', color: 'text-white', icon: Activity },
    { label: 'Projected 30d', value: '$85.20', color: 'text-cyan-200', icon: TrendingUp },
    { label: 'Budget status', value: 'On Track', color: 'text-emerald-200', icon: AlertOctagon },
];

export const CostForecast = () => {
    return (
        <div className="premium-panel rounded-lg p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        <TrendingUp className="h-4 w-4" />
                        Cost forecast
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Spend trajectory and anomaly detection</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Projected spend for the next 30 days based on usage trends and recent scan history.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100">
                    <AlertOctagon className="h-4 w-4" />
                    1 anomaly detected
                </div>
            </div>

            <div className="h-[320px] w-full rounded-lg border border-white/10 bg-slate-950/30 p-3">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" unit="$" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(4, 12, 23, 0.96)',
                                border: '1px solid rgba(226, 232, 240, 0.14)',
                                borderRadius: 8,
                                boxShadow: '0 18px 40px rgba(0,0,0,0.32)',
                            }}
                            itemStyle={{ color: '#e2e8f0' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <ReferenceArea x1="14" x2="16" stroke="none" fill="#fb7185" fillOpacity={0.12} />
                        <Line
                            type="monotone"
                            dataKey="cost"
                            stroke="#22d3ee"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#040712' }}
                            activeDot={{ r: 7, strokeWidth: 0, fill: '#34d399' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                {forecastStats.map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm text-slate-500">{label}</div>
                                <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
                            </div>
                            <Icon className="h-5 w-5 text-slate-500" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
