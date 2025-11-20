import { motion } from 'framer-motion';
import { Edit2, Star, Crown, Settings, Upload, Zap, Award, Target } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [profile] = useState({
    name: 'Ahmed Hassan',
    username: '@ahmedhassan',
    avatar: '👨‍💼',
    bio: 'Focused learner | LOCKEDIN mode activated 🔒',
    level: 42,
    xp: 8750,
    streakDays: 28,
    badges: 12,
    nitroActive: true,
    joinDate: 'Jan 15, 2024',
  });

  const [customization] = useState({
    theme: 'dark',
    accentColor: '#9945ce',
    profileBg: 'gradient',
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mb-12"
      >
        {/* Background Banner */}
        <div className="relative h-48 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 rounded-lg text-white text-sm font-semibold transition-all"
          >
            <Edit2 className="w-4 h-4 inline mr-2" />
            Edit Banner
          </motion.button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-6xl border-4 border-purple-500/50 -mt-16">
                {profile.avatar}
              </div>
              {profile.nitroActive && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <Crown className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-purple-400 mb-3">{profile.username}</p>
              <p className="text-gray-400 text-sm max-w-sm">{profile.bio}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Level', value: profile.level, icon: Target, color: 'from-blue-600 to-purple-600' },
              { label: 'XP', value: `${profile.xp.toLocaleString()}`, icon: Zap, color: 'from-purple-600 to-pink-600' },
              { label: 'Streak', value: `${profile.streakDays}d`, icon: Award, color: 'from-orange-500 to-red-600' },
              { label: 'Badges', value: profile.badges, icon: Star, color: 'from-yellow-400 to-orange-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl text-white`}
              >
                <stat.icon className="w-5 h-5 mb-2" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Nitro Section */}
      {profile.nitroActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="container mb-12"
        >
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">LOCKEDIN Nitro</h2>
                <p className="text-gray-400">Premium features unlocked</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { title: 'Priority Support', desc: '24/7 AI assistance' },
                { title: 'Custom Themes', desc: 'Unlimited customization' },
                { title: 'Advanced Analytics', desc: 'Detailed progress tracking' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-1">{feature.title}</p>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
            >
              Manage Subscription
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Customization Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
          <Settings className="w-8 h-8 text-purple-400" />
          Customize Your Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Theme Customization */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-card border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Theme</h3>
            <div className="space-y-3">
              {['Dark', 'Light', 'Auto'].map((theme) => (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                    customization.theme === theme.toLowerCase()
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {theme}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Accent Color */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-card border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Accent Color</h3>
            <div className="grid grid-cols-3 gap-3">
              {['#9945ce', '#5053bf', '#6059d2', '#6e68dd', '#7a5fd4', '#7566dc'].map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    customization.accentColor === color
                      ? 'border-white'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>

          {/* Profile Background */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-card border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Background</h3>
            <div className="space-y-3">
              {['Gradient', 'Solid', 'Pattern'].map((bg) => (
                <motion.button
                  key={bg}
                  whileHover={{ scale: 1.05 }}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    customization.profileBg === bg.toLowerCase()
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {bg}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container mb-20"
      >
        <h2 className="text-3xl font-bold text-white mb-8">Account Settings</h2>

        <div className="space-y-4">
          {[
            { label: 'Email Address', value: 'ahmed@example.com', editable: true },
            { label: 'Username', value: '@ahmedhassan', editable: true },
            { label: 'Password', value: '••••••••', editable: true },
            { label: 'Member Since', value: profile.joinDate, editable: false },
          ].map((setting, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-purple-500/30 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-gray-400 text-sm">{setting.label}</p>
                <p className="text-white font-semibold">{setting.value}</p>
              </div>
              {setting.editable && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-purple-400" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
