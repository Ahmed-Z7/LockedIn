import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GlowButton from './GlowButton';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-[#F7F8FF] via-[#F9FAFF] to-[#F7F8FF] dark:from-background dark:via-background dark:to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light Mode: Crystal Glassmorphism */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl dark:hidden"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl dark:hidden"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />

        {/* Dark Mode: Original design */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl hidden dark:block"
          animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl hidden dark:block"
          animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden dark:block"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="container relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 dark:border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/10 px-4 py-2 backdrop-blur-sm"
        >
          <Brain className="w-4 h-4 text-purple-400 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-300 dark:text-purple-300">
            {t('hero.badge')}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 text-5xl md:text-7xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-[#9333EA] via-[#6366F1] to-[#06B6D4] dark:from-purple-400 dark:via-purple-500 dark:to-blue-400 bg-clip-text text-transparent">
            {t('hero.title.part1')}
          </span>
          <br />
          <span className="text-[#0F172A] dark:text-foreground">{t('hero.title.part2')}</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-2xl mx-auto text-xl text-[#1E293B] dark:text-gray-300"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl()}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#06B6D4] dark:from-purple-600 dark:to-purple-500 hover:from-[#7E22CE] dark:hover:from-purple-700 hover:to-[#0891B2] dark:hover:to-purple-600 text-white dark:text-foreground font-semibold transition-all duration-300 flex items-center gap-2"
            style={{
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)',
            }}
          >
            {t('hero.cta.start')}
            <motion.span
              className="inline-block"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/ai-coach')}
            className="px-8 py-4 rounded-lg border border-[#E2E8F0] dark:border-blue-500/50 bg-white dark:bg-transparent text-[#6366F1] dark:text-blue-300 hover:text-[#4F46E5] dark:hover:text-blue-200 font-semibold transition-all duration-300"
            style={{
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
            }}
          >
            {t('hero.cta.ai')}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { label: t('hero.stats.students'), value: "50K+" },
            { label: t('hero.stats.success'), value: "95%" },
            { label: t('hero.stats.tutoring'), value: "24/7" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1 }}
              className="text-center p-4 rounded-lg bg-white/50 dark:bg-transparent dark:border dark:border-purple-500/20 backdrop-blur-md transition-all duration-300"
              style={{
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
              }}
            >
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9333EA] to-[#06B6D4] dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
