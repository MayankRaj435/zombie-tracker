import { useEffect, useState } from 'react';
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
import { BarChart as BarChartIcon, LineChart as LineChartIcon, Calendar, Activity } from 'lucide-react';

import { API_URL } from '../config';

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

interface StatisticsSummary {
  totalInstances: number;
  totalVolumes: number;
  totalEips: number;
  totalCost: number;
}

export default function StatisticsChart() {
  const { token } = useAuth();
  const [statistics, setStatistics] = useState<StatisticsData[]>([]);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
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

    fetchStatistics();
  }, [timeRange, token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = statistics.map(stat => ({
    ...stat,
    dateFormatted: formatDate(stat.date),
  }));

  const tooltipStyle = {
    background: 'rgba(4, 12, 23, 0.96)',
    border: '1px solid rgba(226, 232, 240, 0.14)',
    borderRadius: 8,
    color: 'white',
    boxShadow: '0 18px 40px rgba(0,0,0,0.32)',
  };

  if (isLoading) {
    return (
      <div className="premium-panel flex h-96 items-center justify-center rounded-lg p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-cyan-300/20 border-t-cyan-300 animate-spin" />
          <p className="font-medium text-slate-300">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className="premium-panel flex h-96 items-center justify-center rounded-lg p-8 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035]">
            <Activity className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">No data available</h3>
          <p className="text-slate-500">Run a scan to start tracking statistics over time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-200" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="premium-input rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div className="flex rounded-lg border border-white/10 bg-slate-950/40 p-1">
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all ${chartType === 'line'
              ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/15'
              : 'text-slate-400 hover:bg-white/[0.055] hover:text-white'
              }`}
          >
            <LineChartIcon className="h-4 w-4" />
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all ${chartType === 'bar'
              ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/15'
              : 'text-slate-400 hover:bg-white/[0.055] hover:text-white'
              }`}
          >
            <BarChartIcon className="h-4 w-4" />
            Bar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="premium-card rounded-lg p-5">
          <h3 className="mb-5 text-lg font-semibold text-white">Resource Count Over Time</h3>
          <div className="h-[315px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" vertical={false} />
                  <XAxis dataKey="dateFormatted" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="instances" stroke="#22d3ee" strokeWidth={3} name="Idle Instances" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="volumes" stroke="#34d399" strokeWidth={3} name="Orphaned Volumes" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="eips" stroke="#f59e0b" strokeWidth={3} name="Unattached EIPs" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" vertical={false} />
                  <XAxis dataKey="dateFormatted" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="instances" fill="#22d3ee" name="Idle Instances" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="volumes" fill="#34d399" name="Orphaned Volumes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eips" fill="#f59e0b" name="Unattached EIPs" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card rounded-lg p-5">
          <h3 className="mb-5 text-lg font-semibold text-white">Estimated Monthly Cost</h3>
          <div className="h-[315px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" vertical={false} />
                  <XAxis dataKey="dateFormatted" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="totalCost" stroke="#34d399" strokeWidth={3} name="Daily Cost" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" vertical={false} />
                  <XAxis dataKey="dateFormatted" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="totalCost" fill="#34d399" name="Daily Cost" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total Instances', value: summary.totalInstances, tone: 'text-cyan-200' },
            { label: 'Total Volumes', value: summary.totalVolumes, tone: 'text-emerald-200' },
            { label: 'Total EIPs', value: summary.totalEips, tone: 'text-amber-200' },
            { label: 'Total Cost', value: `$${summary.totalCost.toFixed(2)}`, tone: 'text-white' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-1 text-sm font-medium text-slate-500">{item.label}</div>
              <div className={`number-tabular text-2xl font-semibold ${item.tone}`}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
