import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Search, Plus } from 'lucide-react';
import { useState } from 'react';

export default function CommunityPage() {
  const [posts] = useState([
    {
      id: 1,
      author: 'Ahmed Hassan',
      avatar: '👨‍💼',
      title: 'Just completed my first 30-day streak!',
      content: 'Feeling amazing after maintaining focus for a full month. LOCKEDIN really changed my productivity!',
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: '2 hours ago',
      liked: false,
    },
    {
      id: 2,
      author: 'Fatima Ali',
      avatar: '👩‍🎓',
      title: 'AI Coach helped me understand calculus!',
      content: 'I was struggling with derivatives, but the AI tutor broke it down so clearly. Highly recommend!',
      likes: 567,
      comments: 89,
      shares: 34,
      timestamp: '4 hours ago',
      liked: false,
    },
    {
      id: 3,
      author: 'Mohammed Ibrahim',
      avatar: '👨‍🎓',
      title: 'Unlocked the Master Achiever badge today 🏆',
      content: 'After 50 hours of focused study, I finally got the Master Achiever badge. The gamification system is so motivating!',
      likes: 892,
      comments: 156,
      shares: 67,
      timestamp: '6 hours ago',
      liked: false,
    },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mb-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Community
              </span>
            </h1>
            <p className="text-gray-400">Connect, share, and grow together</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center gap-2 glow-purple"
          >
            <Plus className="w-5 h-5" />
            New Post
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts, people, or topics..."
            className="w-full bg-background border border-gray-700/50 rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
          />
        </div>
      </motion.div>

      {/* Posts Feed */}
      <div className="container">
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-background border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
            >
              {/* Author Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">{post.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{post.author}</h3>
                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
              </div>

              {/* Post Content */}
              <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
              <p className="text-gray-300 mb-6">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">{post.shares}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="container text-center mt-12 mb-20"
      >
        <button className="px-8 py-3 rounded-lg border border-purple-500/50 text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          Load More Posts
        </button>
      </motion.div>
    </div>
  );
}
