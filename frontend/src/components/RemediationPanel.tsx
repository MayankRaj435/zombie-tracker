import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, AlertTriangle, Check, Clock, Zap } from 'lucide-react';

interface RemediationPanelProps {
    onAction: (action: string, params: { resourceId: string }) => Promise<void>;
    isProcessing: boolean;
}

const tabs = ['manual', 'scheduled', 'history'] as const;

export const RemediationPanel = ({ onAction, isProcessing }: RemediationPanelProps) => {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('manual');
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: string; resourceId: string } | null>(null);

    const handleActionClick = (type: string, resourceId: string) => {
        setPendingAction({ type, resourceId });
        setShowConfirm(true);
    };

    const confirmAction = async () => {
        if (pendingAction) {
            await onAction(pendingAction.type, { resourceId: pendingAction.resourceId });
            setShowConfirm(false);
            setPendingAction(null);
        }
    };

    return (
        <div className="premium-panel w-full rounded-lg p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        <Zap className="h-4 w-4" />
                        Remediation workflow
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Remediation Center</h2>
                    <p className="mt-1 text-sm text-slate-500">Review, schedule, and execute cloud cleanup actions.</p>
                </div>
                <div className="flex w-fit gap-1 rounded-lg border border-white/10 bg-slate-950/40 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition-all ${activeTab === tab
                                ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/15'
                                : 'text-slate-400 hover:bg-white/[0.055] hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[320px]">
                {activeTab === 'manual' && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-cyan-300/16 bg-cyan-300/10 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg border border-cyan-300/16 bg-cyan-300/10 p-2 text-cyan-100">
                                    <Play className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-cyan-50">Quick actions</h3>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                        Execute immediate remediation on selected resources or stage changes for approval.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[
                                { title: 'i-0a1b2c3d4e5f', meta: 'EC2 instance | t2.micro', action: 'terminate', tone: 'rose' },
                                { title: 'vol-0a1b2c3d4e5f', meta: 'EBS volume | 100 GB', action: 'delete', tone: 'amber' },
                            ].map((item) => (
                                <div key={item.title} className="premium-card rounded-lg p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-mono text-sm font-semibold text-white">{item.title}</h4>
                                            <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                                        </div>
                                        <button
                                            onClick={() => handleActionClick(item.action, item.title)}
                                            className={`rounded-lg border p-2 transition-colors ${item.tone === 'rose'
                                                ? 'border-rose-300/20 bg-rose-300/10 text-rose-200 hover:bg-rose-300/15'
                                                : 'border-amber-300/20 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15'
                                                }`}
                                            title="Execute"
                                        >
                                            <Play className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'scheduled' && (
                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.025] text-center">
                        <Calendar className="mb-3 h-12 w-12 text-slate-500" />
                        <p className="font-medium text-white">No scheduled actions configured</p>
                        <button className="mt-4 rounded-lg border border-cyan-300/16 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">
                            Create Schedule
                        </button>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3 transition-colors hover:border-emerald-300/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300/16 bg-emerald-300/10">
                                        <Check className="h-4 w-4 text-emerald-200" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Terminated i-1234567890abcdef0</p>
                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            2 hours ago | Automated
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full border border-emerald-300/16 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                                    Success
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                                Are you sure you want to <strong>{pendingAction?.type}</strong> resource <strong>{pendingAction?.resourceId}</strong>?
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
                                    {isProcessing && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
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
