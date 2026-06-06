import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EnhancedStatCardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: ElementType;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
    trend?: number;
    sparklineData?: number[];
    className?: string;
}

const colorMap = {
    green: {
        bg: 'bg-emerald-300/10',
        text: 'text-emerald-300',
        border: 'border-emerald-300/18',
        ring: 'stroke-emerald-300',
        glow: 'shadow-emerald-500/10',
        gradientStart: '#34d399',
        gradientEnd: '#22d3ee',
    },
    blue: {
        bg: 'bg-cyan-300/10',
        text: 'text-cyan-200',
        border: 'border-cyan-300/18',
        ring: 'stroke-cyan-300',
        glow: 'shadow-cyan-500/10',
        gradientStart: '#22d3ee',
        gradientEnd: '#60a5fa',
    },
    purple: {
        bg: 'bg-indigo-300/10',
        text: 'text-indigo-200',
        border: 'border-indigo-300/18',
        ring: 'stroke-indigo-300',
        glow: 'shadow-indigo-500/10',
        gradientStart: '#818cf8',
        gradientEnd: '#22d3ee',
    },
    orange: {
        bg: 'bg-amber-300/10',
        text: 'text-amber-200',
        border: 'border-amber-300/18',
        ring: 'stroke-amber-300',
        glow: 'shadow-amber-500/10',
        gradientStart: '#f59e0b',
        gradientEnd: '#34d399',
    },
    red: {
        bg: 'bg-rose-300/10',
        text: 'text-rose-200',
        border: 'border-rose-300/18',
        ring: 'stroke-rose-300',
        glow: 'shadow-rose-500/10',
        gradientStart: '#fb7185',
        gradientEnd: '#f59e0b',
    }
};

export const EnhancedStatCard = ({
    title,
    value,
    prefix = '',
    suffix = '',
    icon: Icon,
    color,
    trend,
    sparklineData = [],
    className
}: EnhancedStatCardProps) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [progress, setProgress] = useState(0);
    const colors = colorMap[color];
    const gradientId = useId();
    const sparklinePath = useRef('');

    useEffect(() => {
        const duration = 1200;
        const steps = 48;
        let step = 0;

        const timer = window.setInterval(() => {
            step += 1;
            const easedProgress = 1 - Math.pow(1 - step / steps, 3);
            setDisplayValue(value * easedProgress);
            setProgress(easedProgress * 100);

            if (step >= steps) {
                setDisplayValue(value);
                setProgress(100);
                window.clearInterval(timer);
            }
        }, duration / steps);

        return () => window.clearInterval(timer);
    }, [value]);

    useEffect(() => {
        if (sparklineData.length > 1) {
            const width = 128;
            const height = 34;
            const max = Math.max(...sparklineData);
            const min = Math.min(...sparklineData);
            const range = max - min || 1;

            const points = sparklineData.map((val, index) => {
                const x = (index / (sparklineData.length - 1)) * width;
                const y = height - ((val - min) / range) * height;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            });

            sparklinePath.current = `M ${points.join(' L ')}`;
        }
    }, [sparklineData]);

    const formattedValue = useMemo(() => {
        const hasCurrency = prefix === '$' || suffix.includes('/mo');
        const maximumFractionDigits = hasCurrency ? 2 : 0;

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: hasCurrency ? 2 : 0,
            maximumFractionDigits,
        }).format(displayValue);
    }, [displayValue, prefix, suffix]);

    const trendIcon = useMemo(() => {
        if (trend === undefined) return null;
        if (trend > 0) return <TrendingUp className="h-3.5 w-3.5" />;
        if (trend < 0) return <TrendingDown className="h-3.5 w-3.5" />;
        return <Minus className="h-3.5 w-3.5" />;
    }, [trend]);

    const trendClass = useMemo(() => {
        if (trend === undefined) return 'text-slate-500 border-white/10 bg-white/5';
        const lowerTitle = title.toLowerCase();
        const downIsGood = lowerTitle.includes('cost') || lowerTitle.includes('savings');
        const goodTrend = downIsGood ? trend < 0 : trend > 0;
        return goodTrend
            ? 'text-emerald-200 border-emerald-300/16 bg-emerald-300/10'
            : trend === 0
                ? 'text-slate-300 border-white/10 bg-white/5'
                : 'text-rose-200 border-rose-300/16 bg-rose-300/10';
    }, [title, trend]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ duration: 0.28 }}
            className={cn('premium-panel group min-h-[188px] rounded-lg p-5 shadow-2xl', colors.glow, className)}
        >
            <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-white/[0.025] blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

            <div className="flex items-start justify-between gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg border', colors.bg, colors.text, colors.border)}>
                    <Icon className="h-5 w-5" />
                </div>

                <svg width="52" height="52" className="-rotate-90">
                    <circle
                        cx="26"
                        cy="26"
                        r="21"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="26"
                        cy="26"
                        r="21"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className={colors.ring}
                        initial={{ strokeDasharray: '0 132' }}
                        animate={{ strokeDasharray: `${progress * 1.32} 132` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                </svg>
            </div>

            <div className="mt-5">
                <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                    <p className="number-tabular text-3xl font-semibold tracking-tight text-white">
                        {prefix}
                        {formattedValue}
                        {suffix}
                    </p>

                    {trend !== undefined && (
                        <div className={cn('mb-1 flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold', trendClass)}>
                            {trendIcon}
                            {Math.abs(trend).toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>

            {sparklineData.length > 1 && (
                <div className="mt-5 h-[34px]">
                    <svg viewBox="0 0 128 34" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={colors.gradientStart} stopOpacity="0.9" />
                                <stop offset="100%" stopColor={colors.gradientEnd} stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={sparklinePath.current}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.18 }}
                        />
                    </svg>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Last 7 days</span>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.5)]" />
            </div>
        </motion.div>
    );
};
