import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConnectAWS from './auth/ConnectAWS';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Trash2, RefreshCw,
  DollarSign, Server, HardDrive, Globe,
  AlertTriangle
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  const fetchResults = async () => {
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
  };

  useEffect(() => {
    if (token && user?.awsConnected) {
      fetchResults();
    } else {
      setIsFetching(false);
    }
  }, [token, user?.awsConnected]);

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
    } catch (err: any) {
      setError(err.message || 'Failed to run a new scan. Please try again.');
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

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResourceAction = async (action: string, params: any) => {
    if (!token) return;
    console.log(`Action: ${action}`, params);

    // Check if params has ID directly or in nested object
    const resourceId = params?.resourceId || params?.id;

    if (!resourceId) {
      console.error("Resource ID missing for action", action);
      return;
    }

    try {
      let endpoint = '';
      let body = {};

      // Map actions to endpoints
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
        console.warn("Unknown action", action);
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

      // Refresh data
      await fetchResults();

    } catch (err) {
      console.error("Remediation error", err);
      setError("Failed to execute remediation action");
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

  // Generate sparkline data (mock data for now)
  const generateSparkline = () => Array.from({ length: 7 }, () => Math.random() * 100);

  if (!user?.awsConnected) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen p-6">
          <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudGuardLogo size={48} />
              <div>
                <h1 className="text-2xl font-bold text-white">CloudGuard Dashboard</h1>
                <p className="text-slate-400 text-sm">Intelligent cloud waste detection</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={logout} className="glass-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white/5 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                title="Delete Account"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </header>
          <ConnectAWS />
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <GlasmorphicSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <div className="flex-1 ml-20 lg:ml-60 p-6 pb-20 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <CloudGuardLogo size={48} />
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user?.name || 'User'}!</h1>
                  <p className="text-slate-400 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    All systems operational
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunScan}
                  disabled={isScanning || isFetching}
                  className="glass-button px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Scan Now
                    </>
                  )}
                </motion.button>

                <button onClick={logout} className="bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.header>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-200"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Animate Page Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'dashboard' && (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <EnhancedStatCard
                        title="Potential Savings"
                        value={totalSavings}
                        prefix="$"
                        suffix="/mo"
                        icon={DollarSign}
                        color="green"
                        trend={-15.3}
                        sparklineData={generateSparkline()}
                      />
                      <EnhancedStatCard
                        title="Idle Instances"
                        value={instances.length}
                        icon={Server}
                        color="blue"
                        trend={-8.2}
                        sparklineData={generateSparkline()}
                      />
                      <EnhancedStatCard
                        title="Orphaned Volumes"
                        value={volumes.length}
                        icon={HardDrive}
                        color="purple"
                        trend={5.1}
                        sparklineData={generateSparkline()}
                      />
                      <EnhancedStatCard
                        title="Unattached IPs"
                        value={eips.length}
                        icon={Globe}
                        color="orange"
                        trend={0}
                        sparklineData={generateSparkline()}
                      />
                    </div>

                    {/* Security Alerts */}
                    <div className="mb-8">
                      <SecurityAlerts issues={securityIssues} />
                    </div>

                    {/* Cost Analysis Chart */}
                    <div className="glass-panel p-6 rounded-2xl mb-8">
                      <h2 className="text-xl font-bold text-white mb-6">Cost Analysis</h2>
                      <StatisticsChart />
                    </div>

                    {/* Resources Section */}
                    <div className="space-y-8">
                      {/* Idle Instances */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Server className="w-6 h-6 text-blue-400" />
                            Idle EC2 Instances
                            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                              {instances.length}
                            </span>
                          </h2>
                          {selectedResources.size > 0 && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                            >
                              Terminate Selected ({selectedResources.size})
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {instances.map((instance) => (
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
                              onAction={(action) => handleResourceAction(action, { resourceId: instance.instanceId, type: 'instance' })}
                              selected={selectedResources.has(instance.id)}
                              onSelect={handleResourceSelect}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Orphaned Volumes */}
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
                          <HardDrive className="w-6 h-6 text-purple-400" />
                          Orphaned EBS Volumes
                          <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {volumes.length}
                          </span>
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {volumes.map((volume) => (
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
                              onAction={(action) => handleResourceAction(action, { resourceId: volume.volumeId, type: 'volume' })}
                              selected={selectedResources.has(volume.id)}
                              onSelect={handleResourceSelect}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Unattached EIPs */}
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
                          <Globe className="w-6 h-6 text-orange-400" />
                          Unattached Elastic IPs
                          <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {eips.length}
                          </span>
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {eips.map((eip) => (
                            <ResourceCard
                              key={eip.id}
                              id={eip.id}
                              title={eip.allocationId}
                              subtitle={eip.publicIp || undefined}
                              status="warning"
                              metadata={[
                                { label: 'Public IP', value: eip.publicIp || 'N/A' }
                              ]}
                              onAction={(action) => handleResourceAction(action, { resourceId: eip.allocationId, type: 'eip' })}
                              selected={selectedResources.has(eip.id)}
                              onSelect={handleResourceSelect}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
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
                    {/* Reuse existing chart for history */}
                    <div className="glass-panel p-6 rounded-2xl">
                      <h2 className="text-xl font-bold text-white mb-6">Historical Spending</h2>
                      <StatisticsChart />
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <ComplianceDashboard />
                )}

                {activeSection === 'reports' && (
                  <div className="glass-panel p-8 text-center rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-2">Reports</h2>
                    <p className="text-slate-400">PDF reporting feature coming soon.</p>
                  </div>
                )}

                {activeSection === 'settings' && (
                  <div className="glass-panel p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white">AWS Connection</h3>
                        <p className="text-sm text-slate-400">Connected to Region: {user?.awsRegion}</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-panel w-full max-w-md p-6 rounded-2xl border-red-500/30"
                  >
                    <div className="flex items-center gap-3 mb-4 text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="text-xl font-bold">Delete Account</h3>
                    </div>
                    <p className="text-slate-300 mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg hover:bg-white/5 text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Floating Action Menu */}
        <FloatingActionMenu onAction={handleFABAction} />

        {/* Command Palette */}
        <CommandPalette />
      </div>
    </AnimatedBackground>
  );
}
