import { motion } from 'framer-motion';
import { Send, X, FileText, BookOpen, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AddPostPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostMutation = trpc.community.createPost.useMutation();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a post');
      setLocation('/');
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostMutation.mutateAsync({
        title: postTitle,
        content: postContent,
        category: postCategory,
      });
      toast.success('Post created successfully!');
      setPostTitle('');
      setPostContent('');
      setPostCategory('general');
      setLocation('/community');
    } catch (error) {
      toast.error('Failed to create post');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F7FF] via-[#EEF2FF] to-[#F6F7FF] text-foreground dark:from-[#F6F7FF] dark:via-[#EEF2FF] dark:to-[#F6F7FF] dark:text-foreground pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 mb-12"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#9945ce] via-[#6e68dd] to-[#5053bf] bg-clip-text text-transparent dark:from-[#5053bf] dark:via-[#6e68dd] dark:to-[#9945ce]">
          Share Your Progress
        </h1>
        <p className="text-gray-300 dark:text-muted-foreground">Inspire the community with your LOCKEDIN journey</p>
      </motion.div>

      {/* Main Editor */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] dark:bg-background border border-[#5053bf] dark:border-border rounded-2xl p-8"
        >
          {/* Post Category Selector */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-300 dark:text-[#1E293B] mb-3 block">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'general', label: 'General', icon: FileText },
                { id: 'achievement', label: 'Achievement', icon: BookOpen },
                { id: 'question', label: 'Question', icon: HelpCircle },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPostCategory(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      postCategory === type.id
                        ? 'border-[#9945ce] bg-[#9945ce]/20 text-[#9945ce] dark:border-[#5053bf] dark:bg-[#5053bf]/20 dark:text-[#5053bf]'
                        : 'border-[#5053bf] bg-[#5053bf]/10 text-gray-400 dark:border-border dark:bg-card dark:text-muted-foreground hover:border-[#9945ce] dark:hover:border-[#9945ce]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-300 dark:text-[#1E293B] mb-3 block">Post Title</label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Give your post a catchy title..."
              maxLength={200}
              className="w-full bg-[#1d2952] dark:bg-background border border-[#5053bf] dark:border-border rounded-lg px-4 py-3 text-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#9945ce] dark:focus:border-[#9945ce] transition-all duration-300"
            />
            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
              {postTitle.length} / 200 characters
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-300 dark:text-[#1E293B] mb-3 block">What's on your mind?</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share your thoughts, achievements, or ask the community..."
              maxLength={5000}
              className="w-full h-48 bg-[#1d2952] dark:bg-background border border-[#5053bf] dark:border-border rounded-lg px-4 py-3 text-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#9945ce] dark:focus:border-[#9945ce] resize-none transition-all duration-300"
            />
            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
              {postContent.length} / 5000 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[#5053bf] dark:border-border">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 text-gray-400 dark:text-muted-foreground hover:text-[#9945ce] dark:hover:text-[#9945ce] transition-colors font-semibold"
              >
                Save Draft
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-[#9945ce] to-[#6e68dd] hover:from-[#7a5fd4] hover:to-[#5053bf] dark:from-[#5053bf] dark:to-[#6e68dd] dark:hover:from-[#6059d2] dark:hover:to-[#7566dc] disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(153,69,206,0.4)]"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </motion.button>
          </div>

          {/* Tips */}
          <div className="bg-[#5053bf]/10 dark:bg-[#9945ce]/10 border border-[#5053bf]/30 dark:border-[#9945ce]/30 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-[#9945ce] dark:text-[#5053bf] mb-2">💡 Tips for a great post:</h3>
            <ul className="text-sm text-gray-400 dark:text-muted-foreground space-y-1">
              <li>• Share your achievements and milestones</li>
              <li>• Ask questions and help others learn</li>
              <li>• Be respectful and supportive of the community</li>
              <li>• Use clear and engaging language</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
