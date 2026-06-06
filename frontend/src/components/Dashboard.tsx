import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import ConnectAWS from './auth/ConnectAWS';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Trash2,
  RefreshCw,
  DollarSign,
  Server,
  HardDrive,
  Globe,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Command,
  Download,
  Layers,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AnimatedBackground } from './ui/animated-background';
import { GlasmorphicSidebar } from './ui/glassmorphic-sidebar';
import { EnhancedStatCard } from './ui/enhanced-stat-card';
import { ResourceCard } from './ui/resource-card';
import { FloatingActionMenu } from './ui/floating-action-menu';
import { CommandPalette } from './ui/command-palette';
import SecurityAlerts from './SecurityAlerts';
import StatisticsChart from './StatisticsChart';
import { RemediationPanel } from './RemediationPanel';
import { RightSizingRecommendations } from './RightSizingRecommendations';
import { AlertConfiguration } from './AlertConfiguration';
import { CostForecast } from './CostForecast';
import { ComplianceDashboard } from './ComplianceDashboard';
import { CloudGuardLogo } from './ui/cloudguard-logo';

import { API_URL } from '../config';

interface IdleInstance {
  id: string;
  instanceId: string;
  instanceType: string | null;
  estimatedMonthlyCost: string | null;
  reason: string;
}

interface OrphanedVolume {
  id: string;
  volumeId: string;
  sizeGb: number | null;
  estimatedMonthlyCost: string | null;
  volumeType?: string;
}

interface UnattachedEIP {
  id: string;
  publicIp: string | null;
  allocationId: string;
}

interface SecurityIssue {
  id: string;
  groupId: string;
  groupName: string | null;
  description: string;
  severity: "High" | "Medium" | "Low";
  createdAt: string;
}

interface ResourceSectionHeaderProps {
  icon: ElementType;
  title: string;
  count: number;
  tone: 'cyan' | 'amber' | 'emerald';
  action?: ReactNode;
}

const sectionMeta: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'Cloud Command Center',
    description: 'Live cost, security, and remediation intelligence for your AWS estate.'
  },
  costs: {
    title: 'Cost Intelligence',
    description: 'Forecast spend, isolate anomalies, and track optimization velocity.'
  },
  remediation: {
    title: 'Remediation Center',
    description: 'Coordinate manual and scheduled cleanup actions with confidence.'
  },
  rightsizing: {
    title: 'Right-Sizing',
    description: 'Prioritize infrastructure changes that reduce waste without risking reliability.'
  },
  security: {
    title: 'Security Posture',
    description: 'Review compliance checks and cloud guardrail readiness.'
  },
  alerts: {
    title: 'Alert Routing',
    description: 'Tune thresholds and notify the right channels before spend or risk drifts.'
  },
  reports: {
    title: 'Reports',
    description: 'Package cloud savings, security posture, and remediation history for stakeholders.'
  },
  settings: {
    title: 'Workspace Settings',
    description: 'Manage account preferences and AWS connection details.'
  }
};

const toneClasses = {
  cyan: 'border-cyan-300/16 bg-cyan-300/10 text-cyan-100',
  amber: 'border-amber-300/16 bg-amber-300/10 text-amber-100',
  emerald: 'border-emerald-300/16 bg-emerald-300/10 text-emerald-100',
};

function ResourceSectionHeader({ icon: Icon, title, count, tone, action }: ResourceSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="text-sm text-slate-500">{count} resources awaiting review</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyResourceState({ label }: { label: string }) {
  return (
    <div className="premium-card rounded-lg border-dashed p-8 text-center">
      <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-emerald-300/70" />
      <p className="font-medium text-white">No {label} found</p>
      <p className="mt-1 text-sm text-slate-500">Run a fresh scan to keep this queue current.</p>
    </div>
  );
}

export default function Dashboard() {
  const { token, user, logout, deleteAccount } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [instances, setInstances] = useState<IdleInstance[]>([]);
  const [volumes, setVolumes] = useState<OrphanedVolume[]>([]);
  const [eips, setEips] = useState<UnattachedEIP[]>([]);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  const fetchResults = useCallback(async () => {
    if (!token) return;

    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setInstances(result.data.idleInstances);
      setVolumes(result.data.orphanedVolumes);
      setEips(result.data.unattachedEips);
      setSecurityIssues(result.data.securityIssues || []);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [logout, token]);

  useEffect(() => {
    if (token && user?.awsConnected) {
      fetchResults();
    } else {
      setIsFetching(false);
    }
  }, [fetchResults, token, user?.awsConnected]);

  const handleRunScan = async () => {
    if (!token) return;

    setIsScanning(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Scan initiation failed');
      }
      await fetchResults();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run a new scan. Please try again.';
      setError(message);
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const parseCost = (costString: string | null): number => {
    if (!costString || !costString.startsWith('$')) return 0;
    return parseFloat(costString.replace('$', ''));
  };

  const totalSavings =
    instances.reduce((acc, curr) => acc + parseCost(curr.estimatedMonthlyCost), 0) +
    volumes.reduce((acc, curr) => acc + parseCost(curr.estimatedMonthlyCost), 0);

  const totalFindings = instances.length + volumes.length + eips.length + securityIssues.length;
  const postureScore = Math.max(72, 100 - totalFindings * 3);
  const currentMeta = sectionMeta[activeSection] || sectionMeta.dashboard;

  const sparklineData = useMemo(() => ({
    savings: [31, 36, 44, 41, 53, 57, 68],
    instances: [9, 8, 8, 6, 7, 5, instances.length || 4],
    volumes: [4, 5, 4, 6, 5, 4, volumes.length || 3],
    eips: [2, 2, 3, 2, 2, 1, eips.length || 1],
  }), [eips.length, instances.length, volumes.length]);

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/login';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
      setError(message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResourceAction = async (action: string, params: { resourceId?: string; id?: string }) => {
    if (!token) return;

    const resourceId = params?.resourceId || params?.id;

    if (!resourceId) {
      console.error('Resource ID missing for action', action);
      return;
    }

    try {
      let endpoint = '';
      let body = {};

      if (action === 'terminate' || action === 'stop') {
        endpoint = '/api/remediation/instance';
        body = { instanceId: resourceId, action };
      } else if (action === 'delete') {
        endpoint = '/api/remediation/volume';
        body = { volumeId: resourceId };
      } else if (action === 'release') {
        endpoint = '/api/remediation/eip';
        body = { allocationId: resourceId };
      } else {
        console.warn('Unknown action', action);
        return;
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Action failed');

      await fetchResults();
    } catch (err) {
      console.error('Remediation error', err);
      setError('Failed to execute remediation action');
    }
  };

  const handleResourceSelect = (id: string, selected: boolean) => {
    setSelectedResources(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleFABAction = (action: string) => {
    switch (action) {
      case 'scan':
        handleRunScan();
        break;
      case 'export':
        console.log('Export report');
        break;
      case 'settings':
        setActiveSection('settings');
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const deleteAccountModal = (
    <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            className="premium-panel w-full max-w-md rounded-lg border-rose-300/30 p-6"
          >
            <div className="mb-4 flex items-center gap-3 text-rose-200">
              <div className="rounded-lg border border-rose-300/16 bg-rose-300/10 p-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Delete Account</h3>
            </div>
            <p className="mb-5 text-sm leading-6 text-slate-300">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-400"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!user?.awsConnected) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen p-5 md:p-8">
          <header className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CloudGuardLogo size={46} />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">CloudGuard</h1>
                <p className="text-sm text-slate-400">Connect AWS to activate the command center</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={logout} className="btn-ghost flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-300/15"
                title="Delete Account"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </span>
              </button>
            </div>
          </header>
          <ConnectAWS />
        </div>
        {deleteAccountModal}
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen">
        <GlasmorphicSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="min-w-0 flex-1 px-4 py-5 pb-24 pl-[92px] transition-all duration-300 md:px-7 lg:pl-[276px]">
          <div className="mx-auto max-w-[1500px]">
            <motion.header
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
            >
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-emerald-300/16 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                    <span className="status-dot" />
                    All systems operational
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-300">
                    <CalendarDays className="h-3.5 w-3.5 text-cyan-200" />
                    Region {user?.awsRegion || 'global'}
                  </div>
                </div>
                <h1 className="app-text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {currentMeta.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                  {currentMeta.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-ghost hidden items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold sm:flex">
                  <Command className="h-4 w-4" />
                  Ctrl K
                </button>
                <button className="btn-ghost flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunScan}
                  disabled={isScanning || isFetching}
                  className="premium-button flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
                >
                  <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Run Scan'}
                </motion.button>
                <button onClick={logout} className="btn-ghost flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.header>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 rounded-lg border border-rose-300/20 bg-rose-300/10 p-4 text-rose-100"
              >
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24 }}
              >
                {activeSection === 'dashboard' && (
                  <div className="space-y-7">
                    <section className="premium-panel scan-line rounded-lg p-5 md:p-6">
                      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
                        <div>
                          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                            <Sparkles className="h-4 w-4" />
                            Autonomous cloud savings cockpit
                          </div>
                          <h2 className="app-text-balance max-w-3xl text-2xl font-semibold tracking-tight text-white md:text-3xl">
                            ${totalSavings.toFixed(2)} in monthly waste is ready for review.
                          </h2>
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                            CloudGuard blends cost telemetry, security drift, and remediation workflows into one live AWS operating surface.
                          </p>
                          <div className="mt-5 flex flex-wrap gap-3">
                            <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Findings</p>
                              <p className="mt-1 text-lg font-semibold text-white">{totalFindings}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Security issues</p>
                              <p className="mt-1 text-lg font-semibold text-white">{securityIssues.length}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Selected</p>
                              <p className="mt-1 text-lg font-semibold text-white">{selectedResources.size}</p>
                            </div>
                          </div>
                        </div>

                        <div className="premium-card rounded-lg p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">Protection score</p>
                              <p className="mt-1 text-xs text-slate-500">Cost and guardrail posture</p>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-emerald-200" />
                          </div>
                          <div className="mt-5 flex items-end gap-3">
                            <p className="number-tabular text-5xl font-semibold tracking-tight text-gradient-cyan">{postureScore}</p>
                            <p className="mb-2 text-sm font-semibold text-slate-400">/100</p>
                          </div>
                          <div className="mt-5 h-2 rounded-full bg-white/8">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${postureScore}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                            />
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <span>Target 90</span>
                            <span className="text-emerald-200">Healthy trend</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <EnhancedStatCard
                        title="Potential Savings"
                        value={totalSavings}
                        prefix="$"
                        suffix="/mo"
                        icon={DollarSign}
                        color="green"
                        trend={-15.3}
                        sparklineData={sparklineData.savings}
                      />
                      <EnhancedStatCard
                        title="Idle Instances"
                        value={instances.length}
                        icon={Server}
                        color="blue"
                        trend={-8.2}
                        sparklineData={sparklineData.instances}
                      />
                      <EnhancedStatCard
                        title="Orphaned Volumes"
                        value={volumes.length}
                        icon={HardDrive}
                        color="purple"
                        trend={5.1}
                        sparklineData={sparklineData.volumes}
                      />
                      <EnhancedStatCard
                        title="Unattached IPs"
                        value={eips.length}
                        icon={Globe}
                        color="orange"
                        trend={0}
                        sparklineData={sparklineData.eips}
                      />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
                      <section>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-semibold tracking-tight text-white">Cost Analysis</h2>
                            <p className="mt-1 text-sm text-slate-500">Historical waste signals and projected savings momentum.</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-slate-300">
                            <Activity className="h-4 w-4 text-cyan-200" />
                            Live telemetry
                          </div>
                        </div>
                        <StatisticsChart />
                      </section>

                      <aside className="space-y-5">
                        <SecurityAlerts issues={securityIssues} />
                        <div className="premium-panel rounded-lg p-5">
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">Optimization Runbook</h3>
                              <p className="mt-1 text-xs text-slate-500">Highest leverage next actions</p>
                            </div>
                            <Layers className="h-5 w-5 text-cyan-200" />
                          </div>
                          <div className="space-y-3">
                            {[
                              ['Terminate idle EC2', `${instances.length} candidates`, 'cyan'],
                              ['Delete orphaned EBS', `${volumes.length} volumes`, 'emerald'],
                              ['Release elastic IPs', `${eips.length} addresses`, 'amber'],
                            ].map(([label, value, tone]) => (
                              <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3">
                                <div>
                                  <p className="text-sm font-medium text-white">{label}</p>
                                  <p className="mt-0.5 text-xs text-slate-500">{value}</p>
                                </div>
                                <ArrowUpRight className={`h-4 w-4 ${tone === 'cyan' ? 'text-cyan-200' : tone === 'emerald' ? 'text-emerald-200' : 'text-amber-200'}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </aside>
                    </div>

                    <section className="space-y-6">
                      <ResourceSectionHeader
                        icon={Server}
                        title="Idle EC2 Instances"
                        count={instances.length}
                        tone="cyan"
                        action={selectedResources.size > 0 && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-300/15"
                          >
                            Terminate Selected ({selectedResources.size})
                          </motion.button>
                        )}
                      />
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {instances.length > 0 ? instances.map((instance) => (
                          <ResourceCard
                            key={instance.id}
                            id={instance.id}
                            title={instance.instanceId}
                            subtitle={instance.instanceType || undefined}
                            status="idle"
                            cost={instance.estimatedMonthlyCost || undefined}
                            metadata={[
                              { label: 'Type', value: instance.instanceType || 'N/A' },
                              { label: 'Status', value: 'Running' }
                            ]}
                            details={
                              <div className="text-sm text-slate-400">
                                <p>{instance.reason}</p>
                              </div>
                            }
                            onAction={(action) => handleResourceAction(action, { resourceId: instance.instanceId })}
                            selected={selectedResources.has(instance.id)}
                            onSelect={handleResourceSelect}
                          />
                        )) : <EmptyResourceState label="idle instances" />}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <ResourceSectionHeader icon={HardDrive} title="Orphaned EBS Volumes" count={volumes.length} tone="emerald" />
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {volumes.length > 0 ? volumes.map((volume) => (
                          <ResourceCard
                            key={volume.id}
                            id={volume.id}
                            title={volume.volumeId}
                            subtitle={`${volume.sizeGb || 0} GB`}
                            status="warning"
                            cost={volume.estimatedMonthlyCost || undefined}
                            metadata={[
                              { label: 'Size', value: `${volume.sizeGb || 0} GB` },
                              { label: 'Type', value: volume.volumeType || 'N/A' }
                            ]}
                            onAction={(action) => handleResourceAction(action, { resourceId: volume.volumeId })}
                            selected={selectedResources.has(volume.id)}
                            onSelect={handleResourceSelect}
                          />
                        )) : <EmptyResourceState label="orphaned volumes" />}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <ResourceSectionHeader icon={Globe} title="Unattached Elastic IPs" count={eips.length} tone="amber" />
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {eips.length > 0 ? eips.map((eip) => (
                          <ResourceCard
                            key={eip.id}
                            id={eip.id}
                            title={eip.allocationId}
                            subtitle={eip.publicIp || undefined}
                            status="warning"
                            metadata={[
                              { label: 'Public IP', value: eip.publicIp || 'N/A' }
                            ]}
                            onAction={(action) => handleResourceAction(action, { resourceId: eip.allocationId })}
                            selected={selectedResources.has(eip.id)}
                            onSelect={handleResourceSelect}
                          />
                        )) : <EmptyResourceState label="unattached IPs" />}
                      </div>
                    </section>
                  </div>
                )}

                {activeSection === 'remediation' && (
                  <RemediationPanel onAction={handleResourceAction} isProcessing={isDeleting} />
                )}

                {activeSection === 'rightsizing' && (
                  <RightSizingRecommendations />
                )}

                {activeSection === 'alerts' && (
                  <AlertConfiguration />
                )}

                {activeSection === 'costs' && (
                  <div className="space-y-6">
                    <CostForecast />
                    <section>
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold tracking-tight text-white">Historical Spending</h2>
                        <p className="mt-1 text-sm text-slate-500">Daily resource waste and cost exposure over time.</p>
                      </div>
                      <StatisticsChart />
                    </section>
                  </div>
                )}

                {activeSection === 'security' && (
                  <ComplianceDashboard />
                )}

                {activeSection === 'reports' && (
                  <div className="premium-panel rounded-lg p-10 text-center">
                    <FileReportIcon />
                    <h2 className="mt-5 text-xl font-semibold text-white">Executive Reports</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                      PDF reporting is queued for the next release. Export the current dashboard snapshot from the header.
                    </p>
                  </div>
                )}

                {activeSection === 'settings' && (
                  <div className="premium-panel rounded-lg p-6">
                    <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Workspace Settings</h2>
                        <p className="mt-1 text-sm text-slate-500">Manage account and AWS connection controls.</p>
                      </div>
                      <CloudGuardLogo size={42} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="premium-card rounded-lg p-4">
                        <h3 className="font-medium text-white">AWS Connection</h3>
                        <p className="mt-2 text-sm text-slate-400">Connected region: {user?.awsRegion}</p>
                        <p className="mt-1 text-xs text-emerald-200">Read-only scan permissions active</p>
                      </div>
                      <div className="premium-card rounded-lg p-4">
                        <h3 className="font-medium text-white">Account</h3>
                        <p className="mt-2 text-sm text-slate-400">{user?.email}</p>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="mt-4 flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-300/15"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {deleteAccountModal}
          </div>
        </main>

        <FloatingActionMenu onAction={handleFABAction} />
        <CommandPalette />
      </div>
    </AnimatedBackground>
  );
}

function FileReportIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-300/16 bg-cyan-300/10 text-cyan-100">
      <Download className="h-6 w-6" />
    </div>
  );
}
