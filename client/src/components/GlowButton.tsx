import { motion } from 'framer-motion';
import React from 'react';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'indigo' | 'cyan' | 'violet';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const glowColors = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/50',
  cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/50',
  violet: 'from-violet-500 to-violet-600 shadow-violet-500/50',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function GlowButton({
  children,
  onClick,
  variant = 'indigo',
  className = '',
  size = 'md',
}: GlowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg font-semibold text-foreground transition-all duration-300 ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${glowColors[variant]}`} />

      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${glowColors[variant]}`}
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      <motion.div
        className="absolute inset-0 rounded-lg border border-white/20"
        initial={{ boxShadow: '0 0 0px rgba(79, 70, 229, 0.3)' }}
        whileHover={{ boxShadow: '0 0 20px rgba(79, 70, 229, 0.6)' }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
