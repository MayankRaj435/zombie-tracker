import React from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

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

const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ issues }) => {
    if (!issues || issues.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                    <h2 className="text-xl font-bold text-white">Security Alerts</h2>
                </div>
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500/50 mb-3" />
                    <p className="text-gray-400">No security issues detected. Great job!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">Security Alerts ({issues.length})</h2>
            </div>

            <div className="space-y-3">
                {issues.map((issue) => (
                    <div
                        key={issue.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-red-200">
                                {issue.severity} Risk: {issue.groupName || issue.groupId}
                            </h3>
                            <p className="text-xs text-red-200/70 mt-1">
                                {issue.description}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-2">
                                Detected: {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityAlerts;
