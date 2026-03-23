import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, Circle, 
  Bot, Send, Sparkles, ChevronRight, 
  AlertTriangle, RotateCcw, Play, Plus,
  Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chatInp, setChatInp] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user', content: string }>>([
    { role: 'ai', content: "Welcome back! I can help you adjust your schedule. Just say 'make it easier' or 'add a review session'." }
  ]);
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ subject: '', duration: 0 });

  const { data: schedule, isLoading } = trpc.study.getSchedule.useQuery(undefined, { 
    enabled: isAuthenticated 
  });

  const updateStatusMutation = trpc.study.updateSession.useMutation({
    onSuccess: () => utils.study.getSchedule.invalidate()
  });

  const adjustMutation = trpc.study.adjustSchedule.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      utils.study.getSchedule.invalidate();
    }
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleStatus = async (id: number, current: number) => {
    const newStatus = current === 1 ? 0 : 1;
    await updateStatusMutation.mutateAsync({ sessionId: id, completed: newStatus });
    if (newStatus === 1) toast.success("Session completed! +50 XP");
  };

  const handleEditSave = async (id: number) => {
    await updateStatusMutation.mutateAsync({ 
        sessionId: id, 
        subject: editForm.subject,
        duration: editForm.duration
    });
    setEditingSession(null);
    toast.success("Session updated");
  };

  const handleSendChat = async () => {
    if (!chatInp.trim()) return;
    const msg = chatInp;
    setChatInp('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    
    await adjustMutation.mutateAsync({ message: msg });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Schedule List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Study Timeline
              </h1>
              <p className="text-foreground/50 text-sm mt-1">Your AI-optimized path to mastery.</p>
            </div>
            <Button 
                onClick={() => setLocation('/start-learning')}
                variant="outline" 
                className="border-purple-500/20 hover:border-purple-500/40 bg-purple-500/5 text-purple-400 gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
            ) : schedule && schedule.length > 0 ? (
              schedule.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group relative overflow-hidden bg-card/40 backdrop-blur-md border rounded-2xl p-5 transition-all duration-300",
                    session.completed ? "border-green-500/20 opacity-60" : "border-white/10 hover:border-purple-500/30 hover:bg-card/60 shadow-xl shadow-black/5"
                  )}
                >
                  {/* Neon Indicator */}
                  {!session.completed && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="flex items-center gap-4">
                    <button 
                        onClick={() => handleToggleStatus(session.id, session.completed || 0)}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            session.completed ? "bg-green-500/20 text-green-400" : "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:scale-110"
                        )}
                    >
                      {session.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-bold text-lg truncate", session.completed && "line-through text-foreground/40")}>
                          {session.subject}
                        </h3>
                        {session.sessionType === 'review' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                                Review
                            </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-foreground/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.scheduledTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration} min
                        </span>
                        <span className={cn(
                            "font-bold uppercase tracking-tighter",
                            session.difficulty === 'hard' ? 'text-pink-500' : session.difficulty === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                        )}>
                          {session.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingSession === session.id ? (
                        <div className="flex items-center gap-2 bg-background border border-purple-500/30 p-2 rounded-xl scale-110 shadow-2xl z-20">
                            <input 
                                className="bg-transparent border-none text-xs w-24 focus:outline-none"
                                value={editForm.subject}
                                onChange={e => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                            />
                            <input 
                                className="bg-transparent border-none text-xs w-12 focus:outline-none"
                                type="number"
                                value={editForm.duration}
                                onChange={e => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleEditSave(session.id)} className="h-6 px-2 text-[10px] text-green-400">Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingSession(null)} className="h-6 px-2 text-[10px] text-red-400"><X className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <>
                            <Button 
                                onClick={() => {
                                    setEditingSession(session.id);
                                    setEditForm({ subject: session.subject, duration: session.duration });
                                }}
                                size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white/5 text-foreground/40"
                            >
                            <Settings className="w-4 h-4" />
                            </Button>
                            {!session.completed && (
                                <Button 
                                    onClick={() => setLocation(`/study-session/${session.id}`)}
                                    size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-purple-500/10 text-purple-400"
                                >
                                    <Play className="w-4 h-4" />
                                </Button>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center bg-card/20 rounded-3xl border border-dashed border-white/10">
                <Calendar className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground/60 mb-2">No Schedule Found</h3>
                <p className="text-foreground/40 mb-8">Generate a plan from study material to get started.</p>
                <Button onClick={() => setLocation('/start-learning')} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Chat Adjustment */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-direction-column shadow-2xl h-[600px]">
            {/* Chat Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Nex AI Tutor</h2>
                <div className="flex items-center gap-1 text-[10px] text-green-400 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Always Ready
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'ai' 
                      ? "bg-white/5 border border-white/5 self-start rounded-tl-none text-foreground/80" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 self-end ml-auto rounded-tr-none text-white shadow-lg"
                  )}
                >
                  {msg.content}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-5 py-2 flex flex-wrap gap-2">
                {['Make it easier', 'Exam in 3 days', 'Review session'].map(tag => (
                    <button 
                        key={tag}
                        onClick={() => { setChatInp(tag); }}
                        className="text-[10px] px-2 py-1 bg-white/5 border border-white/5 rounded-full hover:bg-purple-500/20 hover:border-purple-500/30 transition-all text-foreground/60"
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-black/20 border-t border-white/5">
              <div className="relative group">
                <input
                  value={chatInp}
                  onChange={(e) => setChatInp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask me to adjust..."
                  className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                />
                <button 
                    onClick={handleSendChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  {adjustMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
