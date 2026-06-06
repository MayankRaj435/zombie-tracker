import { motion } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

interface SecurityIssue {
    id: string;
    groupId: string;
    groupName: string | null;
    description: string;
    severity: "High" | "Medium" | "Low";
    createdAt: string;
}

interface SecurityAlertsProps {
    issues: SecurityIssue[];
}

const severityClass = {
    High: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
    Medium: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
    Low: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
};

const SecurityAlerts = ({ issues }: SecurityAlertsProps) => {
    if (!issues || issues.length === 0) {
        return (
            <div className="premium-panel rounded-lg p-5">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-emerald-300/16 bg-emerald-300/10 p-2 text-emerald-200">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Security Alerts</h2>
                            <p className="text-xs text-slate-500">Guardrail scan results</p>
                        </div>
                    </div>
                    <span className="rounded-full border border-emerald-300/16 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                        Clear
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] p-8 text-center">
                    <CheckCircle2 className="mb-3 h-11 w-11 text-emerald-300/70" />
                    <p className="font-medium text-white">No security issues detected</p>
                    <p className="mt-1 text-sm text-slate-500">Your latest scan is clean.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-panel rounded-lg p-5">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-rose-300/16 bg-rose-300/10 p-2 text-rose-200">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Security Alerts</h2>
                        <p className="text-xs text-slate-500">{issues.length} findings need triage</p>
                    </div>
                </div>
                <span className="rounded-full border border-rose-300/16 bg-rose-300/10 px-2.5 py-1 text-xs font-semibold text-rose-200">
                    Action
                </span>
            </div>

            <div className="space-y-3">
                {issues.slice(0, 4).map((issue, index) => (
                    <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`rounded-lg border p-3 ${severityClass[issue.severity]}`}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold">
                                    {issue.severity} Risk: {issue.groupName || issue.groupId}
                                </h3>
                                <p className="mt-1 text-xs leading-5 opacity-75">{issue.description}</p>
                                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.14em] opacity-50">
                                    Detected {new Date(issue.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SecurityAlerts;
