import { motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, Award, Users, Trash2, Check } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'achievement',
      title: 'New Badge Unlocked!',
      message: 'You earned the "Week Warrior" badge for 7-day streak',
      avatar: '🏆',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'social',
      title: 'Sarah liked your post',
      message: 'Your post about study techniques got 15 likes',
      avatar: '❤️',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'message',
      title: 'New message from AI Coach',
      message: 'Your study schedule is ready for tomorrow',
      avatar: '🤖',
      timestamp: '6 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'community',
      title: 'You gained 100 XP',
      message: 'Completed 5 focus sessions today',
      avatar: '⚡',
      timestamp: '8 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'challenge',
      title: 'Challenge reminder',
      message: 'You have 2 days left to complete the "Master Learner" challenge',
      avatar: '🎯',
      timestamp: '1 day ago',
      read: true,
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
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
            <p className="text-gray-400">Stay updated with your LOCKEDIN activity</p>
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
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No notifications yet</p>
            </motion.div>
          ) : (
            notifications.map((notif, idx) => {
              const TypeIcon = getTypeIcon(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-card border ${
                    notif.read ? 'border-gray-700/50' : 'border-purple-500/50'
                  } rounded-xl p-4 hover:border-purple-500/70 transition-all ${
                    !notif.read ? 'bg-purple-500/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(
                        notif.type
                      )} flex items-center justify-center text-xl flex-shrink-0`}
                    >
                      {notif.avatar}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${notif.read ? 'text-gray-300' : 'text-foreground'}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{notif.message}</p>
                      <p className="text-xs text-gray-500">{notif.timestamp}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => markAsRead(notif.id)}
                          className="p-2 hover:bg-card rounded-lg transition-colors text-gray-400 hover:text-green-400"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 hover:bg-card rounded-lg transition-colors text-gray-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
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
