import { useState } from 'react';
import type { ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Shield,
    DollarSign,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    TrendingDown,
    FileText,
    Cloud,
    Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CloudGuardLogo } from './cloudguard-logo';

interface NavItem {
    icon: ElementType;
    label: string;
    helper: string;
    href: string;
    badge?: number;
    active?: boolean;
}

interface GlasmorphicSidebarProps {
    activeSection?: string;
    onSectionChange?: (section: string) => void;
}

export const GlasmorphicSidebar = ({ activeSection = 'dashboard', onSectionChange }: GlasmorphicSidebarProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Overview', helper: 'Command center', href: 'dashboard', active: activeSection === 'dashboard' },
        { icon: DollarSign, label: 'Cost Analysis', helper: 'Forecasts and spend', href: 'costs', active: activeSection === 'costs' },
        { icon: Zap, label: 'Remediation', helper: 'Fix queue', href: 'remediation', badge: 3, active: activeSection === 'remediation' },
        { icon: TrendingDown, label: 'Right-Sizing', helper: 'Optimization', href: 'rightsizing', active: activeSection === 'rightsizing' },
        { icon: Shield, label: 'Security', helper: 'CIS posture', href: 'security', active: activeSection === 'security' },
        { icon: Bell, label: 'Alerts', helper: 'Routing rules', href: 'alerts', badge: 5, active: activeSection === 'alerts' },
        { icon: FileText, label: 'Reports', helper: 'Exports', href: 'reports', active: activeSection === 'reports' },
        { icon: Settings, label: 'Settings', helper: 'Workspace', href: 'settings', active: activeSection === 'settings' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isExpanded ? 252 : 84 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 z-40 flex h-screen flex-col"
        >
            <div className="premium-panel flex h-full flex-col rounded-none border-y-0 border-l-0">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                    <AnimatePresence mode="wait">
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -18 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -18 }}
                                transition={{ duration: 0.2 }}
                                className="flex min-w-0 items-center gap-3"
                            >
                                <CloudGuardLogo size={34} />
                                <div className="min-w-0">
                                    <span className="block text-[0.98rem] font-semibold tracking-tight text-white">CloudGuard</span>
                                    <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-cyan-200/60">Sentry Suite</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn-ghost rounded-lg p-2 text-slate-400 hover:text-white"
                        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </motion.button>
                </div>

                <div className="px-4 pt-4">
                    <div
                        className={cn(
                            'rounded-lg border border-cyan-300/10 bg-cyan-300/[0.055] p-3',
                            !isExpanded && 'flex justify-center px-2'
                        )}
                    >
                        {isExpanded ? (
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-cyan-300/12 p-2 text-cyan-200">
                                    <Cloud className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">AWS production</p>
                                    <p className="mt-1 text-[0.7rem] leading-4 text-slate-400">Realtime scan fabric active</p>
                                </div>
                            </div>
                        ) : (
                            <Cloud className="h-5 w-5 text-cyan-200" />
                        )}
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.href}
                            whileHover={{ x: isExpanded ? 3 : 0 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSectionChange?.(item.href)}
                            title={!isExpanded ? item.label : undefined}
                            className={cn(
                                'group relative flex w-full items-center gap-3 rounded-lg border px-3 py-3 transition-all',
                                item.active
                                    ? 'border-cyan-300/20 bg-cyan-300/[0.11] text-white shadow-[0_12px_30px_rgba(34,211,238,0.08)]'
                                    : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.045] hover:text-white'
                            )}
                        >
                            {item.active && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div
                                className={cn(
                                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                                    item.active
                                        ? 'border-cyan-300/20 bg-cyan-300/12 text-cyan-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                                        : 'border-white/5 bg-white/[0.035] text-slate-400 group-hover:text-white'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                            </div>

                            <AnimatePresence mode="wait">
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <span className="block text-sm font-medium leading-5">{item.label}</span>
                                        <span className="block truncate text-[0.68rem] leading-4 text-slate-500 group-hover:text-slate-400">
                                            {item.helper}
                                        </span>
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {item.badge && isExpanded && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-xs font-bold text-amber-200"
                                >
                                    {item.badge}
                                </motion.span>
                            )}

                            {!isExpanded && (
                                <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-slate-950">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </motion.button>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-emerald-300/10 bg-emerald-300/[0.045] p-3"
                            >
                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Advanced Edition
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-[0.7rem] text-slate-400">
                                    <span className="status-dot" />
                                    Guardrails online
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="status-dot mx-auto"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.aside>
    );
};
