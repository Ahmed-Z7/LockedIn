import React from 'react';
import { motion } from 'framer-motion';
import { Book, CheckCircle2, Clock, Zap, TrendingUp, BarChart3, PieChart, Target, BrainCircuit, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
    const { isAuthenticated } = useAuth();
    const { data: schedule } = trpc.study.getSchedule.useQuery(undefined, {
        enabled: isAuthenticated
    });

    const totalSessions = schedule?.length || 0;
    const completedSessions = schedule?.filter(s => s.completed === 1).length || 0;
    const totalMinutes = schedule?.reduce((acc, s) => acc + s.duration, 0) || 0;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const stats = [
        { label: 'Neural Sync', value: `${completionRate}%`, icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Completed', value: completedSessions, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Study Hours', value: Math.round(totalMinutes / 60), icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ];

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />
            
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <main className="max-w-6xl mx-auto pt-28 pb-20 px-4 relative z-10">
                <header className="mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2"
                    >
                        Intelligence Hub
                    </motion.h1>
                    <p className="text-foreground/40 font-medium">Data-driven insights into your study trajectory.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-3xl group hover:border-purple-500/30 transition-all shadow-lg"
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="text-3xl font-black mb-1">{stat.value}</div>
                            <div className="text-sm font-semibold text-foreground/40 uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card/30 backdrop-blur-xl border border-white/5 p-8 rounded-3xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                Mastery Progress
                            </h2>
                            <span className="text-2xl font-black text-purple-400">{completionRate}%</span>
                        </div>
                        
                        <div className="space-y-6">
                            {(schedule || []).slice(0, 6).map((session, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className={cn("font-semibold", session.completed ? "text-emerald-400" : "text-foreground/70")}>
                                            {session.subject}
                                        </span>
                                        <span className="text-foreground/30">{session.completed ? '100%' : '0%'}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: session.completed ? '100%' : '0%' }}
                                            className={cn(
                                                "h-full bg-gradient-to-r",
                                                session.completed ? "from-emerald-500 to-teal-500" : "from-purple-500 to-indigo-500 opacity-30"
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            {!schedule?.length && (
                                <p className="text-center py-12 text-foreground/30 italic">No plan streams captured yet. Start a session to see telemetry here.</p>
                            )}
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        {/* Weekly Efficiency */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform"
                        >
                            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-purple-400/10 rotate-12" />
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                Optimization Status
                            </h2>
                            <p className="text-foreground/60 leading-relaxed mb-6 font-medium">
                                Your neural synchronicity is peaking in the <strong>Evening</strong>. We suggest moving deeper topics to 7:00 PM - 9:00 PM slots.
                            </p>
                            <div className="flex gap-4">
                                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex-1 text-center">
                                    <div className="text-[10px] text-foreground/30 mb-1 uppercase tracking-widest font-black">Retention</div>
                                    <div className="text-xl font-black text-purple-400">84%</div>
                                </div>
                                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex-1 text-center">
                                    <div className="text-[10px] text-foreground/30 mb-1 uppercase tracking-widest font-black">Focus Vibe</div>
                                    <div className="text-xl font-black text-blue-400">Stable</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Efficiency Metrics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card/30 backdrop-blur-xl border border-white/5 p-8 rounded-3xl"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                Efficiency Metrics
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-6 bg-white/5 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all">
                                    <div className="text-3xl font-black text-blue-400 mb-1">9.2</div>
                                    <div className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">Focus Score</div>
                                </div>
                                <div className="text-center p-6 bg-white/5 border border-white/5 rounded-2xl group hover:border-purple-500/30 transition-all">
                                    <div className="text-3xl font-black text-purple-400">2.4x</div>
                                    <div className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">Pace Multiplier</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
