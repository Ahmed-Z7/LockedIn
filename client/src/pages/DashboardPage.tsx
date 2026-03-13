import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Award, Flame, Zap, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: badges } = trpc.gamification.getBadges.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sessions } = trpc.studySessions.list.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Dashboard</h1>
          <p className="text-foreground/60 mb-8">Please log in to access your dashboard</p>
          <Button onClick={() => setLocation("/")} className="bg-indigo-600 hover:bg-indigo-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const totalStudyTime = sessions?.reduce((acc, session) => acc + session.duration, 0) || 0;
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || "Learner"}! 👋
          </h1>
          <p className="text-foreground/60 text-lg">Keep up your learning streak and reach new heights</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {/* XP Card */}
          <motion.div
            variants={itemVariants}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-background border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-indigo-500/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground/60 font-semibold">Total XP</h3>
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-4xl font-bold text-indigo-400 mb-2">{xp.toLocaleString()}</p>
              <p className="text-sm text-foreground/40">Keep studying to earn more</p>
            </div>
          </motion.div>

          {/* Level Card */}
          <motion.div
            variants={itemVariants}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-violet-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-background border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground/60 font-semibold">Level</h3>
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-4xl font-bold text-cyan-400 mb-2">{level}</p>
              <p className="text-sm text-foreground/40">{Math.floor((xp % 1000) / 10)}% to next level</p>
            </div>
          </motion.div>

          {/* Study Time Card */}
          <motion.div
            variants={itemVariants}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-background border border-violet-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-violet-500/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground/60 font-semibold">Study Time</h3>
                <Clock className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-4xl font-bold text-violet-400 mb-2">{Math.floor(totalStudyTime / 60)}h</p>
              <p className="text-sm text-foreground/40">{totalStudyTime % 60}m this month</p>
            </div>
          </motion.div>

          {/* Badges Card */}
          <motion.div
            variants={itemVariants}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-background border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-indigo-500/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground/60 font-semibold">Badges</h3>
                <Award className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-4xl font-bold text-indigo-400 mb-2">{badges?.length || 0}</p>
              <p className="text-sm text-foreground/40">Achievements unlocked</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-background border border-indigo-500/20 rounded-2xl p-8 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Recent Study Sessions
          </h2>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-background/50 border border-indigo-500/10 rounded-lg hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div>
                    <p className="font-semibold text-foreground">{session.subject}</p>
                    <p className="text-sm text-foreground/60">
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-cyan-400">{session.duration} min</p>
                    <p className="text-sm text-foreground/60">Focus: {session.focusScore}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/60">No study sessions yet. Start studying to see your progress!</p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Button
            onClick={() => setLocation("/ai-coach")}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-foreground py-6 text-lg"
          >
            Chat with AI Coach
          </Button>
          <Button
            onClick={() => setLocation("/flash-cards")}
            className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-foreground py-6 text-lg"
          >
            Study Flash Cards
          </Button>
          <Button
            onClick={() => setLocation("/schedule")}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-foreground py-6 text-lg"
          >
            Plan Your Study
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
