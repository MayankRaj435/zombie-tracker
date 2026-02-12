import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const ComplianceDashboard = () => {
    // Mock data
    const checks = [
        { name: 'CIS 1.1: Root user MFA enabled', status: 'pass' },
        { name: 'CIS 1.2: Password policy strength', status: 'pass' },
        { name: 'CIS 1.3: Unused credentials disabled', status: 'fail', severity: 'high' },
        { name: 'CIS 2.1: CloudTrail enabled', status: 'pass' },
        { name: 'CIS 2.2: CloudTrail log validation', status: 'pass' },
        { name: 'CIS 4.1: Security Groups restricted', status: 'warning', severity: 'medium' },
    ];

    const score = Math.round((checks.filter(c => c.status === 'pass').length / checks.length) * 100);

    return (
        <div className="glass-panel p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">CIS Compliance</h2>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                        <circle
                            cx="32" cy="32" r="28"
                            stroke={score > 80 ? '#22c55e' : score > 50 ? '#eab308' : '#ef4444'}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={175.9}
                            strokeDashoffset={175.9 - (175.9 * score) / 100}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-sm font-bold text-white">{score}%</span>
                </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {checks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-sm font-medium text-slate-300">{check.name}</span>
                        <div className="flex items-center gap-2">
                            {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {check.status === 'fail' && <XCircle className="w-5 h-5 text-red-500" />}
                            {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <button className="text-sm text-purple-400 hover:text-purple-300 font-medium">Download Compliance Report</button>
            </div>
        </div>
    );
};
