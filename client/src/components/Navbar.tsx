import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GlowButton from './GlowButton';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-indigo-500/20"
    >
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg p-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            AuraLearn
          </span>
        </motion.div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Dashboard', 'Pricing', 'About'].map((item) => (
            <motion.a
              key={item}
              href="#"
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ color: '#FFFFFF' }}
            >
              {item}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          ))}
        </div>

        {/* CTA Button */}
        <GlowButton variant="indigo" size="md">
          Get Started
        </GlowButton>
      </div>
    </motion.nav>
  );
}
