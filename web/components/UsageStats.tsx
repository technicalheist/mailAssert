'use client';

export default function UsageStats({ current = 124, limit = 500, planName = 'Developer Plan' }: { current?: number, limit?: number, planName?: string }) {
    const percentage = Math.min((current / limit) * 100, 100);

    return (
        <div className="glass-card rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-200">Usage Quotas</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30">
                    {planName}
                </span>
            </div>

            <div className="mb-1 flex justify-between text-xs">
                <span className="text-white font-medium">{current} Emails</span>
                <span className="text-indigo-300">/ {limit}</span>
            </div>

            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="mt-2 text-[10px] text-indigo-400">
                Resets in 14 days
            </p>
        </div>
    );
}
