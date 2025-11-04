import { motion } from 'framer-motion';
import React from 'react';

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'indigo' | 'cyan' | 'violet';
  delay?: number;
}

const glowColorMap = {
  indigo: 'shadow-indigo-500/30',
  cyan: 'shadow-cyan-500/30',
  violet: 'shadow-violet-500/30',
};

const borderColorMap = {
  indigo: 'border-indigo-500/50',
  cyan: 'border-cyan-500/50',
  violet: 'border-violet-500/50',
};

export default function NeonCard({
  children,
  className = '',
  glowColor = 'indigo',
  delay = 0,
}: NeonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-xl border ${borderColorMap[glowColor]} bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl p-6 shadow-lg ${glowColorMap[glowColor]} transition-all duration-300 hover:shadow-xl ${className}`}
    >
      {/* Animated gradient border glow */}
      <motion.div
        className={`absolute inset-0 rounded-xl border ${borderColorMap[glowColor]} opacity-0`}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
