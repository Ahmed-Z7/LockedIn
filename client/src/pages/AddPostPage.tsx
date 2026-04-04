import { motion } from 'framer-motion';
import { Send, X, FileText, BookOpen, HelpCircle, Sparkles, Zap, Target } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import { cn } from '@/lib/utils';

export default function AddPostPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  const createPostMutation = trpc.community.createPost.useMutation();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Neural access denied. Please login.');
      setLocation('/');
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Title and content required for transmission.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostMutation.mutateAsync({
        title: postTitle,
        content: postContent,
        category: postCategory,
      });
      toast.success('Transmission successful! Post broadcasted.');
      utils.community.getPosts.invalidate();
      setLocation('/community');
    } catch (error) {
      toast.error('Transmission failed. Neural link unstable.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pt-24 pb-20 relative overflow-hidden selection:bg-purple-500/30">
      <Navbar />
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Broadcast Transmission</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
            INITIALIZE <span className="text-purple-500 underline decoration-purple-500/30 underline-offset-8">DATA</span> DUMP
          </h1>
          <p className="text-white/40 font-medium tracking-wide">Sync your progress with the global neural network.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl shadow-purple-500/10"
        >
          {/* Category Selector */}
          <div className="mb-10">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 block">Neural Category</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'general', label: 'General', icon: Zap },
                { id: 'achievement', label: 'Achievement', icon: Target },
                { id: 'question', label: 'Inquiry', icon: HelpCircle },
              ].map((type) => {
                const Icon = type.icon;
                const isActive = postCategory === type.id;
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPostCategory(type.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                      isActive
                        ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "text-white/20")} />
                    <span className="text-xs font-bold">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 block">Transmission Title</label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Designate your broadcast..."
              maxLength={200}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all text-lg font-bold"
            />
            <div className="flex justify-end mt-2">
              <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest">{postTitle.length} / 200</span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-10">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 block">Neural Payload</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Describe your neural findings or milestones..."
              maxLength={5000}
              className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] px-6 py-6 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all resize-none text-base leading-relaxed"
            />
            <div className="flex justify-end mt-2">
              <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest">{postContent.length} / 5000</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-6 pt-10 border-t border-white/5">
            <Button 
                variant="ghost" 
                onClick={() => setLocation('/community')}
                className="rounded-2xl px-8 h-14 font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white"
            >
                Abort Sync
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl h-14 font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                  <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Syncing...
                  </div>
              ) : (
                  <div className="flex items-center gap-3">
                      <Send className="w-4 h-4" /> Broadcast Sync
                  </div>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Sync Tips */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-8 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10"
        >
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> Transmission Protocols
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="text-xs text-white/30 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40 mt-1" />
                    Share high-focus achievements to inspire the collective.
                </li>
                <li className="text-xs text-white/30 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40 mt-1" />
                    Use clear designations for your neural findings.
                </li>
            </ul>
        </motion.div>
      </div>
    </div>
  );
}


