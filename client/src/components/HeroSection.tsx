import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GlowButton from './GlowButton';

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-[#F7F8FF] via-[#F9FAFF] to-[#F7F8FF]">
      {/* Animated background elements - Crystal Glassmorphism */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-Left: Fuchsia-Purple glow */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        {/* Bottom-Right: Cyan opalescent glow */}
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        {/* Subtle neural network pattern overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(196, 181, 253, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(165, 243, 252, 0.05) 0%, transparent 50%)',
        }} />
      </div>

      {/* Content */}
      <motion.div
        className="container relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge - Crystal Circuit Pattern */}
        <motion.div
          variants={itemVariants}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/40 px-4 py-2 backdrop-blur-md shadow-sm"
          style={{
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.05)',
          }}
        >
          <Brain className="w-4 h-4 text-[#6366F1]" />
          <span className="text-sm font-medium text-[#1E293B]">
            AI-Powered Smart Learning
          </span>
        </motion.div>

        {/* Main heading - Dimensional Crystal Glass Text */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 text-5xl md:text-7xl font-bold tracking-tight"
        >
          <motion.span
            className="inline-block bg-gradient-to-r from-[#9333EA] via-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            Study Smarter
          </motion.span>
          <br />
          <span className="text-[#0F172A]">Not Harder</span>
        </motion.h1>

        {/* Subheading - Soft glowing text */}
        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-2xl mx-auto text-xl text-[#1E293B]"
        >
          LOCKEDIN combines AI guidance, gamified learning, and personalized scheduling to help you ace your exams with focus and motivation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Primary Button - Crystal Glass with gradient */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl()}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#06B6D4] hover:from-[#7E22CE] hover:to-[#0891B2] text-white font-semibold transition-all duration-300 flex items-center gap-2"
            style={{
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            Start Learning Today
            <motion.span
              className="inline-block"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </motion.button>

          {/* Secondary Button - Crystal Panel Outline */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/ai-coach')}
            className="px-8 py-4 rounded-lg border border-[#E2E8F0] bg-white text-[#6366F1] hover:text-[#4F46E5] font-semibold transition-all duration-300"
            style={{
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            Try AI Coach
          </motion.button>
        </motion.div>

        {/* Stats - Crystal Panels */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { label: "Active Students", value: "50K+" },
            { label: "Success Rate", value: "95%" },
            { label: "AI Tutoring", value: "24/7" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1, y: -4 }}
              className="text-center p-4 rounded-lg bg-white/50 backdrop-blur-md border border-[#E5E7EB] transition-all duration-300"
              style={{
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              }}
            >
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9333EA] to-[#06B6D4] bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-[#64748B] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
