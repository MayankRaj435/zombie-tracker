import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, DollarSign, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

    if (loading) return <div className="p-8 text-center text-slate-400">Loading recommendations...</div>;

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-green-300">Potential Monthly Savings</h3>
                        <div className="text-4xl font-bold text-white mt-1">
                            ${totalSavings.toFixed(2)}
                        </div>
                        <p className="text-sm text-green-400/80 mt-2 flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            Optimization available across {recommendations.length} resources
                        </p>
                    </div>
                    <div className="p-4 bg-green-500/20 rounded-full">
                        <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Recommendations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-5 rounded-xl border-l-4 border-l-indigo-500"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-white">{rec.resourceId}</h4>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                    <span className="capitalize">{rec.resourceType}</span>
                                    <span>•</span>
                                    <span>{rec.currentType} → <span className="text-green-400 font-bold">{rec.recommendedType}</span></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-green-400 font-bold">+${rec.monthlySavings.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">monthly savings</div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-300 mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
                            {rec.reason}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                            <div className={`text-xs px-2 py-1 rounded border ${rec.confidence === 'high'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                {rec.confidence.toUpperCase()} CONFIDENCE
                            </div>

                            <button className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Apply Fix <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {recommendations.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-xl border-dashed">
                        <Check className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                        <p className="text-lg font-medium text-slate-300">All Optimized!</p>
                        <p className="text-sm">No right-sizing opportunities found at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
