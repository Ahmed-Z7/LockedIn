import { motion } from 'framer-motion';
import { Brain, Zap, Target, Users, Trophy, Clock } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI Study Coach",
      description: "Personalized AI guidance in Arabic & English to help you understand any topic",
      color: "from-purple-500 to-purple-600",
      iconColor: "text-purple-400",
    },
    {
      icon: Zap,
      title: "Smart Scheduler",
      description: "AI-powered study plans that adapt to your exam dates and learning pace",
      color: "from-blue-500 to-blue-600",
      iconColor: "text-blue-400",
    },
    {
      icon: Target,
      title: "Focus Mode",
      description: "Block social media and distractions during study sessions automatically",
      color: "from-purple-600 to-purple-500",
      iconColor: "text-purple-400",
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn XP, unlock badges, and climb the leaderboard with your friends",
      color: "from-blue-500 to-purple-600",
      iconColor: "text-blue-400",
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Join communities, share achievements, and study together with peers",
      color: "from-purple-500 to-blue-600",
      iconColor: "text-purple-400",
    },
    {
      icon: Clock,
      title: "Streaks & Rewards",
      description: "Build daily study streaks and earn exclusive rewards and perks",
      color: "from-blue-500 to-purple-500",
      iconColor: "text-blue-400",
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
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to ace your exams and build lasting study habits
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-purple-500/20 p-8 hover:border-purple-500/50 transition-all duration-300"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>

                  {/* Accent line */}
                  <div className={`mt-6 h-1 w-12 bg-gradient-to-r ${feature.color} rounded-full group-hover:w-full transition-all duration-300`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
