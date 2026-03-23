import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Heart, MessageCircle, Award, Users, 
  Trash2, Check, Loader2, Settings, Sparkles,
  ChevronDown, X
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [limit, setLimit] = useState(5);
  
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: settings } = trpc.notifications.getSettings.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => utils.notifications.unreadCount.invalidate().then(() => utils.notifications.list.invalidate())
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
        utils.notifications.list.invalidate();
        toast.success("Notification deleted");
    }
  });

  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation({
    onSuccess: () => {
        utils.notifications.getSettings.invalidate();
        toast.success("Settings updated");
    }
  });

  const handleToggleSetting = (key: string, current: number) => {
    updateSettingsMutation.mutate({ [key]: current === 1 ? 0 : 1 });
  };

  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    // Unread first, then by date
    return [...notifications].sort((a, b) => {
      const aRead = a.read ?? 0;
      const bRead = b.read ?? 0;
      if (aRead !== bRead) return aRead - bRead;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  const visibleNotifications = sortedNotifications.slice(0, limit);

  const getTypeStyles = (type: string, read: boolean) => {
    if (read) return "from-slate-800 to-slate-900 border-slate-700 text-slate-500 shadow-none grayscale";
    
    switch (type) {
      case 'like': return "from-pink-600/20 to-rose-600/10 border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]";
      case 'comment': return "from-blue-600/20 to-cyan-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
      case 'achievement': return "from-amber-600/20 to-orange-600/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      default: return "from-purple-600/20 to-indigo-600/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'achievement': return Award;
      default: return Bell;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-background relative overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40vw] h-[40vw] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                    Signal Feed
                </span>
            </h1>
            <p className="text-foreground/40 font-medium">Real-time pulses from your network.</p>
          </div>
          <Button 
            onClick={() => markAsReadMutation.mutate({ notificationId: -1 })}
            variant="ghost" 
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-2 border border-purple-500/20 rounded-xl"
          >
            <Check className="w-4 h-4" />
            Clear All
          </Button>
        </motion.div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>
          ) : visibleNotifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {visibleNotifications.map((notif, idx) => {
                const Icon = getIcon(notif.type);
                const styles = getTypeStyles(notif.type, !!notif.read);
                
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                        "relative group p-4 rounded-2xl border bg-gradient-to-br transition-all duration-500",
                        styles
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar/Icon */}
                      <div className="relative">
                          <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                              notif.read ? "bg-slate-700/50" : "bg-purple-500/20"
                          )}>
                             <Icon className={cn("w-6 h-6", notif.read ? "text-slate-600" : "text-purple-400")} />
                          </div>
                          {!notif.read && (
                            <motion.div 
                                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                            "text-sm font-medium leading-relaxed",
                            notif.read ? "text-foreground/40" : "text-foreground"
                        )}>
                          <span className="font-bold text-purple-400 mr-1">{notif.fromUserName || "Someone"}</span>
                          {notif.type === 'like' ? 'vibrated your vibe' : notif.type === 'comment' ? 'coded a thought' : 'pinged you'}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-foreground/30 mt-1">
                          {formatDistanceToNow(new Date(notif.createdAt))} ago
                        </p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                            <Button 
                                size="icon" variant="ghost" 
                                onClick={() => markAsReadMutation.mutate({ notificationId: notif.id })}
                                className="w-8 h-8 rounded-lg hover:bg-green-500/10 text-green-400"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        )}
                        <Button 
                            size="icon" variant="ghost" 
                            onClick={() => deleteMutation.mutate({ notificationId: notif.id })}
                            className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-red-500"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center bg-card/10 rounded-3xl border border-dashed border-white/5">
                <Bell className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                <p className="text-foreground/30 font-medium italic">The void is silent...</p>
            </div>
          )}
        </div>

        {sortedNotifications.length > limit && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center"
            >
                <Button 
                    onClick={() => setLimit(prev => prev + 5)}
                    variant="outline" 
                    className="border-white/10 hover:border-purple-500/30 bg-white/5 text-foreground/60 rounded-xl gap-2 h-12 px-8"
                >
                    Expand Signals
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </motion.div>
        )}

        {/* Cyberpunk Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-24 border-t border-white/5 pt-12 mb-20"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">System Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'achievementNotifications', label: 'Trophy Pings', icon: Award },
              { id: 'socialNotifications', label: 'Social Sync', icon: Heart },
              { id: 'messageNotifications', label: 'Direct Uplink', icon: MessageCircle },
              { id: 'weeklyDigest', label: 'Summary Stream', icon: Sparkles },
            ].map((setting) => (
              <motion.div
                key={setting.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-card/30 border border-white/5 rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                    <setting.icon className="w-4 h-4 text-foreground/30 group-hover:text-purple-400 transition-colors" />
                    <span className="text-sm font-medium text-foreground/60">{setting.label}</span>
                </div>
                <button
                  onClick={() => handleToggleSetting(setting.id, (settings as any)?.[setting.id] ?? 1)}
                  className={cn(
                      "w-10 h-5 rounded-full relative transition-all duration-300",
                      (settings as any)?.[setting.id] === 1 ? "bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-white/10"
                  )}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-lg"
                    animate={{ x: (settings as any)?.[setting.id] === 1 ? 20 : 0 }}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
