import { motion } from 'framer-motion';
import { Activity, Cloud, DollarSign, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { CloudGuardLogo } from '../ui/cloudguard-logo';

interface AuthVisualPanelProps {
    title: string;
    description: string;
}

const bars = [42, 68, 55, 81, 63, 92, 74, 88];

export function AuthVisualPanel({ title, description }: AuthVisualPanelProps) {
    return (
        <div className="hidden min-h-screen overflow-hidden border-r border-white/10 bg-slate-950/40 p-8 lg:flex lg:w-1/2">
            <div className="premium-panel scan-line flex w-full flex-col justify-between rounded-lg p-8">
                <div>
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CloudGuardLogo size={44} />
                            <div>
                                <p className="font-semibold text-white">CloudGuard</p>
                                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">Sentry Suite</p>
                            </div>
                        </div>
                        <div className="rounded-full border border-emerald-300/16 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                            Live
                        </div>
                    </div>

                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                    >
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                            <Sparkles className="h-4 w-4" />
                            Premium cloud operations
                        </div>
                        <h2 className="app-text-balance max-w-xl text-4xl font-semibold tracking-tight text-white">
                            {title}
                        </h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
                            {description}
                        </p>
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Savings', value: '$42.8k', icon: DollarSign, tone: 'text-emerald-200' },
                            { label: 'Posture', value: '94%', icon: ShieldCheck, tone: 'text-cyan-200' },
                            { label: 'Actions', value: '128', icon: Zap, tone: 'text-amber-200' },
                        ].map(({ label, value, icon: Icon, tone }) => (
                            <motion.div
                                key={label}
                                whileHover={{ y: -4 }}
                                className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                            >
                                <Icon className={`mb-4 h-5 w-5 ${tone}`} />
                                <p className="number-tabular text-2xl font-semibold text-white">{value}</p>
                                <p className="mt-1 text-xs text-slate-500">{label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-white">Cost exposure trend</p>
                                <p className="text-xs text-slate-500">Last 8 scans</p>
                            </div>
                            <Activity className="h-5 w-5 text-cyan-200" />
                        </div>
                        <div className="flex h-32 items-end gap-3">
                            {bars.map((height, index) => (
                                <motion.div
                                    key={`${height}-${index}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.7, delay: index * 0.05, ease: 'easeOut' }}
                                    className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-400/35 to-emerald-300 shadow-[0_0_22px_rgba(34,211,238,0.16)]"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-cyan-300/14 bg-cyan-300/[0.07] p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-cyan-300/16 bg-cyan-300/10 p-2 text-cyan-100">
                                <Cloud className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">AWS production linked</p>
                                <p className="text-xs text-slate-500">Read-only telemetry, encrypted credentials</p>
                            </div>
                        </div>
                        <span className="status-dot" />
                    </div>
                </div>
            </div>
        </div>
    );
}
