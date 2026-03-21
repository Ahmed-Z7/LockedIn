import { motion } from 'framer-motion';
import { Edit2, Star, Crown, Settings, Save, X, Zap, Award, Upload } from 'lucide-react';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateNameMutation = trpc.user.updateName.useMutation();
  const updateProfileMutation = trpc.profile.update.useMutation();
  const updatePhotoMutation = trpc.user.updateProfilePhoto.useMutation();
  const getProfileQuery = trpc.user.getProfile.useQuery();

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
      setTempName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    if (getProfileQuery.data) {
      setUserProfile(getProfileQuery.data);
      if (getProfileQuery.data.profilePhoto) {
        setProfilePhoto(getProfileQuery.data.profilePhoto);
      }
      if (getProfileQuery.data.bio !== undefined && getProfileQuery.data.bio !== null) {
        setTempBio(getProfileQuery.data.bio);
      }
    }
  }, [getProfileQuery.data]);

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

  const handleCancelName = () => {
    setTempName(displayName);
    setIsEditingName(false);
  };
  
  const handleSaveBio = async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        bio: tempBio.trim() || undefined,
      });
      setUserProfile((prev: any) => ({ ...prev, bio: tempBio.trim() }));
      setIsEditingBio(false);
      toast.success('Bio updated successfully!');
    } catch (error) {
      toast.error('Failed to update bio');
      console.error(error);
      setTempBio(userProfile?.bio || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelBio = () => {
    setTempBio(userProfile?.bio || '');
    setIsEditingBio(false);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await updatePhotoMutation.mutateAsync({
          photoBase64: base64,
        });
        setProfilePhoto(base64);
        toast.success('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error(error);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
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
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-1">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-6xl overflow-hidden shadow-inner">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 p-3 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
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
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleCancelName}
                    className="p-2 bg-muted rounded-lg text-muted-foreground hover:bg-muted/80 transition-colors"
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
                    <p className="text-muted-foreground">@{userProfile?.username || user?.email?.split('@')[0] || 'user'}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsEditingName(true)}
                    className="p-2 bg-purple-600/10 text-purple-600 rounded-lg hover:bg-purple-600/20 transition-colors"
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
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white text-sm font-semibold flex items-center gap-2 shadow-md"
              >
                <Crown className="w-4 h-4" />
                NITRO Active
              </motion.div>
            </div>

            {/* Bio */}
            {isEditingBio ? (
              <div className="mb-6 space-y-2">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  maxLength={160}
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Focused learner | LOCKEDIN mode activated 🔒"
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSaveBio}
                    disabled={isSaving}
                    className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Save Bio
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleCancelBio}
                    className="px-4 py-2 bg-muted rounded-lg text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-6 group cursor-pointer" onClick={() => setIsEditingBio(true)}>
                <p className="text-muted-foreground">
                  {userProfile?.bio || "Focused learner | LOCKEDIN mode activated 🔒"}
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userProfile?.level || 0}</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">Level</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center group hover:border-purple-500 transition-all">
                <div className="text-2xl font-bold text-[#6e68dd] dark:text-[#6e68dd]">{userProfile?.xp || 0}</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">XP</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center group hover:border-purple-500 transition-all">
                <div className="text-2xl font-bold text-[#7a5fd4] dark:text-[#7a5fd4]">{userProfile?.streak || 0}</div>
                <div className="text-xs text-gray-400 dark:text-muted-foreground">Streak</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center group hover:border-purple-500 transition-all">
                <div className="text-2xl font-bold text-[#7566dc] dark:text-[#7566dc]">{userProfile?.badgesCount || 0}</div>
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
              <p className="text-sm text-muted-foreground">{badge.label}</p>
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
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#5053bf] dark:border-border">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-semibold text-foreground dark:text-foreground">Notifications</p>
                  <p className="text-xs text-gray-400 dark:text-muted-foreground">Manage notification preferences</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-[#5053bf] dark:border-border">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-semibold text-foreground dark:text-foreground">Privacy</p>
                  <p className="text-xs text-gray-400 dark:text-muted-foreground">Control who can see your profile</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Configure
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
