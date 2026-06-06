import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: ElementType;
    action: () => void;
    keywords?: string[];
}

interface CommandPaletteProps {
    commands?: CommandItem[];
}

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

export const CommandPalette = ({ commands = [] }: CommandPaletteProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const allCommands = useMemo(() => [...defaultCommands, ...commands], [commands]);

    const filteredCommands = useMemo(() => {
        if (!search) return allCommands;

        const searchLower = search.toLowerCase();
        return allCommands.filter(cmd => (
            cmd.label.toLowerCase().includes(searchLower) ||
            cmd.description?.toLowerCase().includes(searchLower) ||
            cmd.keywords?.some(k => k.includes(searchLower))
        ));
    }, [allCommands, search]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setIsOpen(true);
            }

            if (event.key === 'Escape') {
                setIsOpen(false);
                setSearch('');
                setSelectedIndex(0);
            }

            if (isOpen) {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
                }
                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                }

                if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
                    event.preventDefault();
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

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/4 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
                    >
                        <div className="premium-panel overflow-hidden rounded-lg border border-white/20 shadow-2xl">
                            <div className="flex items-center gap-3 border-b border-white/10 p-4">
                                <Search className="h-5 w-5 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
                                />
                                <div className="flex items-center gap-1 rounded border border-white/10 bg-slate-800/50 px-2 py-1 text-xs text-slate-500">
                                    <Command className="h-3 w-3" />
                                    <span>K</span>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {filteredCommands.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No commands found</div>
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
                                                        'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all',
                                                        index === selectedIndex
                                                            ? 'bg-cyan-300/10 text-white'
                                                            : 'text-slate-300 hover:bg-white/5'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'flex h-10 w-10 items-center justify-center rounded-lg',
                                                        index === selectedIndex ? 'bg-cyan-300/14' : 'bg-white/5'
                                                    )}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium">{cmd.label}</div>
                                                        {cmd.description && (
                                                            <div className="truncate text-sm text-slate-400">{cmd.description}</div>
                                                        )}
                                                    </div>
                                                    {index === selectedIndex && (
                                                        <div className="rounded border border-white/10 bg-slate-800/50 px-2 py-1 text-xs text-slate-500">
                                                            Enter
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 p-3 text-xs text-slate-500">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border border-white/10 bg-slate-800/50 px-1.5 py-0.5">Up</kbd>
                                        <kbd className="rounded border border-white/10 bg-slate-800/50 px-1.5 py-0.5">Down</kbd>
                                        to navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border border-white/10 bg-slate-800/50 px-1.5 py-0.5">Enter</kbd>
                                        to select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border border-white/10 bg-slate-800/50 px-1.5 py-0.5">Esc</kbd>
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
