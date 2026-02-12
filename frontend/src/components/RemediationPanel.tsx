import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, List, AlertTriangle, Check, X } from 'lucide-react';

interface RemediationPanelProps {
    onAction: (action: string, params: any) => Promise<void>;
    isProcessing: boolean;
}

export const RemediationPanel = ({ onAction, isProcessing }: RemediationPanelProps) => {
    const [activeTab, setActiveTab] = useState<'manual' | 'scheduled' | 'history'>('manual');
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
        <div className="glass-panel p-6 rounded-2xl w-full">
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Remediation Center</h2>
                <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg">
                    {(['manual', 'scheduled', 'history'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab
                                    ? 'bg-indigo-500 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'manual' && (
                    <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                            <Play className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-200">Quick Actions</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Execute immediate remediation actions on selected resources.
                                    Common actions include stopping idle instances or deleting unattached volumes.
                                </p>
                            </div>
                        </div>

                        {/* Example Action Items - In real app, these would be populated based on selected resources */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-white">i-0a1b2c3d4e5f (Idle)</h4>
                                        <p className="text-xs text-slate-400">EC2 Instance • t2.micro</p>
                                    </div>
                                    <button
                                        onClick={() => handleActionClick('terminate', 'i-0a1b2c3d4e5f')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                                        title="Terminate"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-white">vol-0a1b2c3d4e5f (Unused)</h4>
                                        <p className="text-xs text-slate-400">EBS Volume • 100 GB</p>
                                    </div>
                                    <button
                                        onClick={() => handleActionClick('delete', 'vol-0a1b2c3d4e5f')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-orange-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'scheduled' && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Calendar className="w-12 h-12 mb-3 opacity-50" />
                        <p>No scheduled actions configured</p>
                        <button className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
                            + Create Schedule
                        </button>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Terminated i-1234567890abcdef0</p>
                                        <p className="text-xs text-slate-500">2 hours ago • Automated</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">Success</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
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
                            className="glass-panel w-full max-w-sm p-6 rounded-2xl border-red-500/30"
                        >
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Confirm Action</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Are you sure you want to <strong>{pendingAction?.type}</strong> resource <strong>{pendingAction?.resourceId}</strong>?
                                This action may be irreversible.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 rounded-lg hover:bg-white/5 text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    disabled={isProcessing}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                                >
                                    {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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
