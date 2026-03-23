import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Clock, Zap, Target, 
  CheckCircle2, Flame, Brain, Shield, 
  Info, Filter, Star, Sparkles, ChevronRight,
  Lock, ArrowUpRight, Activity
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const CATEGORY_MAP: Record<string, { icon: any, label: string, color: string, gradient: string }> = {
  study_time: { icon: Clock, label: 'Study Time', color: 'text-blue-400', gradient: 'from-blue-600/20 to-cyan-500/5' },
  streak: { icon: Flame, label: 'Streak', color: 'text-orange-400', gradient: 'from-orange-600/20 to-red-500/5' },
  focus: { icon: Target, label: 'Focus', color: 'text-purple-400', gradient: 'from-purple-600/20 to-indigo-500/5' },
  consistency: { icon: Shield, label: 'Consistency', color: 'text-green-400', gradient: 'from-green-600/20 to-emerald-500/5' },
  ai_usage: { icon: Brain, label: 'AI Usage', color: 'text-indigo-400', gradient: 'from-indigo-600/20 to-purple-500/5' },
  group: { icon: Users, label: 'Group Study', color: 'text-pink-400', gradient: 'from-pink-600/20 to-rose-500/5' },
};

export default function ChallengesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const challengesQuery = trpc.progression.getChallenges.useQuery();
  const profileQuery = trpc.progression.getProfile.useQuery();

  const challenges = challengesQuery.data ?? [];
  const profile = profileQuery.data?.profile;

  const filteredChallenges = useMemo(() => {
    if (activeCategory === 'all') return challenges;
    return challenges.filter(c => c.category === activeCategory);
  }, [challenges, activeCategory]);

  const stats = useMemo(() => {
    const active = challenges.filter(c => (c.currentProgress || 0) > 0 && (c.completed || 0) === 0).length;
    const completed = challenges.filter(c => (c.completed || 0) === 1).length;
    const totalXp = profile?.xp ?? 0;
    return { active, completed, xp: totalXp };
  }, [challenges, profile]);

  if (challengesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background text-white pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 w-40 bg-white/5 rounded-full" />
              <div className="h-20 w-96 bg-white/5 rounded-2xl" />
              <div className="h-10 w-80 bg-white/5 rounded-lg mt-4" />
            </div>
            <div className="flex gap-4">
               <div className="w-[160px] h-32 bg-card/30 rounded-[2rem] border border-white/5" />
               <div className="w-[160px] h-32 bg-card/30 rounded-[2rem] border border-white/5" />
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-3 mb-12">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-12 w-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-96 bg-card/40 border border-white/10 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-20 relative overflow-hidden selection:bg-purple-500/30">
      
      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3 h-3" /> System Progression
            </div>
            <h1 className="text-6xl font-black mb-4 tracking-tighter leading-[0.9]">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-sm">NEURAL TASKS</span> <br/> 
              <span className="text-white/20 hover:text-white transition-colors cursor-default">LEVEL UP YOUR LIFE</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl font-medium tracking-tight">
              Transform your daily discipline into measurable growth. Complete global challenges to earn XP and unlock legendary neural badges.
            </p>
          </motion.div>

          {/* QUICK STATS */}
          <div className="flex gap-4">
             {[
               { label: 'In Progress', value: stats.active, icon: Activity, bg: 'bg-purple-500/10' },
               { label: 'Mastered', value: stats.completed, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
             ].map((stat, i) => (
               <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                 className="p-8 rounded-[2rem] bg-card/30 backdrop-blur-3xl border border-white/5 flex flex-col items-center justify-center min-w-[160px] group hover:bg-white/[0.05] transition-all shadow-xl shadow-purple-500/5">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">{stat.label}</p>
                 <div className="flex items-center gap-3">
                   <p className={cn("text-4xl font-black", stat.color || "text-white")}>{stat.value}</p>
                   <div className={cn("p-2 rounded-lg", stat.bg)}>
                     <stat.icon className={cn("w-5 h-5", stat.color || "text-white/40")} />
                   </div>
                 </div>
               </motion.div>
             ))}
          </div>
        </header>

        {/* ── FILTERS ── */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <Button variant={activeCategory === 'all' ? 'default' : 'outline'} onClick={() => setActiveCategory('all')} 
            className={cn(
              "rounded-2xl px-8 h-12 font-bold transition-all", 
              activeCategory === 'all' 
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-xl shadow-purple-500/30 border-none" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
            )}>
            All Segments
          </Button>
          {Object.entries(CATEGORY_MAP).map(([slug, meta]) => (
            <Button key={slug} onClick={() => setActiveCategory(slug)} 
              className={cn(
                "rounded-2xl px-6 h-12 font-bold flex items-center gap-2 transition-all border",
                activeCategory === slug 
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-xl shadow-cyan-500/30 border-none" 
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
              )}>
              <meta.icon className="w-4 h-4" /> {meta.label}
            </Button>
          ))}
        </div>

        {/* ── CHALLENGES GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredChallenges.map((challenge, idx) => {
              const meta = CATEGORY_MAP[challenge.category] || { icon: Target, label: challenge.category, color: 'text-gray-400', gradient: 'from-gray-500/10 to-transparent' };
              const Icon = meta.icon;
              const progressRaw = challenge.currentProgress || 0;
              const target = challenge.targetValue || 1;
              const progressPercent = Math.min(100, Math.round((progressRaw / target) * 100));
              const isCompleted = (challenge.completed || 0) === 1;

              return (
                <motion.div key={challenge.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "relative group bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden",
                    isCompleted && "border-cyan-500/30 shadow-cyan-500/5 bg-cyan-500/[0.02]"
                  )}>
                  
                  {/* Category Accent */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br transition-opacity duration-700 opacity-0 group-hover:opacity-100 pointer-events-none", meta.gradient)} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                       <div className={cn("p-4 rounded-2xl bg-white/5 shadow-inner transition-transform group-hover:scale-110", meta.color)}>
                          <Icon className="w-8 h-8" />
                       </div>
                       {isCompleted ? (
                         <div className="flex items-center gap-1.5 font-black text-[10px] text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20 uppercase tracking-widest shadow-lg shadow-cyan-500/10">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 font-black text-[10px] text-white/30 uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-full bg-white/5">
                           <Activity className="w-3.5 h-3.5" /> Active
                         </div>
                       )}
                    </div>

                    <h3 className="text-2xl font-black mb-3 tracking-tight leading-tight group-hover:text-purple-400 transition-colors uppercase">{challenge.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed font-bold mb-8 h-10 overflow-hidden line-clamp-2">{challenge.description}</p>

                    <div className="space-y-4 mb-10">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                        <span>Neural Progress</span>
                        <span className={cn("font-mono", isCompleted ? "text-emerald-400" : "text-white")}>
                          {progressRaw.toLocaleString()} / {target.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10 shadow-inner relative">
                        <motion.div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.4)]", 
                            isCompleted ? "from-cyan-400 to-blue-600" : "from-purple-600 via-indigo-500 to-cyan-500"
                        )}
                          initial={{ width: 0 }} 
                          animate={{ width: `${progressPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter mb-1">XP Reward</p>
                          <p className="text-sm font-black text-yellow-500/80 tracking-tight flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-yellow-500" /> +{challenge.rewardXp}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter mb-1">Difficulty</p>
                          <p className={cn("text-sm font-black tracking-tight capitalize", 
                            challenge.difficulty === 'hard' ? 'text-red-400/80' : 
                            challenge.difficulty === 'medium' ? 'text-orange-400/80' : 'text-emerald-400/80'
                          )}>
                             {challenge.difficulty}
                          </p>
                        </div>
                      </div>

                      <Button 
                        disabled={isCompleted}
                        className={cn(
                          "rounded-xl px-6 font-bold h-10 text-[10px] uppercase tracking-widest transition-all",
                          isCompleted ? "bg-emerald-500/10 text-emerald-400/40 border border-emerald-500/20" : "bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95"
                        )}
                      >
                        {isCompleted ? "MASTERED" : "REINFORCE"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
               <Lock className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/20 font-black uppercase tracking-[0.2em]">No neural matches found in this segment.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// Utility function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
