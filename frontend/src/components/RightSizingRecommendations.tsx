import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, DollarSign, TrendingDown, ServerCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { API_URL } from '../config';

interface Recommendation {
    id: string;
    resourceId: string;
    resourceType: string;
    currentType: string;
    recommendedType: string;
    currentCost: number;
    recommendedCost: number;
    monthlySavings: number;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
}

export const RightSizingRecommendations = () => {
    const { token } = useAuth();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch(`${API_URL}/api/recommendations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRecommendations(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchRecommendations();
    }, [token]);

    const totalSavings = recommendations.reduce((acc, rec) => acc + rec.monthlySavings, 0);

    if (loading) {
        return (
            <div className="premium-panel flex h-96 items-center justify-center rounded-lg p-8 text-center">
                <div>
                    <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-cyan-300/20 border-t-cyan-300 animate-spin" />
                    <p className="font-medium text-white">Loading recommendations...</p>
                    <p className="mt-1 text-sm text-slate-500">Analyzing recent utilization signals.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="premium-panel rounded-lg p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-100">
                            <TrendingDown className="h-4 w-4" />
                            Optimization engine
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight text-white">Potential monthly savings</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                            Right-size overprovisioned infrastructure while preserving reliability margins.
                        </p>
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="rounded-lg border border-emerald-300/16 bg-emerald-300/10 p-3 text-emerald-100">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="number-tabular text-4xl font-semibold tracking-tight text-white">
                                ${totalSavings.toFixed(2)}
                            </div>
                            <p className="mt-1 text-sm text-emerald-200">
                                Across {recommendations.length} resources
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {recommendations.map((rec, index) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="premium-card rounded-lg p-5"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2">
                                    <ServerCog className="h-4 w-4 text-cyan-200" />
                                    <h4 className="truncate font-mono text-sm font-semibold text-white">{rec.resourceId}</h4>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                                    <span className="capitalize">{rec.resourceType}</span>
                                    <span>|</span>
                                    <span>{rec.currentType}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                                    <span className="font-semibold text-emerald-200">{rec.recommendedType}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="number-tabular font-semibold text-emerald-200">+${rec.monthlySavings.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">monthly</div>
                            </div>
                        </div>

                        <p className="mb-4 rounded-lg border border-white/10 bg-slate-950/35 p-3 text-sm leading-6 text-slate-300">
                            {rec.reason}
                        </p>

                        <div className="flex items-center justify-between gap-3">
                            <div className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${rec.confidence === 'high'
                                ? 'border-emerald-300/16 bg-emerald-300/10 text-emerald-200'
                                : 'border-amber-300/16 bg-amber-300/10 text-amber-200'
                                }`}>
                                {rec.confidence.toUpperCase()} CONFIDENCE
                            </div>

                            <button className="flex items-center gap-2 rounded-lg border border-cyan-300/16 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/15">
                                Apply Fix <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {recommendations.length === 0 && (
                    <div className="premium-panel col-span-full rounded-lg border-dashed p-12 text-center">
                        <Check className="mx-auto mb-3 h-12 w-12 text-emerald-300/70" />
                        <p className="text-lg font-semibold text-white">All optimized</p>
                        <p className="mt-1 text-sm text-slate-500">No right-sizing opportunities found at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
