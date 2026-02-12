import { useState } from 'react';
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
    FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CloudGuardLogo } from './cloudguard-logo';

interface NavItem {
    icon: React.ElementType;
    label: string;
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
        { icon: LayoutDashboard, label: 'Dashboard', href: 'dashboard', active: activeSection === 'dashboard' },
        { icon: DollarSign, label: 'Cost Analysis', href: 'costs', active: activeSection === 'costs' },
        { icon: Zap, label: 'Remediation', href: 'remediation', badge: 3, active: activeSection === 'remediation' },
        { icon: TrendingDown, label: 'Right-Sizing', href: 'rightsizing', active: activeSection === 'rightsizing' },
        { icon: Shield, label: 'Security', href: 'security', active: activeSection === 'security' },
        { icon: Bell, label: 'Alerts', href: 'alerts', badge: 5, active: activeSection === 'alerts' },
        { icon: FileText, label: 'Reports', href: 'reports', active: activeSection === 'reports' },
        { icon: Settings, label: 'Settings', href: 'settings', active: activeSection === 'settings' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isExpanded ? 240 : 80 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen z-40 flex flex-col"
        >
            {/* Glassmorphic container */}
            <div className="h-full glass-panel border-r border-white/10 flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/10">
                    <AnimatePresence mode="wait">
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                <CloudGuardLogo size={32} />
                                <span className="font-bold text-white text-lg">CloudGuard</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    >
                        {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </motion.button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.href}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSectionChange?.(item.href)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group',
                                item.active
                                    ? 'bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            {/* Active indicator */}
                            {item.active && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon with glow effect */}
                            <div className={cn(
                                'relative',
                                item.active && 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>

                            {/* Label */}
                            <AnimatePresence mode="wait">
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-medium flex-1 text-left"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Badge */}
                            {item.badge && isExpanded && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                                >
                                    {item.badge}
                                </motion.span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {!isExpanded && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </motion.button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xs text-slate-500 text-center"
                            >
                                v2.0.0 • Advanced Edition
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.aside>
    );
};
