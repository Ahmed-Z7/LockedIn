import { motion } from 'framer-motion';
import { Edit2, Star, Crown, Settings, Save, X, Zap, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [tempName, setTempName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const updateNameMutation = trpc.user.updateName.useMutation();

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
      setTempName(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateNameMutation.mutateAsync({
        name: tempName.trim(),
      });
      setDisplayName(tempName);
      setIsEditingName(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
      setTempName(displayName);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempName(displayName);
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F7FF] via-[#EEF2FF] to-[#F6F7FF] text-foreground dark:from-[#F6F7FF] dark:via-[#EEF2FF] dark:to-[#F6F7FF] dark:text-foreground pt-24">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 mb-12"
      >
        {/* Background Banner */}
        <div className="relative h-48 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#5053bf] via-[#9945ce] to-[#6e68dd] dark:from-[#6e68dd] dark:via-[#9945ce] dark:to-[#5053bf]">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-[#9945ce]/20 to-[#5053bf]/20"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="absolute top-4 right-4 px-4 py-2 bg-background/50 dark:bg-background/50 hover:bg-background/70 dark:hover:bg-background/70 rounded-lg text-foreground dark:text-foreground text-sm font-semibold transition-all"
          >
            <Edit2 className="w-4 h-4 inline mr-2" />
            Edit Banner
          </motion.button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative -mt-24"
          >
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#9945ce] to-[#5053bf] dark:from-[#5053bf] dark:to-[#9945ce] p-1">
              <div className="w-full h-full rounded-2xl bg-[#FFFFFF] dark:bg-background flex items-center justify-center text-6xl">
                👤
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="absolute bottom-0 right-0 p-3 bg-[#9945ce] dark:bg-[#5053bf] rounded-full text-foreground hover:bg-[#7a5fd4] dark:hover:bg-[#6059d2] transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Profile Details */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={50}
                    className="bg-[#1d2952] dark:bg-background border border-[#5053bf] dark:border-border rounded-lg px-4 py-2 text-foreground dark:text-foreground focus:outline-none focus:border-[#9945ce] dark:focus:border-[#9945ce]"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="p-2 bg-[#9945ce] dark:bg-[#5053bf] rounded-lg text-foreground hover:bg-[#7a5fd4] dark:hover:bg-[#6059d2] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleCancel}
                    className="p-2 bg-gray-600 dark:bg-gray-400 rounded-lg text-foreground hover:bg-card dark:hover:bg-[#EEF2FF]0 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground dark:text-foreground mb-1">
                      {displayName || user?.email || 'User'}
                    </h1>
                    <p className="text-gray-400 dark:text-muted-foreground">@{displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsEditingName(true)}
                    className="p-2 bg-[#5053bf] dark:bg-[#9945ce] rounded-lg text-foreground hover:bg-[#6059d2] dark:hover:bg-[#7a5fd4] transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Nitro Badge */}
            <div className="flex items-center gap-2 mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-4 py-2 bg-gradient-to-r from-[#9945ce] to-[#6e68dd] dark:from-[#5053bf] dark:to-[#6e68dd] rounded-full text-foreground text-sm font-semibold flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                NITRO Active
              </motion.div>
            </div>

            {/* Bio */}
            <p className="text-gray-300 dark:text-muted-foreground mb-6">
              Focused learner | LOCKEDIN mode activated 🔒
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#FFFFFF] dark:bg-card border border-[#5053bf] dark:border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#9945ce] dark:text-[#5053bf]">42</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">Level</div>
              </div>
              <div className="bg-[#FFFFFF] dark:bg-card border border-[#5053bf] dark:border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#6e68dd] dark:text-[#6e68dd]">8.7K</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">XP</div>
              </div>
              <div className="bg-[#FFFFFF] dark:bg-card border border-[#5053bf] dark:border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#7a5fd4] dark:text-[#7a5fd4]">28</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">Streak</div>
              </div>
              <div className="bg-[#FFFFFF] dark:bg-card border border-[#5053bf] dark:border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#7566dc] dark:text-[#7566dc]">12</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">Badges</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Section */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground dark:text-foreground">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏆', label: 'First Post' },
            { icon: '⭐', label: 'Rising Star' },
            { icon: '🔥', label: '7-Day Streak' },
            { icon: '👑', label: 'Community Leader' },
            { icon: '🎓', label: 'Knowledge Seeker' },
            { icon: '💪', label: 'Consistency King' },
            { icon: '🚀', label: 'Fast Learner' },
            { icon: '🎯', label: 'Goal Crusher' },
          ].map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#FFFFFF] dark:bg-card border border-[#5053bf] dark:border-border rounded-lg p-4 text-center hover:border-[#9945ce] dark:hover:border-[#9945ce] transition-colors"
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <p className="text-sm text-gray-300 dark:text-muted-foreground">{badge.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6 text-foreground dark:text-foreground">Settings</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] dark:bg-background border border-[#5053bf] dark:border-border rounded-lg p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#5053bf] dark:border-border">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-[#9945ce] dark:text-[#5053bf]" />
                <div>
                  <p className="font-semibold text-foreground dark:text-foreground">Notifications</p>
                  <p className="text-xs text-gray-400 dark:text-muted-foreground">Manage notification preferences</p>
                </div>
              </div>
              <Button className="bg-[#5053bf] dark:bg-[#9945ce] hover:bg-[#6059d2] dark:hover:bg-[#7a5fd4] text-foreground">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-[#5053bf] dark:border-border">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#6e68dd] dark:text-[#6e68dd]" />
                <div>
                  <p className="font-semibold text-foreground dark:text-foreground">Privacy</p>
                  <p className="text-xs text-gray-400 dark:text-muted-foreground">Control who can see your profile</p>
                </div>
              </div>
              <Button className="bg-[#5053bf] dark:bg-[#9945ce] hover:bg-[#6059d2] dark:hover:bg-[#7a5fd4] text-foreground">
                Configure
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
