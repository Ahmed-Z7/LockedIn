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
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-500/20"
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
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg p-2">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
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
              className="text-gray-300 hover:text-foreground transition-colors relative group"
              whileHover={{ color: '#FFFFFF' }}
            >
              {item.label}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
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
                className="p-2 hover:bg-card rounded-lg transition-colors text-gray-400 hover:text-purple-400"
                title="Create Post"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/notifications')}
                className="p-2 hover:bg-card rounded-lg transition-colors text-gray-400 hover:text-purple-400 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/profile')}
                className="p-2 hover:bg-card rounded-lg transition-colors text-gray-400 hover:text-purple-400"
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
