import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Award, Flame, Zap, Clock, TrendingUp, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/auth" });
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.userAccount.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sessions } = trpc.study.getSchedule.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background Blobs - Unified with Home Page */}
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-6xl mx-auto pt-28 pb-20 px-4 relative z-10">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              Hello, <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">{user?.name || "Alex"}</span> 👋
            </h1>
            <p className="text-foreground/40 font-medium text-lg">Stay locked in — your goals are waiting.</p>
          </div>
        </motion.header>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/30 backdrop-blur-3xl border border-border/50 p-12 rounded-[2.5rem] mb-12 relative overflow-hidden group border-purple-500/20 shadow-2xl shadow-purple-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
              Study Smarter with <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">AI-Powered</span> Learning
            </h2>
            <p className="text-foreground/60 text-lg font-medium mb-10 leading-relaxed">
              Upload your study materials and let LOCKEDIN build your personalized study schedule in seconds.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setLocation("/start-learning")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl px-8 py-7 text-lg font-bold shadow-xl shadow-purple-500/20 group hover:scale-105 transition-all"
              >
                <Zap className="w-5 h-5 mr-2 fill-white" />
                Start Learning
              </Button>
              <Button 
                onClick={() => setLocation("/schedule")}
                variant="outline"
                size="lg"
                className="border-border bg-white/5 hover:bg-white/10 rounded-2xl px-8 py-7 text-lg font-bold backdrop-blur-xl group hover:scale-105 transition-all"
              >
                <Clock className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
            </div>

            <div className="mt-12 flex justify-center gap-12 border-t border-border/50 pt-12">
               <div className="text-center">
                 <div className="text-2xl font-black text-purple-400">50K+</div>
                 <div className="text-xs uppercase tracking-widest text-foreground/30 font-bold">Active Users</div>
               </div>
               <div className="text-center border-x border-border/50 px-12">
                 <div className="text-2xl font-black text-emerald-400">95%</div>
                 <div className="text-xs uppercase tracking-widest text-foreground/30 font-bold">Success Rate</div>
               </div>
               <div className="text-center">
                 <div className="text-2xl font-black text-blue-400">24/7</div>
                 <div className="text-xs uppercase tracking-widest text-foreground/30 font-bold">AI Support</div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Day Streak', value: profile?.streak || 0, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: 'Sessions Done', value: sessions?.filter(s => s.completed === 1)?.length || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Neural XP', value: profile?.xp || 0, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: 'Active Challenges', value: 'View All', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10', path: '/challenges' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => stat.path && setLocation(stat.path)}
                className={cn(
                  "bg-card/40 backdrop-blur-3xl border border-border p-6 rounded-3xl group transition-all shadow-xl hover:scale-105",
                  i === 0 ? "border-cyan-500/30 shadow-cyan-500/10" : "border-border/50",
                  stat.path && "cursor-pointer hover:bg-white/[0.05]"
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                  {stat.label}
                  {stat.path && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </motion.div>
            ))}
        </div>

        {/* Progress Tracker Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/30 backdrop-blur-xl border border-border p-8 rounded-[2rem] shadow-2xl"
        >
          <div className="flex justify-between items-end mb-6">
            <div>
               <h3 className="text-xl font-bold mb-1">Weekly Objective</h3>
               <p className="text-foreground/40 text-sm font-medium">
                 {sessions?.length ? `${sessions?.filter(s => s.completed === 1).length} of ${sessions.length} sessions completed` : "No active goals in system memory."}
               </p>
            </div>
            <div className="text-2xl font-black text-purple-400">
               {sessions?.length ? Math.round((sessions?.filter(s => s.completed === 1).length / sessions.length) * 100) : 0}%
            </div>
          </div>
          
          <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-border/50 p-1 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${sessions?.length ? (sessions?.filter(s => s.completed === 1).length / sessions.length) * 100 : 0}%` }}
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
            </motion.div>
          </div>
          
          
          <p className="mt-6 text-foreground/30 text-xs font-semibold uppercase tracking-[0.2em] text-center">
            Neural Synchronicity at {sessions?.length ? Math.round((sessions?.filter(s => s.completed === 1).length / sessions.length) * 100) : 0}% Optimization
          </p>
        </motion.div>

        {/* Top Rank Preview */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           onClick={() => setLocation("/leaderboard")}
           className="mt-6 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/20 p-8 rounded-[2rem] shadow-2xl flex items-center justify-between cursor-pointer group hover:bg-white/[0.02] transition-colors"
        >
            <div>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3 text-white">
                   <Award className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" /> 
                   Check Global Rankings
                </h3>
                <p className="text-foreground/60 font-medium">See how you stack up against the rest of the network and your squads.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-lg">
                <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
        </motion.div>
      </main>
    </div>
  );
}
