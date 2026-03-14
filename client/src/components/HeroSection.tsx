import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GlowButton from './GlowButton';
import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track mouse position for reactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // Animated data cube component
  const DataCube = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
    <motion.div
      className="absolute w-2 h-2 rounded-sm hidden dark:block"
      style={{
        background: 'linear-gradient(135deg, #06C5D0, #06B6D4)',
        boxShadow: '0 0 8px rgba(6, 197, 208, 0.6)',
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, -200, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* DARK MODE: Celestial Deep Space Background */}
      <div className="absolute inset-0 hidden dark:block">
        {/* Celestial Nebula Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #0B1026 0%, #06C5D0 50%, #9B51E0 100%)`,
          }}
        />

        {/* Animated Data Streams - Circuit Board Traces */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(6, 197, 208, 0.3))',
          }}
        >
          <defs>
            <linearGradient id="dataStreamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06C5D0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9B51E0" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M 0,100 Q 250,50 500,100 T 1000,100"
            stroke="url(#dataStreamGradient)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0,300 Q 250,250 500,300 T 1000,300"
            stroke="url(#dataStreamGradient)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0,500 Q 250,450 500,500 T 1000,500"
            stroke="url(#dataStreamGradient)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Animated Data Cubes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <DataCube
            key={i}
            delay={i * 0.3}
            x={Math.random() * 100}
            y={Math.random() * 100}
          />
        ))}

        {/* Reactive Background Flow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(6, 197, 208, 0.15), transparent 80%)`,
          }}
          transition={{ type: 'tween', duration: 0.3 }}
        />
      </div>

      {/* LIGHT MODE: Crystal Glassmorphism Background */}
      <div className="absolute inset-0 dark:hidden">
        {/* Soft Off-White Background with Opalescent Glows */}
        <div
          className="absolute inset-0"
          style={{
            background: '#F7F8FF',
          }}
        />

        {/* Top-Left: Fuchsia-Purple Glow */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Bottom-Right: Cyan Glow */}
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />

        {/* Subtle Nebula Pattern (Implicit) */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)
            `,
          }}
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
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 dark:border-cyan-500/30 bg-purple-500/10 dark:bg-cyan-500/10 px-4 py-2 backdrop-blur-sm"
        >
          <Brain className="w-4 h-4 text-purple-400 dark:text-cyan-400" />
          <span className="text-sm font-medium text-purple-600 dark:text-cyan-300">
            AI-Powered Smart Learning
          </span>
        </motion.div>

        {/* Main heading with Breathing Animation */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 text-5xl md:text-7xl font-bold tracking-tight"
        >
          {/* "Study Smarter" - Fuchsia to Purple to Blue Gradient */}
          <motion.span
            className="inline-block bg-gradient-to-r from-[#9333EA] via-[#6366F1] to-[#06B6D4] dark:from-[#EC4899] dark:via-[#9B51E0] dark:to-[#06C5D0] bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            Study Smarter
          </motion.span>
          <br />
          {/* "Not Harder" - Dark text in Light Mode, Cyan gradient in Dark Mode */}
          <motion.span
            className="text-[#0F172A] dark:bg-gradient-to-r dark:from-[#06C5D0] dark:to-[#0891B2] dark:bg-clip-text dark:text-transparent"
            animate={{
              opacity: [1, 0.8, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Not Harder
          </motion.span>
        </motion.h1>

        {/* Subheading with Hover Illumination */}
        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-2xl mx-auto text-xl text-[#1E293B] dark:text-gray-300"
          whileHover={{ color: '#0F172A' }}
        >
          LOCKEDIN combines{' '}
          <motion.span
            className="font-semibold text-[#6366F1] dark:text-cyan-300"
            animate={{
              textShadow: [
                '0 0 0px rgba(99, 102, 241, 0)',
                '0 0 8px rgba(99, 102, 241, 0.5)',
                '0 0 0px rgba(99, 102, 241, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            AI guidance
          </motion.span>
          , gamified learning, and{' '}
          <motion.span
            className="font-semibold text-[#6366F1] dark:text-cyan-300"
            animate={{
              textShadow: [
                '0 0 0px rgba(99, 102, 241, 0)',
                '0 0 8px rgba(99, 102, 241, 0.5)',
                '0 0 0px rgba(99, 102, 241, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          >
            personalized scheduling
          </motion.span>{' '}
          to help you ace your exams with focus and motivation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Primary Button - Crystal Glass with Opalescent Glow */}
          <motion.button
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl()}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#06B6D4] dark:from-[#EC4899] dark:to-[#06C5D0] hover:from-[#7E22CE] dark:hover:from-[#DB2777] hover:to-[#0891B2] dark:hover:to-[#0891B2] text-white dark:text-foreground font-semibold transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4), 0 0 20px rgba(6, 182, 212, 0.2)',
            }}
          >
            {/* Opalescent Glow Beneath */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(147, 51, 234, 0.3)',
                  '0 0 40px rgba(6, 182, 212, 0.5)',
                  '0 0 20px rgba(147, 51, 234, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="relative z-10">
              Start Learning Today
              <motion.span
                className="inline-block ml-2"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </span>
          </motion.button>

          {/* Secondary Button - Outlined Crystal Panel */}
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/ai-coach')}
            className="px-8 py-4 rounded-lg border-2 border-[#E2E8F0] dark:border-cyan-500/40 bg-white dark:bg-transparent/10 text-[#6366F1] dark:text-cyan-300 hover:text-[#4F46E5] dark:hover:text-cyan-200 font-semibold transition-all duration-300 backdrop-blur-md"
            style={{
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            Try AI Coach
          </motion.button>
        </motion.div>

        {/* Stats with Count-Up Animation */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { label: 'Active Students', value: '50K+' },
            { label: 'Success Rate', value: '95%' },
            { label: 'AI Tutoring', value: '24/7' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1, y: -8 }}
              className="text-center p-4 rounded-lg bg-white/50 dark:bg-transparent dark:border dark:border-cyan-500/20 backdrop-blur-md transition-all duration-300"
              style={{
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Crystal Dimensional Number */}
              <motion.p
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9333EA] to-[#06B6D4] dark:from-[#EC4899] dark:to-[#06C5D0] bg-clip-text text-transparent"
                animate={{
                  textShadow: [
                    '0 0 0px rgba(147, 51, 234, 0)',
                    '0 0 12px rgba(147, 51, 234, 0.4)',
                    '0 0 0px rgba(147, 51, 234, 0)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
