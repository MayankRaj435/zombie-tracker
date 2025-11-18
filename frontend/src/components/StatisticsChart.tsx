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
import '../App.css';

const API_URL = 'http://localhost:3001';

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
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (isLoading) {
    return (
      <div className="data-card">
        <div className="data-card-header">
          <div className="data-card-title">
            <span className="data-card-icon">📊</span>
            <h2>Statistics & Trends</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary"
            style={{ minWidth: 'auto', padding: '0.5rem 1rem' }}
          >
            <span className="btn-icon">{isExpanded ? '📉' : '📈'}</span>
            {isExpanded ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
        {isExpanded && (
          <div className="data-card-body">
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>Loading statistics...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className="data-card">
        <div className="data-card-header">
          <div className="data-card-title">
            <span className="data-card-icon">📊</span>
            <h2>Statistics & Trends</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary"
            style={{ minWidth: 'auto', padding: '0.5rem 1rem' }}
          >
            <span className="btn-icon">{isExpanded ? '📉' : '📈'}</span>
            {isExpanded ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
        {isExpanded && (
          <div className="data-card-body">
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>No Data Available</h3>
              <p>Run a scan to start tracking statistics over time.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = statistics.map(stat => ({
    ...stat,
    dateFormatted: formatDate(stat.date),
  }));

  return (
    <div className="data-card">
      <div className="data-card-header">
        <div className="data-card-title">
          <span className="data-card-icon">📊</span>
          <h2>Statistics & Trends</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {summary && (
            <div className="data-card-badge">
              Total: ${summary.totalCost.toFixed(2)}/mo
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary"
            style={{ minWidth: 'auto', padding: '0.5rem 1rem' }}
          >
            <span className="btn-icon">{isExpanded ? '📉' : '📈'}</span>
            {isExpanded ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="data-card-body">
          {/* Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem', 
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                Time Range:
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="statistics-select"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                Chart Type:
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'bar')}
                className="statistics-select"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>

        {/* Resource Count Chart */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '1rem', 
            fontSize: '1.2rem',
            fontWeight: 700,
          }}>
            Resource Count Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="dateFormatted" 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 13, 46, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="instances" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  name="Idle Instances"
                  dot={{ fill: '#667eea', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volumes" 
                  stroke="#f093fb" 
                  strokeWidth={2}
                  name="Orphaned Volumes"
                  dot={{ fill: '#f093fb', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="eips" 
                  stroke="#4facfe" 
                  strokeWidth={2}
                  name="Unattached EIPs"
                  dot={{ fill: '#4facfe', r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="dateFormatted" 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 13, 46, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Bar dataKey="instances" fill="#667eea" name="Idle Instances" />
                <Bar dataKey="volumes" fill="#f093fb" name="Orphaned Volumes" />
                <Bar dataKey="eips" fill="#4facfe" name="Unattached EIPs" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Cost Chart */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '1rem', 
            fontSize: '1.2rem',
            fontWeight: 700,
          }}>
            Estimated Monthly Cost Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="dateFormatted" 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 13, 46, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend 
                  wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalCost" 
                  stroke="#00f2fe" 
                  strokeWidth={3}
                  name="Daily Cost"
                  dot={{ fill: '#00f2fe', r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="dateFormatted" 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 13, 46, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend 
                  wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Bar 
                  dataKey="totalCost" 
                  fill="#00f2fe"
                  name="Daily Cost"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}>
            <div style={{
              background: 'rgba(102, 126, 234, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.4)',
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Total Instances
              </div>
              <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>
                {summary.totalInstances}
              </div>
            </div>
            <div style={{
              background: 'rgba(240, 147, 251, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(240, 147, 251, 0.4)',
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Total Volumes
              </div>
              <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>
                {summary.totalVolumes}
              </div>
            </div>
            <div style={{
              background: 'rgba(79, 172, 254, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(79, 172, 254, 0.4)',
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Total EIPs
              </div>
              <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>
                {summary.totalEips}
              </div>
            </div>
            <div style={{
              background: 'rgba(0, 242, 254, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 242, 254, 0.4)',
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Total Cost
              </div>
              <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>
                ${summary.totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

