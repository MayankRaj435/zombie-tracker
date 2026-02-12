import { useState } from 'react';
import { Bell, Mail, Slack, Save } from 'lucide-react';

interface AlertConfig {
    type: string;
    threshold: number;
    enabled: boolean;
    channels: string[];
}

export const AlertConfiguration = () => {
    // Mock state for now - integrate with backend later
    const [configs, setConfigs] = useState<AlertConfig[]>([
        { type: 'cost', threshold: 100, enabled: true, channels: ['email'] },
        { type: 'security', threshold: 0, enabled: true, channels: ['email', 'slack'] },
    ]);

    const handleToggle = (index: number) => {
        const newConfigs = [...configs];
        newConfigs[index].enabled = !newConfigs[index].enabled;
        setConfigs(newConfigs);
    };

    const handleChannelToggle = (index: number, channel: string) => {
        const newConfigs = [...configs];
        const channels = newConfigs[index].channels;
        if (channels.includes(channel)) {
            newConfigs[index].channels = channels.filter(c => c !== channel);
        } else {
            newConfigs[index].channels = [...channels, channel];
        }
        setConfigs(newConfigs);
    }

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Alert Settings</h2>
            </div>

            <div className="space-y-6">
                {configs.map((config, i) => (
                    <div key={config.type} className="glass-card p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-medium text-white capitalize">{config.type} Alerts</h3>
                                <p className="text-sm text-slate-400">
                                    Notify when {config.type} thresholds are exceeded
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={() => handleToggle(i)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {config.enabled && (
                            <div className="space-y-4 pl-4 border-l-2 border-slate-700">
                                {config.type === 'cost' && (
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Monthly Cost Threshold ($)</label>
                                        <input
                                            type="number"
                                            value={config.threshold}
                                            className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white w-32 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Notification Channels</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleChannelToggle(i, 'email')}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${config.channels.includes('email')
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                                    : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'
                                                }`}
                                        >
                                            <Mail className="w-4 h-4" /> Email
                                        </button>
                                        <button
                                            onClick={() => handleChannelToggle(i, 'slack')}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${config.channels.includes('slack')
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                                    : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'
                                                }`}
                                        >
                                            <Slack className="w-4 h-4" /> Slack
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-end pt-4">
                    <button className="glass-button px-6 py-2 rounded-lg flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
