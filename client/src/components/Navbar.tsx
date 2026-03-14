import { motion } from 'framer-motion';
import { Lock, Bell, User, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GlowButton from './GlowButton';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/25 backdrop-blur-md dark:backdrop-blur-md border-b border-[#E5E7EB] dark:border-purple-500/20"
      style={{
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
      }}
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
              className="absolute inset-0 bg-gradient-to-r from-[#9333EA] to-[#6366F1] dark:from-purple-600 dark:to-blue-600 rounded-lg blur"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-r from-[#9333EA] to-[#6366F1] dark:from-purple-700 dark:to-blue-700 rounded-lg p-2">
              <Lock className="w-6 h-6 text-white dark:text-foreground" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#334155] dark:bg-gradient-to-r dark:from-purple-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
            LOCKEDIN
          </span>
        </motion.div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', action: () => setLocation('/core-benefits') },
            { label: 'Community', action: () => setLocation('/community') },
            { label: 'Challenges', action: () => setLocation('/challenges') },
            { label: 'Dashboard', action: () => setLocation('/dashboard') },
          ].map((item) => (
            <motion.button
              key={item.label}
              onClick={item.action}
              className="text-[#64748B] dark:text-gray-300 hover:text-[#1E293B] dark:hover:text-foreground transition-colors relative group font-medium"
              whileHover={{ color: '#0F172A' }}
            >
              {item.label}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#9333EA] to-[#06B6D4] dark:from-purple-500 dark:to-blue-500"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          ))}
        </div>

        {/* Right Side Icons & CTA */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {isAuthenticated && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/add-post')}
                className="p-2 hover:bg-[#F1F3FF] dark:hover:bg-card rounded-lg transition-colors text-[#64748B] dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-purple-400"
                title="Create Post"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/notifications')}
                className="p-2 hover:bg-[#F1F3FF] dark:hover:bg-card rounded-lg transition-colors text-[#64748B] dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-purple-400 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/profile')}
                className="p-2 hover:bg-[#F1F3FF] dark:hover:bg-card rounded-lg transition-colors text-[#64748B] dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-purple-400"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </>
          )}
          <GlowButton
            variant="indigo"
            size="md"
            onClick={() => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl()}
          >
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </GlowButton>
        </div>
      </div>
    </motion.nav>
  );
}
