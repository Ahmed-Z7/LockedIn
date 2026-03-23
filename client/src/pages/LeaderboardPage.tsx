import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Star, Users, Globe, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type LeaderboardTab = 'global' | 'level' | 'squads';

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');

    const globalQuery = trpc.leaderboards.getGlobal.useQuery(undefined, { enabled: activeTab === 'global' });
    const levelQuery = trpc.leaderboards.getSameLevel.useQuery(undefined, { enabled: activeTab === 'level' });
    const squadsQuery = trpc.leaderboards.getSquads.useQuery(undefined, { enabled: activeTab === 'squads' });

    const getQueryData = () => {
        if (activeTab === 'global') return { data: globalQuery.data?.map(d => ({ ...d, identifier: d.username, primaryLabel: d.name, score: d.xp })), isLoading: globalQuery.isPending };
        if (activeTab === 'level') return { data: levelQuery.data?.map(d => ({ ...d, identifier: d.username, primaryLabel: d.name, score: d.xp })), isLoading: levelQuery.isPending };
        
        // Squads mapping
        return { 
            data: squadsQuery.data?.map(s => ({ 
                id: s.id, 
                avatar: s.avatar, 
                identifier: `Members: ${s.memberCount}`, 
                primaryLabel: s.name, 
                score: s.totalXp,
                isSquad: true
            })), 
            isLoading: squadsQuery.isPending 
        };
    };

    const { data, isLoading } = getQueryData();
    const sortedData = data ? [...data].sort((a, b) => (b.score || 0) - (a.score || 0)) : [];
    
    const topThree = sortedData.slice(0, 3);
    const rest = sortedData.slice(3);

    // Podium ordering: 2nd, 1st, 3rd
    const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

    // Helper for tier colors
    const getTierColor = (index: number) => {
        if (index === 0) return "from-yellow-400 to-amber-600 shadow-yellow-500/50 text-yellow-100 ring-yellow-400/50";
        if (index === 1) return "from-slate-300 to-slate-500 shadow-slate-400/50 text-slate-100 ring-slate-300/50";
        if (index === 2) return "from-orange-400 to-amber-700 shadow-orange-500/50 text-orange-100 ring-orange-400/50";
        return "from-purple-500 to-indigo-600 shadow-purple-500/20 text-white ring-white/10";
    };

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-background text-foreground relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="max-w-6xl mx-auto p-8 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-16 pt-8">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-6 ring-1 ring-purple-500/30"
                    >
                        <Crown className="w-12 h-12 text-purple-400" />
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
                        Nex Hall of Fame
                    </h1>
                    <p className="text-xl text-foreground/40 font-medium">Rankings refresh in real-time. Dominate your tier.</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="flex p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        {[
                            { id: 'global', icon: Globe, label: 'Global Rank' },
                            { id: 'level', icon: Star, label: 'My Level' },
                            { id: 'squads', icon: Users, label: 'Top Squads' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as LeaderboardTab)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300",
                                    activeTab === tab.id 
                                        ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
                                        : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "animate-pulse" : "")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-16"
                        >
                            {/* Podium Section */}
                            {topThree.length > 0 && (
                                <div className="flex justify-center items-end gap-6 h-80 mb-12">
                                    {podiumOrder.map((user, idx) => {
                                        // Map idx 0=2nd, 1=1st, 2=3rd
                                        const rank = topThree.length === 3 ? (idx === 1 ? 1 : idx === 0 ? 2 : 3) : idx + 1;
                                        const height = rank === 1 ? "h-64" : rank === 2 ? "h-48" : "h-40";
                                        const color = getTierColor(rank - 1);
                                        
                                        return (
                                            <div key={user.id} className="flex flex-col items-center relative group">
                                                {/* Medal / Rank Icon */}
                                                <div className={cn(
                                                    "absolute -top-16 z-20 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-xl border-2 transition-transform group-hover:scale-110",
                                                    rank === 1 ? "bg-yellow-400 text-yellow-900 border-yellow-200" :
                                                    rank === 2 ? "bg-slate-300 text-slate-800 border-white" :
                                                    "bg-orange-400 text-orange-900 border-orange-200"
                                                )}>
                                                    #{rank}
                                                </div>

                                                {/* User Avatar */}
                                                <div className={cn(
                                                    "absolute -top-6 z-10 rounded-full border-4 overflow-hidden mb-4 shadow-2xl transition-transform group-hover:-translate-y-2",
                                                    rank === 1 ? "w-24 h-24 border-yellow-400" : "w-20 h-20 border-slate-300",
                                                    rank === 3 && "border-orange-400"
                                                )}>
                                                    {user.avatar ? (
                                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-black">
                                                            {user.primaryLabel?.[0] || "?"}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Podium Pillar */}
                                                <div className={cn("w-40 rounded-t-3xl bg-gradient-to-b relative flex flex-col items-center justify-end pb-6 ring-1 ring-inset", color, height)}>
                                                    <div className="text-center px-2">
                                                        <div className="font-bold truncate w-32">{user.primaryLabel}</div>
                                                        <div className="text-xs opacity-70 mb-2 truncate">{user.identifier}</div>
                                                        <div className="font-black text-2xl flex items-center justify-center gap-1">
                                                            <Zap className="w-4 h-4" />
                                                            {user.score?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* List Section */}
                            {rest.length > 0 && (
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {rest.map((user, idx) => {
                                        const rank = idx + 4;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={user.id}
                                                className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="w-12 text-center font-black text-2xl text-foreground/40">
                                                    #{rank}
                                                </div>
                                                
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-lg">
                                                            {user.primaryLabel?.[0] || "?"}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="font-bold text-lg">{user.primaryLabel}</div>
                                                    <div className="text-sm text-foreground/40">{user.identifier}</div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-black text-2xl text-purple-400 flex items-center gap-2">
                                                        {user.score?.toLocaleString()} <Zap className="w-5 h-5 text-purple-500" />
                                                    </div>
                                                    <div className="text-xs uppercase tracking-widest text-foreground/20 font-bold">Total XP</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
