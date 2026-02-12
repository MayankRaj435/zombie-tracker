import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Zap, FileText, Settings, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingActionMenuProps {
    onAction?: (action: string) => void;
}

export const FloatingActionMenu = ({ onAction }: FloatingActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { icon: Search, label: 'Run Scan', action: 'scan', color: 'from-blue-500 to-cyan-500' },
        { icon: Zap, label: 'Quick Fix', action: 'quickfix', color: 'from-purple-500 to-pink-500' },
        { icon: FileText, label: 'Export Report', action: 'export', color: 'from-green-500 to-emerald-500' },
        { icon: Settings, label: 'Settings', action: 'settings', color: 'from-orange-500 to-amber-500' },
        { icon: HelpCircle, label: 'Help', action: 'help', color: 'from-indigo-500 to-purple-500' },
    ];

    const handleAction = (action: string) => {
        onAction?.(action);
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Action buttons */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-20 right-0 flex flex-col gap-3"
                    >
                        {actions.map((action, index) => (
                            <motion.button
                                key={action.action}
                                initial={{ opacity: 0, x: 50, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                        delay: index * 0.05
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    x: 50,
                                    y: 20,
                                    transition: { delay: (actions.length - index - 1) * 0.05 }
                                }}
                                whileHover={{ scale: 1.05, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction(action.action)}
                                className="group flex items-center gap-3"
                            >
                                {/* Label */}
                                <span className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-lg whitespace-nowrap">
                                    {action.label}
                                </span>

                                {/* Icon button */}
                                <div className={cn(
                                    'w-12 h-12 rounded-full flex items-center justify-center',
                                    'bg-gradient-to-br shadow-lg',
                                    action.color,
                                    'hover:shadow-xl transition-shadow'
                                )}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    'bg-gradient-to-br from-indigo-600 to-purple-600',
                    'shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/70',
                    'transition-all duration-300',
                    'relative overflow-hidden'
                )}
            >
                {/* Ripple effect */}
                <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{
                        scale: isOpen ? 1 : 0,
                        opacity: isOpen ? 0 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                />

                {/* Icon */}
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-7 h-7 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Plus className="w-7 h-7 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};
