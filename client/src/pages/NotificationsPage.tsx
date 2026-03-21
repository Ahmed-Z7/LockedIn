import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, Award, Users, Trash2, Check, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: notificationsData, isLoading } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate()
  });

  const markAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ notificationId: id });
  };

  const deleteNotification = (id: number) => {
    // Note: The backend schema doesn't seem to have a delete endpoint yet, so we just mark read for now 
    // or add a delete endpoint if needed. For now, we simulate removal locally if needed, 
    // but typically we'd call an API. Since we don't have deleteNotification in trpc, let's just mark read.
    markAsRead(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'from-yellow-600 to-orange-600';
      case 'social':
        return 'from-red-600 to-pink-600';
      case 'message':
        return 'from-blue-600 to-purple-600';
      case 'community':
        return 'from-purple-600 to-pink-600';
      case 'challenge':
        return 'from-green-600 to-emerald-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return Award;
      case 'social':
        return Heart;
      case 'message':
        return MessageCircle;
      case 'community':
        return Users;
      case 'challenge':
        return Award;
      default:
        return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mb-12"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Notifications
              </span>
            </h1>
            <p className="text-muted-foreground">Stay updated with your LOCKEDIN activity</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-foreground font-semibold transition-all"
          >
            Mark all as read
          </motion.button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="container max-w-2xl">
        <div className="space-y-4">
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Please log in to see your notifications</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : !notificationsData || notificationsData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No notifications yet</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {notificationsData.map((notif, idx) => {
                const TypeIcon = getTypeIcon(notif.type);
                
                // Construct a message based on notification type
                let title = '';
                let message = '';
                let avatar = '';
                if (notif.type === 'like') {
                  title = 'New Like';
                  message = 'Someone liked your post';
                  avatar = '❤️';
                } else if (notif.type === 'comment') {
                  title = 'New Comment';
                  message = 'Someone commented on your post';
                  avatar = '💬';
                } else if (notif.type === 'follow') {
                  title = 'New Follower';
                  message = 'Someone started following you';
                  avatar = '👥';
                } else {
                  title = 'Notification';
                  message = 'You have a new update';
                  avatar = '🔔';
                }

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-card border ${
                      notif.read ? 'border-border/50' : 'border-purple-500/50'
                    } rounded-xl p-4 hover:border-purple-500/70 transition-all ${
                      !notif.read ? 'bg-secondary/50' : ''
                    }`}
                  >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(
                        notif.type
                      )} flex items-center justify-center text-xl flex-shrink-0`}
                    >
                      <TypeIcon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {title}
                        </h3>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{message}</p>
                      <p className="text-xs text-muted-foreground/70">{formatDistanceToNow(new Date(notif.createdAt))} ago</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => markAsRead(notif.id)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-green-400"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container max-w-2xl mt-16 mb-20"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Notification Settings</h2>
        <div className="bg-card border border-purple-500/30 rounded-xl p-6 space-y-4">
          {[
            { label: 'Achievement Notifications', enabled: true },
            { label: 'Community Activity', enabled: true },
            { label: 'Direct Messages', enabled: true },
            { label: 'Challenge Reminders', enabled: false },
            { label: 'Weekly Digest', enabled: true },
          ].map((setting, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 hover:bg-card/50 rounded-lg transition-colors"
            >
              <label className="text-foreground font-semibold cursor-pointer">{setting.label}</label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`w-12 h-6 rounded-full transition-all ${
                  setting.enabled ? 'bg-purple-600' : 'bg-card'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-background"
                  animate={{ x: setting.enabled ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
