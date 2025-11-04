import { motion } from 'framer-motion';
import {
  BarChart3,
  Flame,
  Zap,
  Trophy,
  Clock,
  Target,
} from 'lucide-react';
import NeonCard from './NeonCard';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  glowColor: 'indigo' | 'cyan' | 'violet';
  delay: number;
}

function StatCard({
  icon,
  label,
  value,
  change,
  glowColor,
  delay,
}: StatCardProps) {
  return (
    <NeonCard glowColor={glowColor} delay={delay}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className="text-xs text-green-400 mt-2">↑ {change}</p>
          )}
        </div>
        <motion.div
          className={`p-3 rounded-lg bg-gradient-to-br ${
            glowColor === 'indigo'
              ? 'from-indigo-500/20 to-indigo-600/20'
              : glowColor === 'cyan'
                ? 'from-cyan-500/20 to-cyan-600/20'
                : 'from-violet-500/20 to-violet-600/20'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
      </div>
    </NeonCard>
  );
}

export default function Dashboard() {
  const stats = [
    {
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      label: 'Study Hours',
      value: '24.5h',
      change: '12% from last week',
      glowColor: 'indigo' as const,
    },
    {
      icon: <Flame className="w-6 h-6 text-cyan-400" />,
      label: 'Focus Streak',
      value: '7 days',
      change: 'Keep it up!',
      glowColor: 'cyan' as const,
    },
    {
      icon: <Zap className="w-6 h-6 text-violet-400" />,
      label: 'XP Earned',
      value: '1,250',
      change: '8% increase',
      glowColor: 'violet' as const,
    },
    {
      icon: <Trophy className="w-6 h-6 text-indigo-400" />,
      label: 'Badges Unlocked',
      value: '12',
      change: '3 new this week',
      glowColor: 'indigo' as const,
    },
    {
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      label: 'Goals Completed',
      value: '8/10',
      change: '80% progress',
      glowColor: 'cyan' as const,
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-violet-400" />,
      label: 'Performance',
      value: '92%',
      change: 'Excellent!',
      glowColor: 'violet' as const,
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Your Learning Dashboard
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Track your progress, maintain your focus streak, and unlock achievements
            as you advance through your studies.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              glowColor={stat.glowColor}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Progress section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <NeonCard glowColor="indigo">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Weekly Progress</h3>

              {['Mathematics', 'Physics', 'Chemistry'].map((subject, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{subject}</span>
                    <span className="text-indigo-400 font-semibold">
                      {75 + index * 5}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${75 + index * 5}%` }}
                      transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        </motion.div>
      </div>
    </section>
  );
}
