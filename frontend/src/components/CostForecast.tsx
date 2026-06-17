import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    Legend,
} from 'recharts';
import { TrendingUp, AlertOctagon, Activity, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface CostDataPoint {
    date: string;
    amount: number;
}

interface Anomaly {
    date: string;
    amount: number;
    expectedAmount: number;
    deviation: number;
    score: number;
}

interface ChartPoint {
    label: string;       // formatted date label
    date: string;        // raw YYYY-MM-DD (for anomaly lookup)
    actual?: number;     // historical cost (real or mock)
    forecast?: number;   // projected cost
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CostForecast = () => {
    const { token } = useAuth();

    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [dataSource, setDataSource] = useState<'real' | 'mock'>('real');
    const [mockMessage, setMockMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Derived stats
    const lastActual = [...chartData].reverse().find(p => p.actual !== undefined)?.actual ?? 0;
    const forecastPoints = chartData.filter(p => p.forecast !== undefined);
    const projected30d = forecastPoints.length > 0
        ? forecastPoints[forecastPoints.length - 1].forecast ?? 0
        : 0;

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            // Fetch forecast + anomalies in parallel
            const [forecastRes, anomalyRes] = await Promise.all([
                fetch(`${API_URL}/api/costs/forecast?days=30`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/api/costs/anomalies`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (!forecastRes.ok || !anomalyRes.ok) {
                throw new Error('Failed to fetch cost data from server.');
            }

            const forecastJson = await forecastRes.json();
            const anomalyJson = await anomalyRes.json();

            // forecastJson: { dataSource, forecast: CostDataPoint[], message? }
            // anomalyJson:  { dataSource, anomalies: Anomaly[],      message? }

            const forecastPoints: CostDataPoint[] = forecastJson.forecast ?? [];
            const detectedAnomalies: Anomaly[] = anomalyJson.anomalies ?? [];

            setAnomalies(detectedAnomalies);
            setDataSource(forecastJson.dataSource ?? 'real');
            setMockMessage(forecastJson.message ?? anomalyJson.message ?? null);

            // We also need historical data to show on the chart.
            // Reuse /api/statistics which has daily cost from scans.
            // For Cost-Explorer-based history, re-fetch via the anomaly
            // endpoint's underlying history: we reconstruct it from anomaly
            // context. As a pragmatic solution, we fetch /api/statistics for
            // the historical curve and overlay the forecast.
            const statsRes = await fetch(`${API_URL}/api/statistics?days=30`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const statsJson = statsRes.ok ? await statsRes.json() : null;

            // Build the "actual" series from statistics (scan-derived costs)
            const historyMap = new Map<string, number>();
            if (statsJson?.data) {
                for (const row of statsJson.data) {
                    historyMap.set(row.date, row.totalCost);
                }
            }

            // If the backend returned mock history (no Cost Explorer perms),
            // and we have no scan history either, build from anomaly baseline data.
            // We derive "reconstructed history" from anomaly expected amounts
            // as a proxy — better than nothing.
            const anomalyByDate = new Map(detectedAnomalies.map(a => [a.date, a]));

            // Collect all historical dates (up to 30 days back)
            const today = new Date();
            const historicalPoints: ChartPoint[] = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const scanCost = historyMap.get(dateStr);
                // If we have scan-derived cost use it; otherwise fall back to
                // anomaly expected amount (gives a rough baseline curve)
                const anomaly = anomalyByDate.get(dateStr);
                const cost = scanCost !== undefined
                    ? scanCost
                    : anomaly
                        ? anomaly.amount        // real anomaly amount is actual spend
                        : undefined;

                historicalPoints.push({
                    label: formatDate(dateStr),
                    date: dateStr,
                    actual: cost,
                });
            }

            // Forecast points (future dates)
            const futurePoints: ChartPoint[] = forecastPoints.map(fp => ({
                label: formatDate(fp.date),
                date: fp.date,
                forecast: parseFloat(fp.amount.toFixed(2)),
            }));

            setChartData([...historicalPoints, ...futurePoints]);
        } catch (err: any) {
            console.error('CostForecast fetch error:', err);
            setError(err.message ?? 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    // ── Custom tooltip ──────────────────────────────────────────────────────────
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const point = chartData.find(p => p.label === label);
        const isAnomaly = anomalies.some(a => a.date === point?.date);

        return (
            <div className="rounded-lg border border-white/14 bg-[rgba(4,12,23,0.96)] p-3 shadow-2xl">
                <p className="mb-2 text-xs font-semibold text-slate-400">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
                        {p.name}: ${Number(p.value).toFixed(2)}
                    </p>
                ))}
                {isAnomaly && (
                    <p className="mt-1.5 rounded bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-300">
                        ⚠ Anomaly detected
                    </p>
                )}
            </div>
        );
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="premium-panel flex h-96 items-center justify-center rounded-lg p-8 text-center">
                <div>
                    <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-cyan-300/20 border-t-cyan-300 animate-spin" />
                    <p className="font-medium text-white">Loading cost forecast…</p>
                    <p className="mt-1 text-sm text-slate-500">Fetching data from AWS Cost Explorer.</p>
                </div>
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="premium-panel rounded-lg p-8 text-center">
                <AlertOctagon className="mx-auto mb-3 h-10 w-10 text-rose-400" />
                <p className="font-medium text-white">Failed to load cost data</p>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 rounded-lg border border-cyan-300/16 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
                >
                    Retry
                </button>
            </div>
        );
    }

    // ── Anomaly reference dots ─────────────────────────────────────────────────
    const anomalyDots = anomalies
        .map(a => {
            const point = chartData.find(p => p.date === a.date);
            return point ? { label: point.label, value: a.amount } : null;
        })
        .filter(Boolean) as { label: string; value: number }[];

    return (
        <div className="premium-panel rounded-lg p-5 md:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        <TrendingUp className="h-4 w-4" />
                        Cost forecast
                        {dataSource === 'mock' && (
                            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
                                Estimated
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                        Spend trajectory and anomaly detection
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        {dataSource === 'real'
                            ? 'Real spend from AWS Cost Explorer with 30-day linear regression forecast.'
                            : 'Estimated spend — grant ce:GetCostAndUsage to your IAM user to see real data.'}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    {anomalies.length > 0 ? (
                        <div className="flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100">
                            <AlertOctagon className="h-4 w-4" />
                            {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">
                            <Activity className="h-4 w-4" />
                            No anomalies
                        </div>
                    )}
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.055]"
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Mock data disclaimer */}
            {mockMessage && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300/16 bg-amber-300/10 p-3 text-sm text-amber-200">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{mockMessage}</span>
                </div>
            )}

            {/* Chart */}
            <div className="h-[320px] w-full rounded-lg border border-white/10 bg-slate-950/30 p-3">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.13)" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#94a3b8"
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
                        />

                        {/* Historical / actual spend */}
                        <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual spend"
                            stroke="#22d3ee"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }}
                            connectNulls={false}
                        />

                        {/* Forecast */}
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            name="Forecast"
                            stroke="#a78bfa"
                            strokeWidth={2.5}
                            strokeDasharray="6 4"
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#a78bfa' }}
                            connectNulls={false}
                        />

                        {/* Anomaly markers */}
                        {anomalyDots.map((dot) => (
                            <ReferenceDot
                                key={dot.label}
                                x={dot.label}
                                y={dot.value}
                                r={7}
                                fill="#fb7185"
                                stroke="#fff"
                                strokeWidth={1.5}
                                label={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stat cards */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm text-slate-500">Current daily spend</div>
                            <div className="mt-1 text-2xl font-semibold text-white">
                                {lastActual > 0 ? `$${lastActual.toFixed(2)}` : '—'}
                            </div>
                        </div>
                        <Activity className="h-5 w-5 text-slate-500" />
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm text-slate-500">Projected end-of-period</div>
                            <div className="mt-1 text-2xl font-semibold text-cyan-200">
                                {projected30d > 0 ? `$${projected30d.toFixed(2)}/day` : '—'}
                            </div>
                        </div>
                        <TrendingUp className="h-5 w-5 text-slate-500" />
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm text-slate-500">Anomalies detected</div>
                            <div className={`mt-1 text-2xl font-semibold ${anomalies.length > 0 ? 'text-rose-300' : 'text-emerald-200'}`}>
                                {anomalies.length}
                            </div>
                        </div>
                        <AlertOctagon className={`h-5 w-5 ${anomalies.length > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
                    </div>
                </div>
            </div>

            {/* Anomaly details */}
            {anomalies.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Anomaly detail</p>
                    {anomalies.map((a) => (
                        <div
                            key={a.date}
                            className="flex items-center justify-between rounded-lg border border-rose-300/16 bg-rose-300/10 px-4 py-3 text-sm"
                        >
                            <div>
                                <span className="font-semibold text-white">{formatDate(a.date)}</span>
                                <span className="ml-2 text-slate-400">
                                    Spent <span className="text-rose-300">${a.amount.toFixed(2)}</span>
                                    {' '}vs expected <span className="text-slate-300">${a.expectedAmount.toFixed(2)}</span>
                                </span>
                            </div>
                            <span className="shrink-0 rounded-full border border-rose-300/20 bg-rose-300/15 px-2 py-0.5 text-xs font-semibold text-rose-200">
                                z={a.score.toFixed(1)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
