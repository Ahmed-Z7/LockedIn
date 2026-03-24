import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Trophy, Lock, Rocket, Target, Brain, Shield, Zap, Star, ChevronRight, CheckCircle2, Binary, Waves, Cpu, Database, Crown, Flame, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const LEVEL_NAMES = [
    "Deep Origin",
    "Neural Spark",
    "Logic Layer",
    "Flow State",
    "Core Processor",
    "Data Architect",
    "System Master",
    "Peak Focus",
    "Ultra Instinct",
    "Transcendent Scholar"
];

const LEVEL_ICONS = [
    Brain, Sparkle, Binary, Waves, Cpu, Database, Crown, Zap, Flame, Trophy
];

// Fallback icons if some are missing from lucide
function Sparkle(props: any) { return <Sparkles {...props} /> }

export default function GamificationLevelsPage() {
    const [location, setLocation] = useLocation();
    const { data: sessions, isLoading, refetch } = trpc.study.getSchedule.useQuery();
    const savePlanMutation = trpc.study.savePlan.useMutation();
    
    const [completedLevel, setCompletedLevel] = useState<number | null>(null);
    const [showOctopus, setShowOctopus] = useState(false);

    // Group sessions into 10 levels
    const levels = Array.from({ length: 10 }, (_, i) => {
        if (!sessions || sessions.length === 0) return { id: i + 1, title: LEVEL_NAMES[i], sessions: [], status: 'locked' };

        const perLevel = Math.ceil(sessions.length / 10);
        const start = i * perLevel;
        const end = Math.min(start + perLevel, sessions.length);
        const levelSessions = sessions.slice(start, end);
        
        const isCompleted = levelSessions.length > 0 && levelSessions.every(s => s.completed === 1);
        const isUnlocked = i === 0 || (sessions.slice(0, start).every(s => s.completed === 1));

        return {
            id: i + 1,
            title: LEVEL_NAMES[i],
            sessions: levelSessions,
            status: isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'
        };
    });

    const overallProgress = sessions? (sessions.filter(s => s.completed === 1).length / sessions.length) * 100 : 0;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#000d1a] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(75,0,130,0.2),transparent_70%)] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="text-center mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent italic tracking-tighter"
                    >
                        NEURAL ASCENSION MAP
                    </motion.h1>
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3">
                            <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
                            <span className="font-bold">{Math.round(overallProgress)}% SYNCED</span>
                        </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="max-w-md mx-auto h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                        />
                    </div>
                </header>

                {/* Levels Path/Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {levels.map((level, idx) => {
                        const Icon = LEVEL_ICONS[idx] || Star;
                        return (
                            <motion.div
                                key={level.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`relative group ${level.status === 'locked' ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className={`
                                    p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center gap-4 h-full
                                    ${level.status === 'completed' 
                                        ? 'bg-purple-900/40 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                                        : level.status === 'unlocked'
                                        ? 'bg-cyan-900/20 border-cyan-500/50 hover:bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                                        : 'bg-slate-900/50 border-white/5'}
                                `}>
                                    {/* Level Number Badge */}
                                    <div className={`
                                        absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2
                                        ${level.status === 'completed' ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-slate-800 border-white/20 text-white'}
                                    `}>
                                        {level.id}
                                    </div>

                                    <div className={`
                                        w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110
                                        ${level.status === 'completed' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-cyan-400'}
                                    `}>
                                        <Icon size={32} />
                                    </div>

                                    <h3 className="text-xl font-black text-center tracking-tighter uppercase italic">{level.title}</h3>
                                    
                                    <div className="flex flex-col gap-2 w-full mt-auto">
                                        {level.status === 'locked' ? (
                                            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold">
                                                <Lock size={14} /> LOCKED
                                            </div>
                                        ) : level.status === 'completed' ? (
                                            <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-bold">
                                                <CheckCircle2 size={16} /> MASTERED
                                            </div>
                                        ) : (
                                            <Button 
                                                onClick={() => setLocation(`/schedule`)}
                                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black italic skew-x-[-10deg] transition-all"
                                            >
                                                START QUEST
                                            </Button>
                                        )}
                                    </div>

                                    {/* Progress circles for sessions inside */}
                                    <div className="flex gap-1 mt-2">
                                        {level.sessions.map((s, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-2 h-2 rounded-full ${s.completed === 1 ? 'bg-cyan-400' : 'bg-white/10'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Connector line for path (visual only) */}
                                {idx < 9 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 w-4 h-0.5 bg-white/10" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <Button 
                        variant="outline" 
                        onClick={() => setLocation('/schedule')}
                        className="bg-transparent border-white/10 text-white/50 hover:text-white"
                    >
                        Back to Schedule View
                    </Button>
                </div>
            </div>

            {/* Level Complete Celebration Overlay */}
            <AnimatePresence>
                {showOctopus && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="relative w-full max-w-lg mb-8"
                        >
                            <img 
                                src="/images/octopus/octopus_main.png" 
                                alt="Octopus Celebration" 
                                className="w-full drop-shadow-[0_0_50px_rgba(168,85,247,0.5)]"
                                onError={(e) => {
                                    // Fallback if image copy failed
                                    (e.target as any).src = "https://placehold.co/600x400/1a1a1a/purple?text=Octopus+Party!";
                                }}
                            />
                            
                            {/* Confetti particles - CSS based */}
                            <div className="absolute inset-0 overflow-visible pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ 
                                            x: '50%', y: '50%', 
                                            scale: 0, 
                                            rotate: 0,
                                            backgroundColor: ['#22d3ee', '#a855f7', '#fbbf24'][Math.floor(Math.random() * 3)]
                                        }}
                                        animate={{ 
                                            x: `${Math.random() * 200 - 100}%`, 
                                            y: `${Math.random() * 200 - 100}%`, 
                                            scale: Math.random() + 0.5,
                                            rotate: 360,
                                            opacity: 0
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
                                        className="absolute w-4 h-4 rounded-sm"
                                    />
                                ))}
                            </div>
                        </motion.div>

                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.3 }}
                            className="text-5xl font-black mb-4 tracking-tighter uppercase italic"
                        >
                            <span className="text-cyan-400">LEVEL</span> <span className="text-purple-400">COMPLETE!</span>
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.5 }}
                            className="text-white/60 text-xl mb-8 max-w-md mx-auto"
                        >
                            Your neural network is evolving. The Octopus is pleased with your progress.
                        </motion.p>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button 
                                onClick={() => setShowOctopus(false)}
                                className="px-12 py-8 text-xl font-black bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                            >
                                CONTINUE ASCENSION
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
