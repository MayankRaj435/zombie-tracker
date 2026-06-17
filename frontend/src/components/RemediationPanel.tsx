import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, AlertTriangle, Check, Clock, Zap, RefreshCw, Server, HardDrive, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface RemediationPanelProps {
    onAction: (action: string, params: { resourceId: string }) => Promise<void>;
    isProcessing: boolean;
    // Real data from the dashboard scan
    idleInstances?: { instanceId: string; instanceType: string | null; estimatedMonthlyCost: string | null }[];
    orphanedVolumes?: { volumeId: string; sizeGb: number | null; volumeType?: string; estimatedMonthlyCost: string | null }[];
    unattachedEips?: { publicIp: string | null; allocationId: string }[];
}

interface HistoryEntry {
    id: string;
    resourceId: string;
    resourceType: string;
    action: string;
    status: string;
    error?: string;
    executedAt: string;
}

const tabs = ['manual', 'scheduled', 'history'] as const;

const actionLabel: Record<string, string> = {
    stop: 'Stop',
    terminate: 'Terminate',
    delete: 'Delete',
    release: 'Release',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export const RemediationPanel = ({
    onAction,
    isProcessing,
    idleInstances = [],
    orphanedVolumes = [],
    unattachedEips = [],
}: RemediationPanelProps) => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('manual');
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: string; resourceId: string; label: string } | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchHistory = async () => {
        if (!token) return;
        setHistoryLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/remediation/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error('Failed to fetch remediation history', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, token]);

    const handleActionClick = (type: string, resourceId: string, label: string) => {
        setPendingAction({ type, resourceId, label });
        setShowConfirm(true);
    };

    const confirmAction = async () => {
        if (!pendingAction) return;
        await onAction(pendingAction.type, { resourceId: pendingAction.resourceId });
        setShowConfirm(false);
        setPendingAction(null);
        // Refresh history after action
        if (activeTab === 'history') fetchHistory();
    };

    const totalResources = idleInstances.length + orphanedVolumes.length + unattachedEips.length;

    return (
        <div className="premium-panel w-full rounded-lg p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        <Zap className="h-4 w-4" />
                        Remediation workflow
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Remediation Center</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {totalResources > 0
                            ? `${totalResources} resource${totalResources !== 1 ? 's' : ''} ready for action`
                            : 'Run a scan to populate resources'}
                    </p>
                </div>
                <div className="flex w-fit gap-1 rounded-lg border border-white/10 bg-slate-950/40 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition-all ${
                                activeTab === tab
                                    ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/15'
                                    : 'text-slate-400 hover:bg-white/[0.055] hover:text-white'
                            }`}
                        >
                            {tab}
                            {tab === 'history' && history.length > 0 && (
                                <span className="ml-1.5 rounded-full bg-cyan-300/20 px-1.5 py-0.5 text-xs text-cyan-200">
                                    {history.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[320px]">
                {/* ── MANUAL TAB ── */}
                {activeTab === 'manual' && (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-cyan-300/16 bg-cyan-300/10 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg border border-cyan-300/16 bg-cyan-300/10 p-2 text-cyan-100">
                                    <Play className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-cyan-50">Quick actions</h3>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                        Execute immediate remediation on scanned resources. All actions are logged.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {totalResources === 0 && (
                            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.025] text-center">
                                <Check className="mb-3 h-10 w-10 text-emerald-300/70" />
                                <p className="font-medium text-white">No resources flagged</p>
                                <p className="mt-1 text-sm text-slate-500">Run a scan from the dashboard to populate this list.</p>
                            </div>
                        )}

                        {/* Idle EC2 Instances */}
                        {idleInstances.length > 0 && (
                            <section>
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                                    <Server className="h-4 w-4" />
                                    Idle EC2 Instances ({idleInstances.length})
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {idleInstances.map((inst) => (
                                        <div key={inst.instanceId} className="premium-card rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h4 className="truncate font-mono text-sm font-semibold text-white">{inst.instanceId}</h4>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {inst.instanceType || 'Unknown type'}
                                                        {inst.estimatedMonthlyCost && ` · ${inst.estimatedMonthlyCost}/mo`}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        onClick={() => handleActionClick('stop', inst.instanceId, inst.instanceId)}
                                                        className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-300/15"
                                                        title="Stop instance"
                                                    >
                                                        Stop
                                                    </button>
                                                    <button
                                                        onClick={() => handleActionClick('terminate', inst.instanceId, inst.instanceId)}
                                                        className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-2.5 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-300/15"
                                                        title="Terminate instance"
                                                    >
                                                        Terminate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Orphaned EBS Volumes */}
                        {orphanedVolumes.length > 0 && (
                            <section>
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                                    <HardDrive className="h-4 w-4" />
                                    Orphaned EBS Volumes ({orphanedVolumes.length})
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {orphanedVolumes.map((vol) => (
                                        <div key={vol.volumeId} className="premium-card rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h4 className="truncate font-mono text-sm font-semibold text-white">{vol.volumeId}</h4>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {vol.sizeGb ?? '?'} GB {vol.volumeType ? `· ${vol.volumeType}` : ''}
                                                        {vol.estimatedMonthlyCost && ` · ${vol.estimatedMonthlyCost}/mo`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleActionClick('delete', vol.volumeId, vol.volumeId)}
                                                    className="shrink-0 rounded-lg border border-rose-300/20 bg-rose-300/10 px-2.5 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-300/15"
                                                    title="Delete volume (snapshot first)"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Unattached EIPs */}
                        {unattachedEips.length > 0 && (
                            <section>
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-200">
                                    <Globe className="h-4 w-4" />
                                    Unattached Elastic IPs ({unattachedEips.length})
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {unattachedEips.map((eip) => (
                                        <div key={eip.allocationId} className="premium-card rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h4 className="truncate font-mono text-sm font-semibold text-white">{eip.allocationId}</h4>
                                                    <p className="mt-0.5 text-xs text-slate-500">{eip.publicIp || 'No public IP'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleActionClick('release', eip.allocationId, eip.allocationId)}
                                                    className="shrink-0 rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-300/15"
                                                    title="Release EIP"
                                                >
                                                    Release
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* ── SCHEDULED TAB ── */}
                {activeTab === 'scheduled' && (
                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.025] text-center">
                        <Calendar className="mb-3 h-12 w-12 text-slate-500" />
                        <p className="font-medium text-white">No scheduled actions configured</p>
                        <p className="mt-1 text-sm text-slate-500">Scheduled remediation is coming in the next release.</p>
                    </div>
                )}

                {/* ── HISTORY TAB ── */}
                {activeTab === 'history' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Last 50 remediation actions</p>
                            <button
                                onClick={fetchHistory}
                                disabled={historyLoading}
                                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.055]"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {historyLoading && (
                            <div className="flex h-40 items-center justify-center">
                                <div className="h-8 w-8 rounded-full border-2 border-cyan-300/20 border-t-cyan-300 animate-spin" />
                            </div>
                        )}

                        {!historyLoading && history.length === 0 && (
                            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.025] text-center">
                                <Clock className="mb-3 h-10 w-10 text-slate-500" />
                                <p className="font-medium text-white">No actions yet</p>
                                <p className="mt-1 text-sm text-slate-500">Remediation actions will appear here after you execute them.</p>
                            </div>
                        )}

                        {!historyLoading && history.map((entry) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3 transition-colors hover:border-white/20"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                                        entry.status === 'success'
                                            ? 'border-emerald-300/16 bg-emerald-300/10'
                                            : 'border-rose-300/16 bg-rose-300/10'
                                    }`}>
                                        {entry.status === 'success'
                                            ? <Check className="h-4 w-4 text-emerald-200" />
                                            : <AlertTriangle className="h-4 w-4 text-rose-200" />
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white capitalize">
                                            {actionLabel[entry.action] || entry.action}{' '}
                                            <span className="font-mono">{entry.resourceId}</span>
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(entry.executedAt)} · {entry.resourceType}
                                            {entry.error && <span className="text-rose-400 truncate"> · {entry.error}</span>}
                                        </p>
                                    </div>
                                </div>
                                <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold capitalize ${
                                    entry.status === 'success'
                                        ? 'border-emerald-300/16 bg-emerald-300/10 text-emerald-200'
                                        : 'border-rose-300/16 bg-rose-300/10 text-rose-200'
                                }`}>
                                    {entry.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── CONFIRM MODAL ── */}
            <AnimatePresence>
                {showConfirm && (
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
                            className="premium-panel w-full max-w-sm rounded-lg border-rose-300/30 p-6"
                        >
                            <div className="mb-4 flex items-center gap-3 text-rose-200">
                                <div className="rounded-lg border border-rose-300/16 bg-rose-300/10 p-2">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-semibold">Confirm Action</h3>
                            </div>
                            <p className="mb-6 text-sm leading-6 text-slate-300">
                                Are you sure you want to{' '}
                                <strong className="text-white capitalize">{pendingAction?.type}</strong> resource{' '}
                                <strong className="font-mono text-white">{pendingAction?.label}</strong>?
                                {pendingAction?.type === 'delete' && (
                                    <span className="mt-2 block rounded-lg border border-amber-300/16 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
                                        A snapshot will be created automatically before deletion.
                                    </span>
                                )}
                                {pendingAction?.type === 'terminate' && (
                                    <span className="mt-2 block rounded-lg border border-rose-300/16 bg-rose-300/10 px-3 py-2 text-xs text-rose-200">
                                        ⚠ Termination is permanent and cannot be undone.
                                    </span>
                                )}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isProcessing}
                                    className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-400"
                                >
                                    {isProcessing && (
                                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    )}
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
