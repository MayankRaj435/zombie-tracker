import { Shield, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';

const checks = [
    { name: 'CIS 1.1: Root user MFA enabled', status: 'pass' },
    { name: 'CIS 1.2: Password policy strength', status: 'pass' },
    { name: 'CIS 1.3: Unused credentials disabled', status: 'fail' },
    { name: 'CIS 2.1: CloudTrail enabled', status: 'pass' },
    { name: 'CIS 2.2: CloudTrail log validation', status: 'pass' },
    { name: 'CIS 4.1: Security Groups restricted', status: 'warning' },
] as const;

const statusVisual = {
    pass: {
        icon: CheckCircle,
        className: 'border-emerald-300/16 bg-emerald-300/10 text-emerald-200',
        label: 'Pass',
    },
    fail: {
        icon: XCircle,
        className: 'border-rose-300/16 bg-rose-300/10 text-rose-200',
        label: 'Fail',
    },
    warning: {
        icon: AlertTriangle,
        className: 'border-amber-300/16 bg-amber-300/10 text-amber-200',
        label: 'Review',
    },
};

export const ComplianceDashboard = () => {
    const score = Math.round((checks.filter(c => c.status === 'pass').length / checks.length) * 100);
    const scoreColor = score > 80 ? '#34d399' : score > 50 ? '#f59e0b' : '#fb7185';

    return (
        <div className="premium-panel rounded-lg p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        <Shield className="h-4 w-4" />
                        Compliance posture
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">CIS Compliance</h2>
                    <p className="mt-1 text-sm text-slate-500">Control evidence and cloud guardrail readiness.</p>
                </div>

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg className="h-full w-full -rotate-90">
                        <circle cx="40" cy="40" r="34" stroke="rgba(148, 163, 184, 0.16)" strokeWidth="7" fill="transparent" />
                        <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke={scoreColor}
                            strokeWidth="7"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={213.6}
                            strokeDashoffset={213.6 - (213.6 * score) / 100}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-lg font-semibold text-white">{score}%</span>
                </div>
            </div>

            <div className="grid gap-3">
                {checks.map((check) => {
                    const visual = statusVisual[check.status];
                    const Icon = visual.icon;

                    return (
                        <div key={check.name} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 transition-colors hover:border-cyan-300/18">
                            <span className="text-sm font-medium text-slate-200">{check.name}</span>
                            <span className={`flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${visual.className}`}>
                                <Icon className="h-4 w-4" />
                                {visual.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-center border-t border-white/10 pt-5">
                <button className="btn-ghost flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-cyan-100">
                    <Download className="h-4 w-4" />
                    Download Compliance Report
                </button>
            </div>
        </div>
    );
};
