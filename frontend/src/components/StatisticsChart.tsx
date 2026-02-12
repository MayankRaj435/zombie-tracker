import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
// framer-motion removed as it was unused
import { BarChart as BarChartIcon, LineChart as LineChartIcon, Calendar, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface StatisticsData {
  date: string;
  instances: number;
  volumes: number;
  eips: number;
  totalCost: number;
  cumulativeInstances: number;
  cumulativeVolumes: number;
  cumulativeEips: number;
  cumulativeCost: number;
}

export default function StatisticsChart() {
  const { token } = useAuth();
  const [statistics, setStatistics] = useState<StatisticsData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange, token]);

  const fetchStatistics = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/statistics?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data.data);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = statistics.map(stat => ({
    ...stat,
    dateFormatted: formatDate(stat.date),
  }));

  if (isLoading) {
    return (
      <div className="glass-panel p-8 rounded-2xl flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl flex items-center justify-center h-96 text-center">
        <div>
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-slate-400">Run a scan to start tracking statistics over time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${chartType === 'line'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <LineChartIcon className="w-4 h-4" />
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${chartType === 'bar'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <BarChartIcon className="w-4 h-4" />
            Bar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Count Chart */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6">Resource Count Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis
                    dataKey="dateFormatted"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="instances"
                    stroke="#818cf8"
                    strokeWidth={3}
                    name="Idle Instances"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volumes"
                    stroke="#f472b6"
                    strokeWidth={3}
                    name="Orphaned Volumes"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="eips"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    name="Unattached EIPs"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis
                    dataKey="dateFormatted"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="instances" fill="#818cf8" name="Idle Instances" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="volumes" fill="#f472b6" name="Orphaned Volumes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eips" fill="#38bdf8" name="Unattached EIPs" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Chart */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6">Estimated Monthly Cost</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis
                    dataKey="dateFormatted"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalCost"
                    stroke="#34d399"
                    strokeWidth={3}
                    name="Daily Cost"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis
                    dataKey="dateFormatted"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalCost"
                    fill="#34d399"
                    name="Daily Cost"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-indigo-300 text-sm font-medium mb-1">Total Instances</div>
            <div className="text-2xl font-bold text-white">{summary.totalInstances}</div>
          </div>
          <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <div className="text-pink-300 text-sm font-medium mb-1">Total Volumes</div>
            <div className="text-2xl font-bold text-white">{summary.totalVolumes}</div>
          </div>
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="text-sky-300 text-sm font-medium mb-1">Total EIPs</div>
            <div className="text-2xl font-bold text-white">{summary.totalEips}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-emerald-300 text-sm font-medium mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-white">${summary.totalCost.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

