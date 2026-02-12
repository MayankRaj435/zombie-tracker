import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { TrendingUp, AlertOctagon } from 'lucide-react';

const data = [
    { day: '1', cost: 45 },
    { day: '5', cost: 52 },
    { day: '10', cost: 48 },
    { day: '15', cost: 61 }, // Anomaly
    { day: '20', cost: 55 },
    { day: '25', cost: 67 },
    { day: '30', cost: 72 }, // Forecast start
    { day: '35', cost: 75, isForecast: true },
    { day: '40', cost: 79, isForecast: true },
];

export const CostForecast = () => {
    // In real app, fetch from /api/costs/forecast

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                        Cost Forecast & Anomaly Detection
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Projected spend for next 30 days based on usage trends</p>
                </div>
                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                    <AlertOctagon className="w-4 h-4" />
                    1 Anomaly Detected
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" unit="$" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        {/* Historical Data */}
                        <Line
                            type="monotone"
                            dataKey="cost"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />

                        {/* Anomaly Highlight */}
                        <ReferenceArea x1="14" x2="16" stroke="none" fill="#ef4444" fillOpacity={0.1} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-sm text-slate-400">Current Spend</div>
                    <div className="text-xl font-bold text-white">$67.00</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-blue-500/30">
                    <div className="text-sm text-blue-300">Projected (30d)</div>
                    <div className="text-xl font-bold text-blue-400">$85.20</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-sm text-slate-400">Budget Status</div>
                    <div className="text-xl font-bold text-green-400">On Track</div>
                </div>
            </div>
        </div>
    );
};
