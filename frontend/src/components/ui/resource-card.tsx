import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, MoreVertical, Power, Trash2, Unplug } from 'lucide-react';
import { cn } from '../../lib/utils';

type ResourceAction = 'terminate' | 'stop' | 'schedule' | 'delete' | 'release';

interface ResourceCardProps {
    id: string;
    title: string;
    subtitle?: string;
    status: 'idle' | 'active' | 'warning' | 'critical';
    cost?: string;
    metadata?: { label: string; value: string }[];
    details?: ReactNode;
    onAction?: (action: ResourceAction, id: string) => void;
    selected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    className?: string;
}

const statusConfig = {
    idle: {
        bg: 'bg-amber-300/10',
        text: 'text-amber-200',
        border: 'border-amber-300/18',
        dot: 'bg-amber-300',
        stripe: 'from-amber-300/80 to-cyan-300/20'
    },
    active: {
        bg: 'bg-emerald-300/10',
        text: 'text-emerald-200',
        border: 'border-emerald-300/18',
        dot: 'bg-emerald-300',
        stripe: 'from-emerald-300/80 to-cyan-300/20'
    },
    warning: {
        bg: 'bg-orange-300/10',
        text: 'text-orange-200',
        border: 'border-orange-300/18',
        dot: 'bg-orange-300',
        stripe: 'from-orange-300/80 to-amber-300/20'
    },
    critical: {
        bg: 'bg-rose-300/10',
        text: 'text-rose-200',
        border: 'border-rose-300/18',
        dot: 'bg-rose-300',
        stripe: 'from-rose-300/80 to-amber-300/20'
    }
};

export const ResourceCard = ({
    id,
    title,
    subtitle,
    status,
    cost,
    metadata = [],
    details,
    onAction,
    selected = false,
    onSelect,
    className
}: ResourceCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const statusStyle = statusConfig[status];

    const resourceKind = useMemo(() => {
        if (title.startsWith('vol-')) return 'volume';
        if (title.startsWith('eipalloc-') || metadata.some(item => item.label.toLowerCase().includes('public ip'))) return 'eip';
        return 'instance';
    }, [metadata, title]);

    const actions = useMemo(() => {
        if (resourceKind === 'volume') {
            return [
                { icon: Trash2, label: 'Delete', action: 'delete' as const, color: 'text-rose-200 hover:bg-rose-300/10 hover:border-rose-300/20' },
                { icon: Clock, label: 'Schedule', action: 'schedule' as const, color: 'text-cyan-200 hover:bg-cyan-300/10 hover:border-cyan-300/20' },
            ];
        }

        if (resourceKind === 'eip') {
            return [
                { icon: Unplug, label: 'Release', action: 'release' as const, color: 'text-orange-200 hover:bg-orange-300/10 hover:border-orange-300/20' },
                { icon: Clock, label: 'Schedule', action: 'schedule' as const, color: 'text-cyan-200 hover:bg-cyan-300/10 hover:border-cyan-300/20' },
            ];
        }

        return [
            { icon: Power, label: 'Stop', action: 'stop' as const, color: 'text-amber-200 hover:bg-amber-300/10 hover:border-amber-300/20' },
            { icon: Trash2, label: 'Terminate', action: 'terminate' as const, color: 'text-rose-200 hover:bg-rose-300/10 hover:border-rose-300/20' },
            { icon: Clock, label: 'Schedule', action: 'schedule' as const, color: 'text-cyan-200 hover:bg-cyan-300/10 hover:border-cyan-300/20' },
        ];
    }, [resourceKind]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            whileHover={{ y: -3 }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className={cn(
                'premium-card group rounded-lg transition-all',
                selected && 'ring-2 ring-cyan-300/60 shadow-[0_22px_58px_rgba(34,211,238,0.16)]',
                className
            )}
        >
            <div className={cn('absolute inset-y-0 left-0 w-1 bg-gradient-to-b', statusStyle.stripe)} />

            <div className="p-4">
                <div className="flex items-start gap-4">
                    {onSelect && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelect(id, !selected)}
                            className={cn(
                                'mt-1 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all',
                                selected
                                    ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                                    : 'border-slate-600 hover:border-cyan-300'
                            )}
                            aria-label={selected ? 'Deselect resource' : 'Select resource'}
                        >
                            {selected && (
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </motion.button>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate font-mono text-sm font-semibold text-white">{title}</h3>
                                {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
                            </div>

                            <div className={cn('flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', statusStyle.bg, statusStyle.text, statusStyle.border)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full shadow-[0_0_12px_currentColor]', statusStyle.dot)} />
                                {status}
                            </div>
                        </div>

                        {metadata.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {metadata.map((item) => (
                                    <div key={`${item.label}-${item.value}`} className="rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-1">
                                        <span className="text-[0.67rem] uppercase tracking-[0.14em] text-slate-500">{item.label}</span>
                                        <span className="ml-2 text-xs font-medium text-slate-200">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            {cost && (
                                <div className="mr-auto rounded-md border border-emerald-300/14 bg-emerald-300/8 px-2.5 py-1 text-sm font-semibold text-emerald-200">
                                    {cost} <span className="text-xs font-medium text-emerald-200/60">monthly</span>
                                </div>
                            )}

                            <AnimatePresence>
                                {showActions && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {actions.map((action) => (
                                            <motion.button
                                                key={action.action}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onAction?.(action.action, id)}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold transition-all',
                                                    action.color
                                                )}
                                            >
                                                <action.icon className="h-3.5 w-3.5" />
                                                {action.label}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="btn-ghost rounded-md p-2 text-slate-400 hover:text-white"
                                aria-label="Show resource actions"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>

                            {details && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="btn-ghost rounded-md p-2 text-slate-400 hover:text-white"
                                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && details && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 border-t border-white/10 pt-4 text-slate-300">
                                {details}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
