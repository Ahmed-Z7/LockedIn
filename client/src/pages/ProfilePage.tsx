import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Flame, Clock, Zap, Target, 
  Settings, Edit3, Camera, CheckCircle2, 
  ChevronRight, Calendar, Star, Shield, 
  Award, Activity, LogOut, ArrowRight, MessageSquare,
  Bot, Sparkles
} from 'lucide-react';
import React, { useState, useRef, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/_core/hooks/useAuth';
import { useParams, useLocation } from 'wouter';
import Navbar from "@/components/Navbar";
import { AvatarWithFrame, StatusBadge, AVATAR_FRAMES, STATUS_PRESETS } from '@/components/ProfileCustomization';
import { OctopusCelebration } from '@/components/OctopusCelebration';
import { cn } from '@/lib/utils';
import { UserPlus, UserCheck, Heart, Share2, MoreHorizontal, Users } from 'lucide-react';

const BADGE_MAP: Record<string, { icon: any, color: string, desc: string }> = {
  "Study Monk": { icon: Shield, color: "text-blue-400", desc: "Completed 5 focus-locked sessions." },
  "Consistency King": { icon: Award, color: "text-orange-400", desc: "Maintained a 7-day streak." },
  "Deck Master": { icon: Zap, color: "text-purple-400", desc: "Created 10 flashcard decks." },
  "Focus Legend": { icon: Target, color: "text-red-400", desc: "Completed a session with 0 distractions." },
  "AI Collaborator": { icon: Zap, color: "text-indigo-400", desc: "Interacted with AI coach 20 times." },
  "Social Learner": { icon: Award, color: "text-pink-400", desc: "Participated in 5 group study sessions." },
  "Night Owl": { icon: Shield, color: "text-yellow-400", desc: "Studied for 3 hours after midnight." },
  "Neural Link": { icon: Zap, color: "text-green-400", desc: "Reached Level 10." },
};

const getLevelTitle = (level: number): string => {
  if (level >= 20) return "Deep Work Master";
  if (level >= 10) return "Discipline Builder";
  if (level >= 5) return "Focused Beginner";
  return "Fresh Initiate";
};

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const targetUserId = params.id ? Number(params.id) : user?.id;
  const isOwnProfile = !params.id || Number(params.id) === user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showOctopus, setShowOctopus] = useState(false);
  const [activeTab, setActiveTab] = useState('badges');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  // Queries
  const ownProfileQuery = trpc.userAccount.getProfile.useQuery(undefined, { enabled: isOwnProfile });
  const publicProfileQuery = trpc.social.getPublicProfile.useQuery(targetUserId || 0, { enabled: !isOwnProfile && !!targetUserId });
  const progressionQuery = trpc.progression.getProfile.useQuery(undefined, { enabled: isOwnProfile });

  const updateNameMutation = trpc.userAccount.updateName.useMutation();
  const updateBioMutation = trpc.userAccount.updateBio.useMutation();
  const updatePhotoMutation = trpc.userAccount.updateProfilePhoto.useMutation();

  const profile = isOwnProfile ? ownProfileQuery.data : publicProfileQuery.data;
  const progression = isOwnProfile ? progressionQuery.data : { 
    badges: publicProfileQuery.data?.badges, 
    activities: publicProfileQuery.data?.activities 
  };

  const isLoading = isOwnProfile ? ownProfileQuery.isLoading : publicProfileQuery.isLoading;

  // XP Progress Calculation
  const level = profile?.level || 1;
  const currentXP = profile?.xp || 0;
  
  const getXPForLevel = (lv: number) => {
    let total = 0;
    for (let i = 2; i <= lv; i++) total += i * 50;
    return total;
  };

  const xpThisLevel = currentXP - getXPForLevel(level);
  const xpNeededForNext = (level + 1) * 50;
  const progressPercent = Math.min(100, (xpThisLevel / xpNeededForNext) * 100);

  const stats = useMemo(() => [
    { label: 'Longest Streak', value: `${profile?.streak || 0}d`, icon: Flame, color: 'text-orange-400' },
    { label: 'Study Sessions', value: progression?.activities?.filter((a: any) => a?.type === 'xp_gain')?.length || 0, icon: Target, color: 'text-purple-400' },
    { label: 'Total XP', value: (currentXP || 0).toLocaleString(), icon: Zap, color: 'text-yellow-400' },
    { label: 'Badges', value: progression?.badges?.length || 0, icon: Award, color: 'text-blue-400' },
  ], [profile, progression, currentXP]);

  const handleUpdateProfile = async () => {
    try {
      if (tempName) await updateNameMutation.mutateAsync({ name: tempName });
      if (tempBio) await updateBioMutation.mutateAsync({ bio: tempBio });
      setIsEditing(false);
      toast.success("Neural profile synchronized!");
      utils.userAccount.getProfile.invalidate();
    } catch (err) {
      toast.error("Failed to synchronize profile.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await updatePhotoMutation.mutateAsync({ photo: base64 });
        toast.success("Neural avatar updated!");
        utils.userAccount.getProfile.invalidate();
      } catch (err) {
        toast.error("Failed to update avatar.");
      }
    };
    reader.readAsDataURL(file);
  };

  const updateProfileMutation = trpc.profileData.update.useMutation();
  const updateStatusMutation = trpc.profileData.updateStatus.useMutation();
  const updateFrameMutation = trpc.profileData.updateAvatarFrame.useMutation();
  const socialMutation = trpc.social.requestFriend.useMutation();
  const favoriteMutation = trpc.social.toggleFavorite.useMutation();

  const handleUpdateStatus = async (status: string) => {
    await updateStatusMutation.mutateAsync({ status });
    toast.success("Status updated!");
    utils.userAccount.getProfile.invalidate();
    utils.social.getPublicProfile.invalidate(targetUserId);
  };

  const handleUpdateFrame = async (frameId: string) => {
    await updateFrameMutation.mutateAsync({ avatarFrame: frameId });
    toast.success("Frame synchronized!");
    utils.userAccount.getProfile.invalidate();
    utils.social.getPublicProfile.invalidate(targetUserId);
  };

  const handleManualLevelUp = () => {
    setShowOctopus(true);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background text-white pt-24 pb-20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 pt-20">
         <div className="h-64 w-full bg-white/5 animate-pulse rounded-[3rem]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-20 relative overflow-hidden selection:bg-purple-500/30">
        <Navbar />
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
                    animate={{
                        y: [-100, 1000],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        delay: Math.random() * 20
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10%`
                    }}
                />
            ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
                <div className="space-y-12">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group p-10 rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                      <div className="relative">
                        <AvatarWithFrame 
                          src={profile?.profilePhoto} 
                          username={profile?.username || ''} 
                          frameId={(profile as any)?.avatarFrame || 'none'} 
                          size="xl" 
                        />
                        {isOwnProfile && (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-2 p-3 bg-purple-600 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-background"
                          >
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                      </div>

                      <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col items-center md:items-start gap-3 mb-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                                    {profile?.name}
                                </h1>
                                {!isOwnProfile && (
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            className={cn(
                                                "rounded-full bg-purple-600 hover:bg-purple-700 h-9 px-4 transition-all",
                                                socialMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                                            )}
                                            disabled={socialMutation.isPending}
                                            onClick={async () => {
                                                await socialMutation.mutateAsync(targetUserId!);
                                                toast.success("Connection request broadcasted!");
                                                utils.social.getFriendRequests.invalidate();
                                            }}
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" /> {socialMutation.isPending ? "Syncing..." : "Add Friend"}
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="rounded-full border-white/10 bg-white/5 h-9 px-4 transition-all"
                                            onClick={() => setLocation(`/messages?user=${targetUserId}`)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" /> Message
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="text-white/40 font-bold tracking-tight">@{profile?.username}</span>
                                <StatusBadge status={(profile as any)?.status || 'Ana LOCKEDIN'} />
                                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-black tracking-widest">
                                    {getLevelTitle(profile?.level || 1)}
                                </span>
                            </div>
                        </div>

                        {isOwnProfile ? (
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl border-white/5 bg-white/5 text-xs font-bold h-9"
                                        onClick={() => setIsCustomizing(true)}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Customize
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl border-white/5 bg-white/5 text-xs font-bold h-10 px-5"
                                        onClick={() => { setTempName(profile?.name || ''); setTempBio(profile?.bio || ''); setIsEditing(true); }}
                                    >
                                        <Edit3 className="w-3.5 h-3.5 mr-2 text-purple-400" /> Edit Profile
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest h-10 px-5 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                        onClick={() => setActiveTab('friends')}
                                    >
                                        <Users className="w-3.5 h-3.5 mr-2" /> Friend List
                                    </Button>
                                </div>
                                {level > 5 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-[10px] text-cyan-400/20 hover:text-cyan-400 font-black uppercase tracking-widest p-0 h-auto"
                                        onClick={handleManualLevelUp}
                                    >
                                        Evolution
                                    </Button>
                                )}
                            </div>
                        ) : null}
                        
                        {isEditing ? (
                            <div className="flex flex-col gap-4 max-w-md">
                                <input 
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    placeholder="Neural Designation (Nickname)"
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white"
                                />
                                <textarea 
                                    value={tempBio}
                                    onChange={(e) => setTempBio(e.target.value)}
                                    placeholder="Input neural bio description..."
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none h-20 text-white"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdateProfile} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6 font-bold h-9 text-xs">Save Update</Button>
                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-6 text-white/40 h-9 text-xs">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/60 leading-relaxed max-w-xl text-sm italic">
                                "{profile?.bio || "No biometric summary detected."}"
                            </p>
                        )}
                      </div>

                      <div className="hidden lg:block w-px h-32 bg-white/5" />

                      <div className="flex flex-col items-center md:items-start gap-6 px-8">
                        <div className="text-center md:text-left">
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2">Neural Tier</p>
                          <p className="text-5xl font-black text-white leading-none bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">LV.{level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full mt-10 p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                          <span className="text-xs font-black uppercase tracking-widest text-white/60">Neural XP Status</span>
                          </div>
                          <span className="text-xs font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">Mastery: {progressPercent.toFixed(0)}%</span>
                      </div>
                      
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10 shadow-inner relative">
                          <motion.div 
                              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-500 relative overflow-hidden"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 2, ease: "circOut" }}
                          >
                              <motion.div 
                                  className="absolute inset-0 bg-white/20"
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                          </motion.div>
                      </div>
                      
                      <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                          <span>Level {level}</span>
                          <span className="text-white/40">{xpNeededForNext - xpThisLevel} XP TO ASCEND</span>
                          <span>Level {level + 1}</span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {stats.map((stat, i) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                          className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center group hover:bg-white/[0.05] transition-all hover:scale-105 shadow-xl shadow-purple-500/5">
                          <div className={cn("p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform", stat.color)}>
                              <stat.icon className="w-8 h-8" />
                          </div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                          <p className="text-3xl font-black tracking-tighter text-white">{stat.value}</p>
                      </motion.div>
                      ))}
                  </div>

                  <div className="w-full">
                      <TabsList className="bg-card/20 backdrop-blur-xl border border-white/5 p-1 rounded-2xl mb-8">
                      <TabsTrigger value="badges" className="rounded-xl px-10 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all">
                          Neural Awards
                      </TabsTrigger>
                      <TabsTrigger value="activity" className="rounded-xl px-10 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all">
                          Activity Log
                      </TabsTrigger>
                      <TabsTrigger value="friends" className="rounded-xl px-10 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all">
                          Neural Network
                      </TabsTrigger>
                      </TabsList>

                      <TabsContent value="badges" className="outline-none">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                              {Object.entries(BADGE_MAP).map(([name, meta], idx) => {
                              const isEarned = progression?.badges?.some(b => b.badgeName === name);
                              const Icon = meta.icon;
                              return (
                                  <motion.div key={name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                      className={cn("relative p-6 rounded-[2rem] border flex flex-col items-center text-center transition-all group backdrop-blur-xl", isEarned ? "bg-purple-900/10 border-purple-500/20 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10" : "bg-white/[0.01] border-white/5 grayscale opacity-30")}>
                                      <div className={cn("p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform", isEarned ? meta.color + " bg-white/5 shadow-inner" : "text-white/20")}>
                                          <Icon className="w-8 h-8" />
                                      </div>
                                      <h4 className="text-sm font-bold mb-1 tracking-tight text-white">{name}</h4>
                                      <p className="text-[9px] text-white/30 leading-tight uppercase font-black">{isEarned ? "Validated" : "Access Locked"}</p>
                                  </motion.div>
                              );
                              })}
                          </div>
                      </TabsContent>

                      <TabsContent value="activity">
                          <div className="space-y-4">
                              {progression?.activities?.length === 0 ? (
                                  <div className="py-20 text-center text-white/20 font-bold uppercase tracking-widest bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                      No neural activity detected in current cycle.
                                  </div>
                              ) : (
                                  progression?.activities?.map((activity, i) => (
                                      <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                          className="p-6 rounded-2xl bg-card/10 backdrop-blur-xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all shadow-lg">
                                          <div className="flex items-center gap-5">
                                              <div className={`p-3 rounded-xl shadow-inner ${activity.type === 'level_up' ? 'bg-amber-500/10 text-amber-400' : activity.type === 'badge_earned' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                  {activity.type === 'level_up' ? <Trophy className="w-5 h-5" /> : activity.type === 'badge_earned' ? <Award className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-sm tracking-tight text-white/80 group-hover:text-white transition-colors">{activity.description}</p>
                                                  <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-1">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                              </div>
                                          </div>
                                          <div className="flex flex-col items-end">
                                              <p className={`font-black tracking-tighter shadow-sm ${(activity.xpGain ?? 0) > 0 ? 'text-emerald-400' : 'text-white/10'}`}>
                                                  {(activity.xpGain ?? 0) > 0 ? `+${activity.xpGain} XP` : '--'}
                                              </p>
                                          </div>
                                      </motion.div>
                                  ))
                              )}
                          </div>
                      </TabsContent>

                      <TabsContent value="friends">
                          <AnimatePresence mode="wait">
                              <motion.div
                                  key="friends-tab"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                              >
                                  <FriendsList isOwnProfile={isOwnProfile} targetUserId={targetUserId} />
                              </motion.div>
                          </AnimatePresence>
                      </TabsContent>
                  </div>
                </div>

                <div className="space-y-8">
                    <StreakCalendar profile={profile} />
                    <ZedCorePreview setLocation={setLocation} />
                </div>
            </div>
        </Tabs>
      </div>


      <AnimatePresence>
        {isCustomizing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCustomizing(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-card/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-10">
              
              <h2 className="text-3xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Neural Customization</h2>
              
              <div className="space-y-10">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Avatar Frames
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {AVATAR_FRAMES.map((f) => (
                      <button key={f.id} onClick={() => handleUpdateFrame(f.id)}
                        className={cn("flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-105", 
                        (profile as any)?.avatarFrame === f.id ? "bg-purple-500/10 border-purple-500" : "bg-white/5 border-white/5 hover:border-white/20")}>
                        <div className={cn("w-12 h-12 rounded-full border-2", f.color, f.glow)} />
                        <span className="text-[10px] font-bold text-white/60">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" /> Presets & Humorous Status
                  </h3>
                  <div className="space-y-3">
                    {STATUS_PRESETS.map((s) => (
                      <button key={s.id} onClick={() => handleUpdateStatus(s.text)}
                        className={cn("w-full text-left p-4 rounded-2xl border transition-all hover:translate-x-2 flex items-center justify-between group",
                        (profile as any)?.status === s.text ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]" : "bg-white/5 border-white/5 hover:border-purple-500/30")}>
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", (profile as any)?.status === s.text ? "bg-cyan-400 animate-pulse" : "bg-white/10")} />
                            <span className="text-sm font-medium text-white/80 group-hover:text-white">{s.text}</span>
                        </div>
                        {(profile as any)?.status === s.text && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsCustomizing(false)} className="w-full mt-10 bg-gradient-to-r from-purple-600 to-indigo-600 py-6 rounded-2xl font-black text-xs uppercase tracking-widest">
                SYNC NEURAL SIGNATURE
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OctopusCelebration 
        show={showOctopus} 
        onClose={() => setShowOctopus(false)} 
        title={`NEURAL TIER ${level} REACHED!`}
        subtitle="Your focus frequency has stabilized. The Deep Work Council acknowledges your discipline."
      />
      
      {/* Activity Monitor for Auto-Celebration */}
      <ActivityMonitor level={level} activities={progression?.activities as any[]} onLevelUp={handleManualLevelUp} />
    </div>
  );
}

const ActivityMonitor = ({ level, activities, onLevelUp }: { level: number, activities?: any[], onLevelUp: () => void }) => {
    const lastLevelRef = React.useRef(level);
    
    React.useEffect(() => {
        if (level > lastLevelRef.current) {
            onLevelUp();
            lastLevelRef.current = level;
        }
    }, [level, onLevelUp]);

    return null;
};

const FriendsList = ({ isOwnProfile, targetUserId }: { isOwnProfile: boolean, targetUserId?: number }) => {
    const friendsQuery = trpc.social.getFriends.useQuery(undefined, { enabled: isOwnProfile });
    const requestsQuery = trpc.social.getFriendRequests.useQuery(undefined, { enabled: isOwnProfile });
    const acceptMutation = trpc.social.acceptFriend.useMutation();
    const favoriteMutation = trpc.social.toggleFavorite.useMutation();
    const removeMutation = trpc.social.removeFriend.useMutation();
    const utils = trpc.useUtils();
    const [, setLocation] = useLocation();

    if (!isOwnProfile) {
        return (
            <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                 <Shield className="w-8 h-8 text-white/10" />
                 <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Neural Network data is private.</p>
            </div>
        );
    }

    if (friendsQuery.isLoading) return (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <div className="font-black text-white/20 uppercase tracking-[0.3em] text-xs">Scanning Neural Network...</div>
        </div>
    );

    const friends = useMemo(() => {
        if (!friendsQuery.data) return [];
        return [...friendsQuery.data].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [friendsQuery.data]);

    const requests = requestsQuery.data || [];
    const favorites = friends.filter(f => f.isFavorite);
    const regularFriends = friends.filter(f => !f.isFavorite);

    const handleAction = async (friendId: number, action: 'view' | 'dm' | 'fav' | 'unfav' | 'delete') => {
        try {
            switch (action) {
                case 'view': setLocation(`/profile/${friendId}`); break;
                case 'dm': setLocation(`/messages?user=${friendId}`); break;
                case 'fav':
                    await favoriteMutation.mutateAsync({ friendId, favorite: true });
                    toast.success("Added to favorites");
                    break;
                case 'unfav':
                    await favoriteMutation.mutateAsync({ friendId, favorite: false });
                    toast.success("Removed from favorites");
                    break;
                case 'delete':
                    if (confirm("Disconnect this neural link?")) {
                        await removeMutation.mutateAsync(friendId);
                        toast.success("Link terminated.");
                    }
                    break;
            }
            utils.social.getFriends.invalidate();
        } catch (err) {
            toast.error("Process interrupted.");
        }
    };

    return (
        <div className="space-y-12">
            {requests.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Inbound Links ({requests.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map(req => (
                            <motion.div layout key={req.id} className="p-5 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <AvatarWithFrame src={req.avatar} username={req.username || ''} size="sm" />
                                    <div>
                                        <p className="font-bold text-sm tracking-tight text-white">{req.name}</p>
                                        <p className="text-[10px] text-white/40 font-mono">@{req.username}</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => { acceptMutation.mutate(req.id); utils.social.getFriends.invalidate(); utils.social.getFriendRequests.invalidate(); toast.success("Neural link established!"); }} 
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white h-9 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20">Accept</Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {favorites.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
                        <Heart className="w-4 h-4 fill-pink-400" /> Favorite Nodes ({favorites.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map(friend => (
                            <FriendCard key={friend.id} friend={friend} isFavorite onAction={handleAction} />
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> All Connections ({regularFriends.length})
                </h3>
                {friends.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                         <div className="p-4 bg-white/5 rounded-full"><UserPlus className="w-8 h-8 text-white/10" /></div>
                         <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">No neural connections detected.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularFriends.map(friend => (
                            <FriendCard key={friend.id} friend={friend} onAction={handleAction} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FriendCard = ({ friend, isFavorite = false, onAction }: { friend: any, isFavorite?: boolean, onAction: any }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-[2.5rem] bg-card/20 border border-white/5 backdrop-blur-xl group hover:border-purple-500/30 transition-all shadow-xl hover:shadow-purple-500/5">
        <div className="flex items-center gap-4 mb-6">
            <AvatarWithFrame src={friend.avatar} username={friend.username || ''} size="md" />
            <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm truncate text-white">{friend.name}</p>
                <p className="text-[10px] text-white/40 truncate font-mono">@{friend.username}</p>
            </div>
            <div className="flex flex-col gap-1">
                {isFavorite && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Heart className="w-4 h-4 text-pink-500 fill-pink-500" /></motion.div>}
            </div>
        </div>
        
        <div className="mb-6">
            <StatusBadge status={friend.status || 'Ana LOCKEDIN'} />
        </div>

        <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => onAction(friend.id, 'view')} className="bg-white/5 border-none hover:bg-purple-500/30 h-10 w-full p-0 rounded-xl transition-all hover:scale-105 active:scale-95" title="View Profile">
                <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction(friend.id, 'dm')} className="bg-white/5 border-none hover:bg-cyan-500/30 h-10 w-full p-0 rounded-xl transition-all hover:scale-105 active:scale-95" title="Send DM">
                <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction(friend.id, isFavorite ? 'unfav' : 'fav')} className="bg-white/5 border-none hover:bg-pink-500/30 h-10 w-full p-0 rounded-xl transition-all hover:scale-105 active:scale-95 text-pink-400" title={isFavorite ? 'Unfavorite' : 'Favorite'}>
                {isFavorite ? <Heart className="w-4 h-4 fill-pink-400" /> : <Heart className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction(friend.id, 'delete')} className="bg-white/5 border-none hover:bg-red-500/30 h-10 w-full p-0 rounded-xl transition-all hover:scale-105 active:scale-95 text-red-500/60 hover:text-red-500" title="Remove Friend">
                <LogOut className="w-4 h-4" />
            </Button>
        </div>
    </motion.div>
);

const StreakCalendar = ({ profile }: { profile: any }) => (
    <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 relative overflow-hidden shadow-2xl shadow-cyan-500/5 group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" /> Neural Streak
            </h3>
            <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{profile?.streak || 0}d</div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-8 relative z-10">
            {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[8px] font-black text-white/20 tracking-tighter">{d}</span>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", i < (profile?.streak || 0) ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-110" : "bg-white/5 text-white/10")}>
                        {i < (profile?.streak || 0) && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                </div>
            ))}
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed font-bold relative z-10">SYSTEM ACCURACY: OPTIMAL. FLOW SYNC DETECTED.</p>
    </div>
);

const ZedCorePreview = ({ setLocation }: { setLocation: any }) => (
    <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 relative overflow-hidden shadow-2xl shadow-purple-500/5">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
           <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl"><Bot className="w-5 h-5 text-white" /></div>
           ZED CORE
        </h3>
        <p className="text-xs text-white/40 mb-6 font-medium leading-relaxed">ZED is optimizing focus cycles based on your biometrics.</p>
        <Button onClick={() => setLocation('/ai-coach')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 text-white">
            <Settings className="w-4 h-4" /> Neural Training Center
        </Button>
    </div>
);
