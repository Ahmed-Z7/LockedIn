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
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-[#E5E7EB]"
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
              className="absolute inset-0 bg-gradient-to-r from-[#9333EA] to-[#6366F1] rounded-lg blur"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-r from-[#9333EA] to-[#6366F1] rounded-lg p-2">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#334155]">
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
              className="text-[#64748B] hover:text-[#1E293B] transition-colors relative group font-medium"
              whileHover={{ color: '#0F172A' }}
            >
              {item.label}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#9333EA] to-[#06B6D4]"
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
                className="p-2 hover:bg-[#F1F3FF] rounded-lg transition-colors text-[#64748B] hover:text-[#6366F1]"
                title="Create Post"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/notifications')}
                className="p-2 hover:bg-[#F1F3FF] rounded-lg transition-colors text-[#64748B] hover:text-[#6366F1] relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setLocation('/profile')}
                className="p-2 hover:bg-[#F1F3FF] rounded-lg transition-colors text-[#64748B] hover:text-[#6366F1]"
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
