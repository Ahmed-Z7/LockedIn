import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string | null;
  likes: number | null;
  commentsCount?: number | null;
  comments?: number;
  createdAt: Date;
  updatedAt?: Date;
  author?: {
    name: string;
    email: string;
  };
}

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Fetch all posts
  const { data: postsData, isLoading } = trpc.community.getPosts.useQuery();

  useEffect(() => {
    if (postsData) {
      const formattedPosts = (postsData as any[]).map(post => ({
        ...post,
        comments: post.commentsCount || 0,
        likes: post.likes || 0,
      }));
      setPosts(formattedPosts);
      setLoading(false);
    }
  }, [postsData]);

  const handleAddPost = () => {
    if (!isAuthenticated) {
      setLocation('/');
      return;
    }
    setLocation('/add-post');
  };

  const handleLike = async (postId: number) => {
    if (!isAuthenticated) return;
    
    if (likedPosts.has(postId)) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setLikedPosts(prev => new Set(prev).add(postId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F7FF] via-[#EEF2FF] to-[#F6F7FF] text-foreground dark:from-[#0F0F1E] dark:via-[#1A1A2E] dark:to-[#0F0F1E] dark:text-white pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 mb-12"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#5B7FFF] via-[#06B6D4] to-[#A855F7] bg-clip-text text-transparent dark:from-[#5B7FFF] dark:via-[#06B6D4] dark:to-[#A855F7]">
              Community
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Share your learning journey and connect with others</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddPost}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#5B7FFF] to-[#06B6D4] hover:from-[#4A6FFF] hover:to-[#0BA6C4] text-white dark:from-[#5B7FFF] dark:to-[#06B6D4] dark:hover:from-[#4A6FFF] dark:hover:to-[#0BA6C4] font-semibold flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(91,127,255,0.4)] dark:hover:shadow-[0_0_20px_rgba(91,127,255,0.5)]"
          >
            <Plus className="w-5 h-5" />
            New Post
          </motion.button>
        </div>
      </motion.div>

      {/* Posts List */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="space-y-4">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-500">Loading posts...</p>
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white dark:bg-[#1A1A2E] rounded-lg border border-gray-200 dark:border-[#2D2D4D] shadow-sm dark:shadow-[0_0_20px_rgba(91,127,255,0.1)]"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-4">No posts yet. Be the first to share!</p>
              <Button
                onClick={handleAddPost}
                className="bg-gradient-to-r from-[#5B7FFF] to-[#06B6D4] hover:from-[#4A6FFF] hover:to-[#0BA6C4] text-white dark:from-[#5B7FFF] dark:to-[#06B6D4]"
              >
                Create First Post
              </Button>
            </motion.div>
          ) : (
            posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-[#2D2D4D] rounded-lg p-6 hover:border-gray-300 dark:hover:border-[#5B7FFF] transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(91,127,255,0.15)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By <span className="font-semibold text-blue-600 dark:text-[#5B7FFF]">{post.author?.name || post.author?.email || 'Anonymous'}</span> • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-[#5B7FFF]/20 text-blue-700 dark:text-[#5B7FFF] rounded-full text-xs font-semibold border border-blue-200 dark:border-[#5B7FFF]/30">
                    {post.category}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex gap-6 pt-4 border-t border-gray-200 dark:border-[#2D2D4D]">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      likedPosts.has(post.id)
                        ? 'text-red-500 dark:text-red-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500'
                    }`}
                  >
                    <Heart size={18} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                    <span className="text-sm">{(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#06B6D4] dark:hover:text-[#06B6D4] transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span className="text-sm">{post.comments || 0}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#5B7FFF] dark:hover:text-[#5B7FFF] transition-colors"
                  >
                    <Share2 size={18} />
                    <span className="text-sm">Share</span>
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
