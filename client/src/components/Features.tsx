import { motion } from 'framer-motion';
import {
  Brain,
  Calendar,
  Gamepad2,
  MessageSquare,
  Zap,
  BarChart3,
} from 'lucide-react';
import NeonCard from './NeonCard';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  glowColor: 'indigo' | 'cyan' | 'violet';
  delay: number;
}

function FeatureCard({
  icon,
  title,
  description,
  glowColor,
  delay,
}: FeatureProps) {
  return (
    <NeonCard glowColor={glowColor} delay={delay}>
      <motion.div
        className={`p-3 rounded-lg w-fit mb-4 bg-gradient-to-br ${
          glowColor === 'indigo'
            ? 'from-indigo-500/20 to-indigo-600/20'
            : glowColor === 'cyan'
              ? 'from-cyan-500/20 to-cyan-600/20'
              : 'from-violet-500/20 to-violet-600/20'
        }`}
        whileHover={{ scale: 1.1, rotate: -5 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </NeonCard>
  );
}

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-indigo-400" />,
      title: 'AI Study Coach',
      description:
        'Get personalized guidance from our AI-powered study coach that adapts to your learning style.',
      glowColor: 'indigo' as const,
    },
    {
      icon: <Calendar className="w-8 h-8 text-cyan-400" />,
      title: 'Smart Scheduler',
      description:
        'Automatically generate optimized study schedules based on your goals and available time.',
      glowColor: 'cyan' as const,
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-violet-400" />,
      title: 'Gamification',
      description:
        'Earn XP, unlock badges, and maintain focus streaks to stay motivated throughout your journey.',
      glowColor: 'violet' as const,
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-indigo-400" />,
      title: 'Real-Time Chat',
      description:
        'Chat with your AI assistant anytime for instant help with homework and concept clarification.',
      glowColor: 'indigo' as const,
    },
    {
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      title: 'Focus Mode',
      description:
        'Enter a distraction-free zone with ambient sounds and pomodoro timers for deep work.',
      glowColor: 'cyan' as const,
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-violet-400" />,
      title: 'Analytics',
      description:
        'Visualize your progress with detailed insights into your study habits and performance.',
      glowColor: 'violet' as const,
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0] }}
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
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to study smarter, not harder. Our platform combines
            cutting-edge AI with proven learning techniques.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              glowColor={feature.glowColor}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
