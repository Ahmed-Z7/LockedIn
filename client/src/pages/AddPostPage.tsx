import { motion } from 'framer-motion';
import { Send, Image, Smile, X, FileText, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function AddPostPage() {
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (postContent.trim()) {
      console.log('Post submitted:', { content: postContent, type: postType, image: selectedImage });
      setPostContent('');
      setSelectedImage(null);
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
        <h1 className="text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Share Your Progress
          </span>
        </h1>
        <p className="text-gray-400">Inspire the community with your LOCKEDIN journey</p>
      </motion.div>

      {/* Main Editor */}
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-purple-500/30 rounded-2xl p-8"
        >
          {/* Post Type Selector */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-400 mb-3 block">Post Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'general', label: 'General', icon: FileText },
                { id: 'achievement', label: 'Achievement', icon: BookOpen },
                { id: 'question', label: 'Question', icon: Smile },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPostType(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      postType === type.id
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Text Editor */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-400 mb-3 block">What's on your mind?</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share your thoughts, achievements, or ask the community..."
              className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none transition-all duration-300"
            />
            <div className="text-xs text-gray-500 mt-2">
              {postContent.length} / 5000 characters
            </div>
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 relative"
            >
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-purple-400"
                title="Add Image"
              >
                <Image className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-purple-400"
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-semibold"
              >
                Draft
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!postContent.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Post
              </motion.button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-purple-300 mb-2">💡 Tips for a great post:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Share your achievements and milestones</li>
              <li>• Ask questions and help others learn</li>
              <li>• Include images or screenshots for context</li>
              <li>• Be respectful and supportive of the community</li>
            </ul>
          </div>
        </motion.div>

        {/* Recent Posts Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Community Posts</h2>
          <div className="space-y-4">
            {[
              { author: 'Sarah', content: 'Just hit 50 days streak! 🔥', type: 'achievement' },
              { author: 'Mike', content: 'Anyone want to study together?', type: 'question' },
              { author: 'Emma', content: 'New study technique that works amazing', type: 'general' },
            ].map((post, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-all"
              >
                <p className="font-semibold text-white mb-2">{post.author}</p>
                <p className="text-gray-300 mb-3">{post.content}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.type === 'achievement'
                      ? 'bg-green-500/20 text-green-400'
                      : post.type === 'question'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {post.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
