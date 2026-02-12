import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EnhancedStatCardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: React.ElementType;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
    trend?: number; // Percentage change
    sparklineData?: number[];
    className?: string;
}

const colorMap = {
    green: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        glow: 'shadow-green-500/20',
        ring: 'stroke-green-400',
        gradient: 'from-green-400 to-emerald-400'
    },
    blue: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        ring: 'stroke-blue-400',
        gradient: 'from-blue-400 to-cyan-400'
    },
    purple: {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        ring: 'stroke-purple-400',
        gradient: 'from-purple-400 to-pink-400'
    },
    orange: {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        ring: 'stroke-orange-400',
        gradient: 'from-orange-400 to-amber-400'
    },
    red: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        glow: 'shadow-red-500/20',
        ring: 'stroke-red-400',
        gradient: 'from-red-400 to-rose-400'
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

    // Animated counter
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;

            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - step / steps, 3);
            setDisplayValue(value * easedProgress);
            setProgress(easedProgress * 100);

            if (step >= steps) {
                setDisplayValue(value);
                setProgress(100);
                clearInterval(timer);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    // Sparkline path
    const sparklinePath = useRef('');
    useEffect(() => {
        if (sparklineData.length > 0) {
            const width = 100;
            const height = 30;
            const max = Math.max(...sparklineData);
            const min = Math.min(...sparklineData);
            const range = max - min || 1;

            const points = sparklineData.map((val, i) => {
                const x = (i / (sparklineData.length - 1)) * width;
                const y = height - ((val - min) / range) * height;
                return `${x},${y}`;
            });

            sparklinePath.current = `M ${points.join(' L ')}`;
        }
    }, [sparklineData]);

    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp className="w-4 h-4" />;
        if (trend < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!trend) return 'text-slate-500';
        // For cost metrics, down is good (green), up is bad (red)
        if (title.toLowerCase().includes('cost') || title.toLowerCase().includes('savings')) {
            return trend > 0 ? 'text-red-400' : 'text-green-400';
        }
        // For other metrics, up is good
        return trend > 0 ? 'text-green-400' : 'text-red-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={cn('glass-panel p-6 rounded-2xl relative overflow-hidden group', className)}
        >
            {/* Background icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className={cn('w-32 h-32 transform rotate-12 translate-x-4 -translate-y-4', colors.text)} />
            </div>

            {/* Progress ring */}
            <div className="absolute top-4 right-4">
                <svg width="48" height="48" className="transform -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className={colors.ring}
                        initial={{ strokeDasharray: '0 126' }}
                        animate={{ strokeDasharray: `${progress * 1.26} 126` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Icon */}
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', colors.bg)}>
                    <Icon className={cn('w-6 h-6', colors.text)} />
                </div>

                {/* Title */}
                <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>

                {/* Value with animated counter */}
                <div className="flex items-baseline gap-2 mb-3">
                    <motion.p
                        className="text-3xl font-bold text-white tracking-tight"
                        key={displayValue}
                    >
                        {prefix}
                        {typeof displayValue === 'number' ? displayValue.toFixed(2) : displayValue}
                        {suffix}
                    </motion.p>

                    {/* Trend indicator */}
                    {trend !== undefined && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}
                        >
                            {getTrendIcon()}
                            <span>{Math.abs(trend).toFixed(1)}%</span>
                        </motion.div>
                    )}
                </div>

                {/* Sparkline */}
                {sparklineData.length > 0 && (
                    <div className="mt-4">
                        <svg width="100%" height="30" className="overflow-visible">
                            <defs>
                                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" className={colors.text} stopOpacity="0.8" />
                                    <stop offset="100%" className={colors.text} stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                d={sparklinePath.current}
                                fill="none"
                                stroke={`url(#gradient-${color})`}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </svg>
                    </div>
                )}

                {/* Badge */}
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn(
                        'inline-block text-xs font-medium mt-3 px-3 py-1 rounded-full',
                        colors.bg,
                        colors.text
                    )}
                >
                    Last 7 days
                </motion.span>
            </div>

            {/* Shimmer effect on update */}
            <motion.div
                className={cn(
                    'absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent',
                    'pointer-events-none'
                )}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
        </motion.div>
    );
};
