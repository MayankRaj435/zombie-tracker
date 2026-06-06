import { useState } from 'react';
import { Bell, Mail, Slack, Save, ShieldCheck } from 'lucide-react';

interface AlertConfig {
    type: string;
    threshold: number;
    enabled: boolean;
    channels: string[];
}

export const AlertConfiguration = () => {
    const [configs, setConfigs] = useState<AlertConfig[]>([
        { type: 'cost', threshold: 100, enabled: true, channels: ['email'] },
        { type: 'security', threshold: 0, enabled: true, channels: ['email', 'slack'] },
    ]);

    const handleToggle = (index: number) => {
        setConfigs(prev => prev.map((config, i) => i === index ? { ...config, enabled: !config.enabled } : config));
    };

    const handleThresholdChange = (index: number, threshold: number) => {
        setConfigs(prev => prev.map((config, i) => i === index ? { ...config, threshold } : config));
    };

    const handleChannelToggle = (index: number, channel: string) => {
        setConfigs(prev => prev.map((config, i) => {
            if (i !== index) return config;

            const channels = config.channels.includes(channel)
                ? config.channels.filter(item => item !== channel)
                : [...config.channels, channel];

            return { ...config, channels };
        }));
    };

    return (
        <div className="premium-panel rounded-lg p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        <Bell className="h-4 w-4" />
                        Alert operations
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Alert Settings</h2>
                    <p className="mt-1 text-sm text-slate-500">Route cost and security events before they become incidents.</p>
                </div>
                <div className="rounded-lg border border-emerald-300/16 bg-emerald-300/10 p-3 text-emerald-100">
                    <ShieldCheck className="h-5 w-5" />
                </div>
            </div>

            <div className="space-y-4">
                {configs.map((config, index) => (
                    <div key={config.type} className="premium-card rounded-lg p-4">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold capitalize text-white">{config.type} alerts</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Notify when {config.type} thresholds are exceeded.
                                </p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={() => handleToggle(index)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-slate-700 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-cyan-400 peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>

                        {config.enabled && (
                            <div className="space-y-4 border-l border-white/10 pl-4">
                                {config.type === 'cost' && (
                                    <div>
                                        <label className="mb-1 block text-sm text-slate-400">Monthly cost threshold</label>
                                        <div className="flex w-fit items-center rounded-lg border border-white/10 bg-slate-950/40">
                                            <span className="px-3 text-slate-500">$</span>
                                            <input
                                                type="number"
                                                value={config.threshold}
                                                onChange={(event) => handleThresholdChange(index, Number(event.target.value))}
                                                className="premium-input w-32 rounded-r-lg border-0 px-3 py-2 text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">Notification channels</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'email', label: 'Email', icon: Mail },
                                            { id: 'slack', label: 'Slack', icon: Slack },
                                        ].map(({ id, label, icon: Icon }) => {
                                            const enabled = config.channels.includes(id);
                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => handleChannelToggle(index, id)}
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${enabled
                                                        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                                                        : 'border-white/10 bg-transparent text-slate-500 hover:border-white/20 hover:text-white'
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-end pt-2">
                    <button className="premium-button flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
