import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Flame, Clock, Zap, Target, 
  Settings, Edit3, Camera, CheckCircle2, 
  ChevronRight, Calendar, Star, Shield, 
  Award, Activity, LogOut, ArrowRight, MessageSquare
} from 'lucide-react';
import React, { useState, useRef, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/_core/hooks/useAuth';
import { useParams, useLocation } from 'wouter';

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

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const targetUserId = params.id ? Number(params.id) : user?.id;
  const isOwnProfile = !params.id || Number(params.id) === user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { label: 'Study Sessions', value: progression?.activities?.filter((a: any) => a.type === 'xp_gain').length || 0, icon: Target, color: 'text-purple-400' },
    { label: 'Total XP', value: currentXP.toLocaleString(), icon: Zap, color: 'text-yellow-400' },
    { label: 'Badges', value: progression?.badges?.length || 0, icon: Award, color: 'text-blue-400' },
  ], [profile, progression]);

  const handleUpdateProfile = async () => {
    try {
      if (tempName) await updateNameMutation.mutateAsync({ name: tempName });
      if (tempBio) await updateBioMutation.mutateAsync({ bio: tempBio });
      setIsEditing(false);
      toast.success("Neural profile synchronized!");
      ownProfileQuery.refetch();
    } catch (err) {
      toast.error("Failed to synchronize profile.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info("Uploading neural avatar...");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background text-white pt-24 pb-20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 relative z-10">
        <div className="space-y-12">
          {/* Skeleton Hero */}
          <div className="p-10 rounded-[2.5rem] bg-card/30 backdrop-blur-3xl border border-white/5 animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-44 h-44 rounded-full bg-white/5 shadow-inner" />
              <div className="flex-1 space-y-4">
                <div className="h-12 w-64 bg-white/5 rounded-2xl" />
                <div className="h-4 w-40 bg-white/5 rounded-lg" />
                <div className="h-20 w-full bg-white/5 rounded-2xl mt-6" />
              </div>
            </div>
            {/* Skeleton XP */}
            <div className="mt-10 p-8 rounded-[2rem] bg-white/[0.03] border border-white/10">
              <div className="h-4 w-full bg-white/5 rounded-full" />
              <div className="flex justify-between mt-4">
                <div className="h-3 w-20 bg-white/5 rounded-lg" />
                <div className="h-3 w-20 bg-white/5 rounded-lg" />
              </div>
            </div>
          </div>
          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 rounded-[2.5rem] bg-card/40 border border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Skeleton Sidebar */}
        <div className="space-y-8">
          <div className="h-64 rounded-[2.5rem] bg-card/40 border border-white/10 animate-pulse" />
          <div className="space-y-3">
            <div className="h-16 rounded-[1.5rem] bg-white/5 animate-pulse" />
            <div className="h-16 rounded-[1.5rem] bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-20 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background Blobs - Unified with Home Page */}
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 relative z-10">
        
        {/* ── LEFT COLUMN: MAIN CONTENT ── */}
        <div className="space-y-12">
          
          {/* USER HERO SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group p-10 rounded-[2.5rem] bg-card/30 backdrop-blur-3xl border border-white/5 overflow-hidden shadow-2xl shadow-purple-500/10"
          >
            {/* Background Glow */}
            <div className="p-10 rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Animated Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              {/* Profile Photo with Glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-cyan-400 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="w-44 h-44 rounded-full p-[3px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-2xl shadow-purple-500/20 relative z-10">
                  <div className="w-full h-full rounded-[2.3rem] bg-background/80 backdrop-blur-md overflow-hidden relative">
                    {profile?.profilePhoto ? (
                      <img src={profile.profilePhoto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/20 uppercase">
                        {profile?.username?.[0] || '?'}
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-[#121212] shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col items-center md:items-start gap-1 mb-2">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                    {profile?.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 font-bold tracking-tight text-lg">@{profile?.username}</span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-black tracking-widest">
                      {profile?.levelTitle || 'Fresh Initiate'}
                    </span>
                  </div>
                </div>
                <p className="text-white/40 font-medium mb-6 text-sm">{profile?.email}</p>
                
                {isEditing ? (
                  <div className="flex flex-col gap-4 max-w-md">
                    <textarea 
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder="Input neural bio description..."
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none h-24"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6 font-bold">Save System Update</Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-6 text-white/40">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className={isOwnProfile ? "group/bio cursor-pointer" : ""} onClick={() => { if (isOwnProfile) { setTempBio(profile?.bio || ''); setIsEditing(true); } }}>
                    <p className={`text-white/60 leading-relaxed mb-6 max-w-xl ${isOwnProfile ? "group-hover/bio:text-white" : ""} transition-colors`}>
                      {profile?.bio || (isOwnProfile ? "No biometric summary detected. Click to initialize neural signature." : "No biometric summary detected.")}
                    </p>
                  </div>
                )}

                {!isOwnProfile && (
                  <Button 
                    onClick={() => {
                        setLocation(`/messages?user=${targetUserId}`);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl h-14 px-8 font-black shadow-lg shadow-purple-500/20 flex items-center gap-3 active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Send Direct Message
                  </Button>
                )}
              </div>

              <div className="hidden lg:block w-px h-32 bg-white/5" />

              <div className="flex flex-col items-center md:items-start gap-6 px-8">
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2">Neural Tier</p>
                  <p className="text-5xl font-black text-white leading-none bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">LV.{level}</p>
                </div>
                {isOwnProfile && (
                  <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 px-6 group hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-[10px]">
                    <Settings className="w-4 h-4 mr-2 text-white/40 group-hover:rotate-90 transition-transform" />
                    System Config
                  </Button>
                )}
              </div>
            </div>

            {/* XP Progress Section */}
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
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                </motion.div>
              </div>
              
              <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                <span>Level {level}</span>
                <span className="text-white/40">{xpNeededForNext - xpThisLevel} XP TO ASCEND</span>
                <span>Level {level + 1}</span>
              </div>
            </div>
          </div>
        </motion.div>

          {/* STATS TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center group hover:bg-white/[0.05] transition-all hover:scale-105 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10">
                <div className={cn("p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform", stat.color)}>
                   <stat.icon className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black tracking-tighter text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* BADGES & ACTIVITY TABS */}
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="bg-card/20 backdrop-blur-xl border border-white/5 p-1 rounded-2xl mb-8">
              <TabsTrigger value="badges" className="rounded-xl px-10 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all">
                Neural Awards
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl px-10 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all">
                Activity Log
              </TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-xl px-10 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all">
                Next Cycles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="outline-none">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {Object.entries(BADGE_MAP).map(([name, meta], idx) => {
                  const isEarned = progression?.badges?.some(b => b.badgeName === name);
                  const Icon = meta.icon;
                  return (
                    <motion.div 
                      key={name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "relative p-6 rounded-[2rem] border flex flex-col items-center text-center transition-all group backdrop-blur-xl",
                        isEarned 
                          ? "bg-purple-900/10 border-purple-500/20 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10" 
                          : "bg-white/[0.01] border-white/5 grayscale opacity-30"
                      )}
                    >
                      <div className={cn("p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform", isEarned ? meta.color + " bg-white/5 shadow-inner" : "text-white/20")}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold mb-1 tracking-tight">{name}</h4>
                      <p className="text-[9px] text-white/30 leading-tight uppercase font-black">{isEarned ? "Validated" : "Access Locked"}</p>
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute inset-x-0 -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="mx-2 p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-[9px] text-white/70 font-medium">
                          {meta.desc}
                        </div>
                      </div>
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
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 rounded-2xl bg-card/10 backdrop-blur-xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all shadow-lg"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl shadow-inner ${
                          activity.type === 'level_up' ? 'bg-amber-500/10 text-amber-400' :
                          activity.type === 'badge_earned' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {activity.type === 'level_up' ? <Trophy className="w-5 h-5" /> : 
                           activity.type === 'badge_earned' ? <Award className="w-5 h-5" /> : 
                           <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight text-white/80 group-hover:text-white transition-colors">{activity.description}</p>
                          <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()} • {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className={`font-black tracking-tighter shadow-sm ${(activity.xpGain ?? 0) > 0 ? 'text-emerald-400' : 'text-white/10'}`}>
                          {(activity.xpGain ?? 0) > 0 ? `+${activity.xpGain} XP` : '--'}
                        </p>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>

        {/* ── RIGHT COLUMN: SIDEBAR CONTENT ── */}
        <div className="space-y-8">
          
          {/* STREAK CALENDAR / FOCUS STATUS */}
          <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 relative overflow-hidden shadow-2xl shadow-cyan-500/5 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" /> Neural Streak
              </h3>
              <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{profile?.streak || 0}d</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-8 relative z-10">
              {['M','T','W','T','F','S','S'].map((d, i) => {
                 const isActive = i < (profile?.streak || 0);
                 return (
                   <div key={i} className="flex flex-col items-center gap-2">
                     <span className="text-[8px] font-black text-white/20 tracking-tighter">{d}</span>
                     <div className={cn(
                       "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                       isActive ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-110" : "bg-white/5 text-white/10"
                     )}>
                       {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                     </div>
                   </div>
                 );
              })}
            </div>

            <p className="text-[10px] text-white/40 leading-relaxed font-bold relative z-10">
               {profile?.streak && profile.streak >= 3 ? "SYSTEM ACCURACY: OPTIMAL. YOU'RE IN THE FLOW STATE." : "SYSTEM WARMING UP. MINIMUM 3-DAY STREAK FOR FLOW SYNC."}
            </p>
          </div>

          {/* QUICK ACTIONS / NAVIGATION */}
          <div className="space-y-3">
             <Button className="w-full h-16 rounded-[1.5rem] bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/10 group">
                Join Community Event
                <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
             </Button>
             <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-white/10 text-white/60 font-black text-xs uppercase tracking-widest">
                Export Neural History
             </Button>
          </div>

          {/* MOTIVATIONAL QUOTE / STATUS */}
          <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center text-center">
             <Star className="w-10 h-10 text-white/5 mb-6" />
             <p className="text-sm italic text-white/40 leading-relaxed">
               "The distance between your dreams and reality is called discipline."
             </p>
             <div className="mt-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Global Status: Elite</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Utility function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
