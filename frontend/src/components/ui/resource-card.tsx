import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Square, Trash2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ResourceCardProps {
    id: string;
    title: string;
    subtitle?: string;
    status: 'idle' | 'active' | 'warning' | 'critical';
    cost?: string;
    metadata?: { label: string; value: string }[];
    details?: React.ReactNode;
    onAction?: (action: 'terminate' | 'stop' | 'schedule', id: string) => void;
    selected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    className?: string;
}

const statusConfig = {
    idle: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/20',
        dot: 'bg-yellow-500'
    },
    active: {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/20',
        dot: 'bg-green-500'
    },
    warning: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        dot: 'bg-orange-500'
    },
    critical: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        dot: 'bg-red-500'
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

    const actions = [
        { icon: Square, label: 'Stop', action: 'stop' as const, color: 'text-orange-400 hover:bg-orange-500/10' },
        { icon: Trash2, label: 'Terminate', action: 'terminate' as const, color: 'text-red-400 hover:bg-red-500/10' },
        { icon: Clock, label: 'Schedule', action: 'schedule' as const, color: 'text-blue-400 hover:bg-blue-500/10' },
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -2 }}
            className={cn(
                'glass-panel rounded-xl overflow-hidden transition-all',
                selected && 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20',
                className
            )}
        >
            <div className="p-4">
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    {onSelect && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelect(id, !selected)}
                            className={cn(
                                'w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-1',
                                selected
                                    ? 'bg-indigo-500 border-indigo-500'
                                    : 'border-slate-600 hover:border-indigo-500'
                            )}
                        >
                            {selected && (
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 text-white"
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold truncate font-mono text-sm">{title}</h3>
                                {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
                            </div>

                            {/* Status badge */}
                            <div className={cn('flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border', statusStyle.bg, statusStyle.text, statusStyle.border)}>
                                <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', statusStyle.dot)} />
                                {status}
                            </div>
                        </div>

                        {/* Metadata */}
                        {metadata.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-3">
                                {metadata.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-slate-500 text-xs">{item.label}:</span>
                                        <span className="text-slate-300 text-xs font-medium bg-slate-800/50 px-2 py-0.5 rounded border border-white/10">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Cost */}
                        {cost && (
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-slate-500 text-xs">Est. Monthly Cost:</span>
                                <span className="text-green-400 font-bold text-sm">{cost}</span>
                            </div>
                        )}

                        {/* Action buttons - show on hover */}
                        <div className="flex items-center gap-2">
                            <AnimatePresence>
                                {showActions && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex gap-2"
                                    >
                                        {actions.map((action) => (
                                            <motion.button
                                                key={action.action}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onAction?.(action.action, id)}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-white/10',
                                                    action.color
                                                )}
                                            >
                                                <action.icon className="w-3.5 h-3.5" />
                                                {action.label}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors ml-auto"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Expand button */}
                            {details && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expandable details */}
                <AnimatePresence>
                    {isExpanded && details && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-white/10">
                                {details}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hover effect */}
            <div
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
                className="absolute inset-0 pointer-events-none"
            />
        </motion.div>
    );
};
