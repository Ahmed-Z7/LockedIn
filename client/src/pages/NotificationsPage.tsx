import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, Award, Users, Trash2, Check, Loader2, ChevronDown, Settings2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [displayCount, setDisplayCount] = useState(5);
  
  const { data: notificationsData, isLoading } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: settingsData } = trpc.notifications.getSettings.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate()
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      toast.success("Notification deleted");
    }
  });

  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      toast.success("Settings updated");
    }
  });

  const markAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ notificationId: id });
  };

  const deleteNotification = async (id: number) => {
    await deleteMutation.mutateAsync({ notificationId: id });
  };

  const handleToggleSetting = async (key: string, current: number) => {
    await updateSettingsMutation.mutateAsync({ [key]: current === 1 ? 0 : 1 });
  };

  // Sort: Unread first, then by date. Read goes to the bottom.
  const sortedNotifications = useMemo(() => {
    if (!notificationsData) return [];
    return [...notificationsData].sort((a, b) => {
      if (a.read === b.read) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (a.read || 0) - (b.read || 0);
    });
  }, [notificationsData]);

  const displayedNotifications = sortedNotifications.slice(0, displayCount);

  const getTypeStyle = (type: string, isRead: boolean) => {
    if (isRead) return 'from-gray-700/50 to-gray-800/50 grayscale opacity-60';
    switch (type) {
      case 'badge':
        return 'from-yellow-400 via-orange-500 to-red-600 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
      case 'like':
        return 'from-pink-500 via-red-500 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
      case 'comment':
        return 'from-blue-400 via-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'follow':
        return 'from-emerald-400 via-teal-500 to-cyan-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'study_session':
        return 'from-purple-400 via-fuchsia-500 to-pink-600 shadow-[0_0_15px_rgba(192,38,211,0.5)]';
      default:
        return 'from-blue-500 to-purple-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return Award;
      case 'like':
        return Heart;
      case 'comment':
        return MessageCircle;
      case 'follow':
        return Users;
      case 'study_session':
        return Loader2;
      default:
        return Bell;
    }
  };

  const getNotificationContent = (notif: any) => {
    const sender = notif.fromUserName || 'Someone';
    switch (notif.type) {
      case 'like':
        return { title: 'New Appreciation', message: `${sender} liked your progress`, icon: '❤️' };
      case 'comment':
        return { title: 'New Insight', message: `${sender} commented on your post`, icon: '💬' };
      case 'follow':
        return { title: 'New Ally', message: `${sender} is now following your journey`, icon: '👥' };
      case 'badge':
        return { title: 'Legendary Feat', message: `You've unlocked a new achievement!`, icon: '🏆' };
      default:
        return { title: 'System Pulse', message: 'The matrix provides a new update', icon: '⚡' };
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-foreground pt-24 pb-20 selection:bg-purple-500/30">
      {/* Neon Backdrop Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container relative z-10 mb-16"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-6xl font-black mb-3 tracking-tighter">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                NOTIFICATIONS
              </span>
            </h1>
            <p className="text-gray-400 text-lg font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Live stream from your LOCKEDIN environment
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => markAsReadMutation.mutate({ notificationId: -1 })} // Assume backend handles -1 as "all"
            className="px-8 py-4 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-300 font-bold backdrop-blur-md hover:bg-purple-600 hover:text-white transition-all duration-300"
          >
            SYNC ALL AS READ
          </motion.button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="container max-w-3xl relative z-10 px-4">
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="text-center py-20 bg-card/20 border border-white/5 rounded-2xl backdrop-blur-xl">
              <p className="text-gray-500 text-xl">Identity verification required</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
              <p className="text-purple-400 font-mono">RETRIEVING DATA...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-card/10 border border-white/5 rounded-3xl backdrop-blur-sm"
            >
              <Bell className="w-20 h-20 text-gray-700 mx-auto mb-6 opacity-20" />
              <p className="text-gray-500 text-xl font-light">The void is silent. No updates detected.</p>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {displayedNotifications.map((notif, idx) => {
                  const TypeIcon = getTypeIcon(notif.type);
                  const content = getNotificationContent(notif);
                  const isUnread = !notif.read;
                  
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.8, x: 50 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20, 
                        delay: idx * 0.03 
                      }}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                        isUnread 
                          ? 'bg-gradient-to-r from-purple-950/40 to-blue-950/40 border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]' 
                          : 'bg-black/40 border-white/5 opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                      } ${!notif.read ? 'p-[1px]' : ''}`}
                    >
                      {/* Neon Border Glow Handle */}
                      {isUnread && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                      )}
                      
                      <div className={`relative h-full w-full p-5 rounded-2xl ${isUnread ? 'bg-[#050510]' : ''}`}>
                        <div className="flex items-center gap-5">
                          {/* Avatar/Icon with Glow */}
                          <div className="relative flex-shrink-0">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getTypeStyle(notif.type, !!notif.read)} flex items-center justify-center`}
                            >
                              {notif.fromUserAvatar ? (
                                <img src={notif.fromUserAvatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                              ) : (
                                <TypeIcon className={`w-7 h-7 ${notif.read ? 'text-gray-400' : 'text-white shadow-[0_0_10px_white]'}`} />
                              )}
                            </motion.div>
                            {isUnread && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 border-2 border-[#050510] rounded-full shadow-[0_0_10px_#8b5cf6]" />
                            )}
                          </div>

                          {/* Content Layer */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <h3 className={`text-lg font-bold tracking-tight ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                                {content.title}
                              </h3>
                              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                {formatDistanceToNow(new Date(notif.createdAt))} ago
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-300' : 'text-gray-500'}`}>
                              {content.message}
                            </p>
                          </div>

                          {/* Action Hub */}
                          <div className="flex items-center gap-3 ml-4">
                            {isUnread && (
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#4ade80' }}
                                onClick={() => markAsRead(notif.id)}
                                className="p-2.5 bg-green-500/10 rounded-xl text-green-500/50 hover:bg-green-500/20 transition-all border border-green-500/10"
                                title="Sync to Database"
                              >
                                <Check className="w-5 h-5" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.2, color: '#f87171' }}
                              onClick={() => deleteNotification(notif.id)}
                              className="p-2.5 bg-red-500/10 rounded-xl text-red-500/50 hover:bg-red-500/20 transition-all border border-red-500/10"
                              title="Delete Stream"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Read More Trigger */}
              {sortedNotifications.length > displayCount && (
                <div className="flex justify-center mt-10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDisplayCount(prev => prev + 5)}
                    className="flex items-center gap-2 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all group"
                  >
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    DOWNLOAD MORE DATA
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Futuristic Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container max-w-3xl mt-24"
      >
        <div className="relative p-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/5">
          <div className="bg-[#050510]/95 backdrop-blur-2xl rounded-[calc(1.5rem-1px)] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Settings2 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                  System Preferences
                </h2>
                <p className="text-gray-500 text-sm italic">Tune your neural interface frequencies</p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { id: 'achievementNotifications', label: 'Feat Alerts', desc: 'Sync when you unlock epic achievements', color: 'text-yellow-400' },
                { id: 'socialNotifications', label: 'Neural Links', desc: 'Alerts for likes, comments, and new followers', color: 'text-pink-400' },
                { id: 'messageNotifications', label: 'Signal Stream', desc: 'Direct transmissions from fellow students', color: 'text-blue-400' },
                { id: 'challengeReminders', label: 'Focus Echo', desc: 'Reminder pings for scheduled study battles', color: 'text-emerald-400' },
                { id: 'weeklyDigest', label: 'Archive Logs', desc: 'Weekly summary of your progress across the matrix', color: 'text-cyan-400' },
              ].map((setting) => (
                <div 
                  key={setting.id}
                  className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
                >
                  <div className="flex-1">
                    <label className={`text-base font-bold mb-1 block transition-colors group-hover:text-white ${setting.color}`}>
                      {setting.label}
                    </label>
                    <p className="text-xs text-gray-500">{setting.desc}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleSetting(setting.id, (settingsData as any)?.[setting.id])}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${
                      (settingsData as any)?.[setting.id] === 1 
                        ? 'bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                        : 'bg-gray-800'
                    }`}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white shadow-lg shadow-black/20"
                      animate={{ x: (settingsData as any)?.[setting.id] === 1 ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 flex justify-center text-xs text-gray-600 font-mono tracking-widest uppercase">
              End of Neural Config Interface v4.1.0
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
