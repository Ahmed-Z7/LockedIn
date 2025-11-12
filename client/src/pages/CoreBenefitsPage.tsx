import { motion } from 'framer-motion';
import { Zap, Target, Brain, Award, Lock, Rocket } from 'lucide-react';
import { useLocation } from 'wouter';

export default function CoreBenefitsPage() {
  const [, setLocation] = useLocation();

  const benefits = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Personalized AI guidance that adapts to your learning style and pace',
      color: 'from-purple-600 to-purple-700',
      iconColor: 'text-purple-400',
    },
    {
      icon: Lock,
      title: 'Focus Lock Technology',
      description: 'Block distractions and enter deep focus mode with our advanced locking system',
      color: 'from-blue-600 to-blue-700',
      iconColor: 'text-blue-400',
    },
    {
      icon: Target,
      title: 'Precision Scheduling',
      description: 'Smart algorithms create optimal study schedules based on your goals',
      color: 'from-purple-600 to-blue-700',
      iconColor: 'text-purple-400',
    },
    {
      icon: Award,
      title: 'Gamified Progress',
      description: 'Earn badges, streaks, and XP while tracking your learning journey',
      color: 'from-blue-600 to-purple-600',
      iconColor: 'text-blue-400',
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Track your performance with detailed insights and actionable metrics',
      color: 'from-purple-600 to-purple-700',
      iconColor: 'text-purple-400',
    },
    {
      icon: Rocket,
      title: 'Rapid Mastery',
      description: 'Accelerate your learning with proven techniques and personalized paths',
      color: 'from-blue-600 to-blue-700',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Core Benefits
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Discover what makes LOCKEDIN the ultimate productivity and learning platform
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <div className="container mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${benefit.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="relative bg-background border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container text-center mb-20"
      >
        <button
          onClick={() => setLocation('/dashboard')}
          className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 glow-purple"
        >
          Experience These Benefits
        </button>
      </motion.div>
    </div>
  );
}
