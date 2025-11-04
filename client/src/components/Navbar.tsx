import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GlowButton from './GlowButton';

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
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
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => setLocation('/')}
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
          {[
            { label: 'Features', action: () => setLocation('/') },
            { label: 'Dashboard', action: () => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl() },
            { label: 'Pricing', action: () => setLocation('/') },
            { label: 'About', action: () => setLocation('/') },
          ].map((item) => (
            <motion.button
              key={item.label}
              onClick={item.action}
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ color: '#FFFFFF' }}
            >
              {item.label}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl()}
        >
          <GlowButton variant="indigo" size="md">
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </GlowButton>
        </button>
      </div>
    </motion.nav>
  );
}
