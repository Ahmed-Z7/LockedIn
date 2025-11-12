import { motion } from 'framer-motion';
import { Brain, Zap, Target, Users, Trophy, Clock } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI Study Coach",
      description: "Personalized AI guidance in Arabic & English to help you understand any topic",
      color: "from-blue-500 to-blue-600",
      iconColor: "text-blue-400",
    },
    {
      icon: Zap,
      title: "Smart Scheduler",
      description: "AI-powered study plans that adapt to your exam dates and learning pace",
      color: "from-green-500 to-green-600",
      iconColor: "text-green-400",
    },
    {
      icon: Target,
      title: "Focus Mode",
      description: "Block social media and distractions during study sessions automatically",
      color: "from-yellow-500 to-yellow-600",
      iconColor: "text-yellow-400",
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn XP, unlock badges, and climb the leaderboard with your friends",
      color: "from-blue-500 to-green-600",
      iconColor: "text-blue-400",
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Join communities, share achievements, and study together with peers",
      color: "from-green-500 to-yellow-600",
      iconColor: "text-green-400",
    },
    {
      icon: Clock,
      title: "Streaks & Rewards",
      description: "Build daily study streaks and earn exclusive rewards and perks",
      color: "from-yellow-500 to-blue-600",
      iconColor: "text-yellow-400",
    },
  ];

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
    <section className="relative py-20 overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to study smarter and achieve your academic goals
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="relative bg-background border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-gray-600 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
