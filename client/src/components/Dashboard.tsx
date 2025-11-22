import { motion } from 'framer-motion';
import { TrendingUp, Flame, Award, Clock } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      icon: TrendingUp,
      label: 'Current Streak',
      value: '12 Days',
      color: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-400',
    },
    {
      icon: Flame,
      label: 'Total XP',
      value: '2,450 XP',
      color: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-400',
    },
    {
      icon: Award,
      label: 'Badges Earned',
      value: '8 Badges',
      color: 'from-purple-600 to-purple-500',
      iconColor: 'text-purple-400',
    },
    {
      icon: Clock,
      label: 'Study Time',
      value: '45h 30m',
      color: 'from-blue-500 to-purple-600',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
              Your Progress Dashboard
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track your learning journey with real-time statistics and achievements
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="relative bg-background border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-8 h-8 rounded-full border-2 border-transparent border-t-purple-400 border-r-blue-400"
                    />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-background border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Level Progress</h3>
            <span className="text-purple-400 font-semibold">Level 5</span>
          </div>
          <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '65%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
          <p className="text-gray-400 text-sm mt-3">650 / 1000 XP to next level</p>
        </motion.div>
      </div>
    </section>
  );
}
