import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: React.ElementType;
    action: () => void;
    keywords?: string[];
}

interface CommandPaletteProps {
    commands?: CommandItem[];
}

export const CommandPalette = ({ commands = [] }: CommandPaletteProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Default commands
    const defaultCommands: CommandItem[] = [
        {
            id: 'scan',
            label: 'Run New Scan',
            description: 'Scan AWS resources for issues',
            icon: Search,
            action: () => console.log('Run scan'),
            keywords: ['scan', 'analyze', 'check']
        },
        {
            id: 'export',
            label: 'Export Report',
            description: 'Download cost analysis report',
            icon: ArrowRight,
            action: () => console.log('Export'),
            keywords: ['export', 'download', 'report']
        },
        {
            id: 'quickfix',
            label: 'Quick Fix All',
            description: 'Apply recommended fixes',
            icon: Zap,
            action: () => console.log('Quick fix'),
            keywords: ['fix', 'remediate', 'apply']
        },
    ];

    const allCommands = [...defaultCommands, ...commands];

    // Fuzzy search
    const filteredCommands = search
        ? allCommands.filter(cmd => {
            const searchLower = search.toLowerCase();
            return (
                cmd.label.toLowerCase().includes(searchLower) ||
                cmd.description?.toLowerCase().includes(searchLower) ||
                cmd.keywords?.some(k => k.includes(searchLower))
            );
        })
        : allCommands;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }

            // Escape to close
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearch('');
                setSelectedIndex(0);
            }

            // Arrow navigation
            if (isOpen) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                }

                // Enter to execute
                if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
                    e.preventDefault();
                    filteredCommands[selectedIndex].action();
                    setIsOpen(false);
                    setSearch('');
                    setSelectedIndex(0);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex]);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Command palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
                    >
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                            {/* Search input */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-lg"
                                />
                                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-white/10">
                                    <Command className="w-3 h-3" />
                                    <span>K</span>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="max-h-96 overflow-y-auto">
                                {filteredCommands.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        No commands found
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {filteredCommands.map((cmd, index) => {
                                            const Icon = cmd.icon || Zap;
                                            return (
                                                <motion.button
                                                    key={cmd.id}
                                                    onClick={() => {
                                                        cmd.action();
                                                        setIsOpen(false);
                                                        setSearch('');
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                                                        index === selectedIndex
                                                            ? 'bg-indigo-500/20 text-white'
                                                            : 'text-slate-300 hover:bg-white/5'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'w-10 h-10 rounded-lg flex items-center justify-center',
                                                        index === selectedIndex
                                                            ? 'bg-indigo-500/30'
                                                            : 'bg-white/5'
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium">{cmd.label}</div>
                                                        {cmd.description && (
                                                            <div className="text-sm text-slate-400 truncate">
                                                                {cmd.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {index === selectedIndex && (
                                                        <div className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-white/10">
                                                            ↵
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-3 border-t border-white/10 text-xs text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/10">↑</kbd>
                                        <kbd className="bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/10">↓</kbd>
                                        to navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/10">↵</kbd>
                                        to select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/10">esc</kbd>
                                        to close
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
