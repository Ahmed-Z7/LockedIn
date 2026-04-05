import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, Circle, 
  Bot, Send, Sparkles, ChevronRight, 
  AlertTriangle, RotateCcw, Play, Plus,
  Loader2, Map, BookOpen
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { QuizValidation } from '@/components/QuizValidation';

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chatInp, setChatInp] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user', content: string }>>([
    { role: 'ai', content: "Welcome back! I'm ZED. I can help you adjust your schedule. Just say 'make it easier' or 'add a review session'." }
  ]);
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ subject: '', duration: 0 });
  const [selectedSessionForExam, setSelectedSessionForExam] = useState<any>(null);
  const [examConfig, setExamConfig] = useState({ open: false, count: 10 });
  const [quizData, setQuizData] = useState<any[]>([]);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

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

  const generateQuizMutation = trpc.study.generateStandaloneQuiz.useMutation();

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

  const handleStartExam = async () => {
    if (!selectedSessionForExam) return;
    setExamConfig(prev => ({ ...prev, open: false }));
    setIsExamActive(true);
    setIsGeneratingExam(true);
    
    try {
      const res = await generateQuizMutation.mutateAsync({
        count: examConfig.count,
        sessionId: selectedSessionForExam.id,
        content: selectedSessionForExam.subject // Simple context for now
      });
      setQuizData(res.quiz);
    } catch (e) {
      toast.error("Telemetry link failed. Neural quiz not generated.");
      setIsExamActive(false);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleUpdateSession = async () => {
    setEditForm({ subject: '', duration: 0 });
    setEditingSession(null);
  };

  if (!isAuthenticated) return null;

  const totalSessions = schedule?.length || 0;
  const completedSessions = schedule?.filter(s => s.completed === 1).length || 0;
  const progressPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen pt-44 pb-12 px-6 bg-[#09090b] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* TOP STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white/5 border border-border backdrop-blur-xl flex items-center justify-between"
          >
            <div>
              <p className="text-foreground/40 text-xs font-black uppercase tracking-widest mb-1">Daily Sync</p>
              <h2 className="text-3xl font-black text-white">{completedSessions}<span className="text-foreground/20">/{totalSessions}</span></h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-white/5 border border-border backdrop-blur-xl flex items-center justify-between"
          >
            <div>
              <p className="text-foreground/40 text-xs font-black uppercase tracking-widest mb-1">Neural Integration</p>
              <h2 className="text-3xl font-black text-white">{progressPercent}%</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center overflow-hidden relative">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-indigo-500/40 transition-all duration-1000" 
                style={{ height: `${progressPercent}%` }} 
              />
              <Sparkles className="w-6 h-6 text-indigo-400 relative z-10" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl bg-white/5 border border-border backdrop-blur-xl flex items-center justify-between"
          >
            <div>
              <p className="text-foreground/40 text-xs font-black uppercase tracking-widest mb-1">Active Timeline</p>
              <h2 className="text-xl font-black text-white">Focus Mode Active</h2>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-6 bg-purple-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Schedule List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Neural Timeline</h1>
                <p className="text-foreground/40 text-sm font-medium">Synchronizing your biological rhythm with data.</p>
              </div>
              <div className="flex gap-4">
                <Button 
                    onClick={() => setLocation('/gamification-levels')}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-2xl h-12 px-6 gap-2 group transition-all"
                >
                  <Map className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  View Progress Map
                </Button>
                <Button 
                    onClick={() => setLocation('/start-learning')}
                    className="bg-white/5 hover:bg-white/10 text-white border border-border rounded-2xl h-12 px-6 gap-2 group transition-all"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Initialize New Path
                </Button>
              </div>
            </div>

            <div className="relative pl-8 space-y-6">
              {/* Timeline Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500/50 via-white/10 to-transparent" />

              {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>
              ) : schedule && schedule.length > 0 ? (
                schedule.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline Node */}
                    <div className={cn(
                      "absolute -left-[35px] top-7 w-4 h-4 rounded-full border-2 z-10 transition-colors",
                      session.completed ? "bg-emerald-500 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-[#09090b] border-white/20 group-hover:border-purple-500"
                    )} />

                    <div className={cn(
                      "group p-6 rounded-[2rem] border transition-all duration-500",
                      session.completed 
                        ? "bg-white/[0.02] border-emerald-500/10 opacity-70" 
                        : "bg-white/5 border-border/50 hover:border-purple-500/30 hover:bg-white/[0.07] hover:translate-x-2"
                    )}>
                      <div className="flex items-start gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={cn(
                              "text-xl font-black tracking-tight",
                              session.completed ? "text-foreground/40 line-through" : "text-white"
                            )}>
                              {session.subject}
                            </h3>
                            {session.sessionType === 'review' && (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                Review Sync
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(session.scheduledTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-purple-400/50" />
                              {session.duration} Minutes
                            </span>
                            <span className={cn(
                                "px-2 py-0.5 rounded bg-white/5",
                                session.difficulty === 'hard' ? 'text-rose-500' : session.difficulty === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                            )}>
                              {session.difficulty} Phase
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!session.completed && (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => setLocation(`/study-session/${session.id}`)}
                                className="h-10 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 text-[10px] font-black uppercase tracking-widest gap-2"
                              >
                                <Play className="w-4 h-4 fill-current" />
                                Join Session
                              </Button>
                              <Button 
                                onClick={() => {
                                  setSelectedSessionForExam(session);
                                  setExamConfig({ open: true, count: 10 });
                                }}
                                className="h-10 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest gap-2"
                              >
                                <BookOpen className="w-4 h-4" />
                                Enter Exam
                              </Button>
                            </div>
                          )}
                          <Button 
                            onClick={() => handleToggleStatus(session.id, session.completed || 0)}
                            className={cn(
                              "h-10 w-full rounded-2xl bg-white/5 border border-border hover:bg-white/10 flex items-center justify-center gap-2",
                              session.completed ? "text-emerald-500 border-emerald-500/20" : "text-foreground/40"
                            )}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {session.completed ? "Neural Locked" : "Mark as Synced"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-border">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-foreground/10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Timeline Empty</h3>
                  <p className="text-foreground/30 mb-8 max-w-xs mx-auto">No neural paths detected. Initialize a path from your study materials.</p>
                  <Button onClick={() => setLocation('/start-learning')} className="bg-purple-600 hover:bg-purple-700 rounded-2xl px-10 h-14 font-black">
                    Start Learning
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Chat Adjustment */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-3xl border border-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl h-[650px] relative"
            >
              {/* Animated Glow Wrapper */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

              {/* Chat Header */}
              <div className="p-6 border-b border-border/50 relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-white text-lg tracking-tight">ZED Neural Link</h2>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      Protocol Active
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-hide">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-xl",
                      msg.role === 'ai' 
                        ? "bg-white/5 border border-border/50 self-start rounded-tl-none text-foreground/80" 
                        : "bg-gradient-to-br from-purple-600 to-indigo-600 self-end ml-auto rounded-tr-none text-white ring-4 ring-purple-500/10"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Interface */}
              <div className="p-6 pt-2 bg-background/20 border-t border-border/50 relative z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                    {['Ease Load', 'Fast Track', 'Add Break'].map(tag => (
                        <button 
                            key={tag}
                            onClick={() => { setChatInp(tag); }}
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-border rounded-xl hover:bg-purple-500/30 hover:border-purple-500/50 transition-all text-foreground/40 hover:text-white"
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                  <input
                    value={chatInp}
                    onChange={(e) => setChatInp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Sync Request..."
                    className="w-full bg-white/5 border border-border rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-purple-500/50 transition-all font-medium text-white placeholder:text-foreground/20"
                  />
                  <button 
                      onClick={handleSendChat}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-purple-400 hover:text-white transition-all active:scale-95"
                  >
                    {adjustMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* EXAM CONFIG MODAL */}
      <AnimatePresence>
        {examConfig.open && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6"
           >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="bg-zinc-900 border border-border p-8 rounded-[2.5rem] max-w-sm w-full text-center space-y-6"
             >
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-black text-white">Neural Exam</h2>
                <p className="text-foreground/40 text-sm">Select target question depth for ${selectedSessionForExam?.subject}</p>
                
                <div className="flex gap-2">
                    {[10, 20, 30].map(c => (
                        <button 
                            key={c}
                            onClick={() => setExamConfig(prev => ({ ...prev, count: c }))}
                            className={cn(
                                "flex-1 py-3 rounded-xl border text-xs font-black transition-all",
                                examConfig.count === c ? "bg-indigo-600 border-indigo-600 text-white" : "border-border/50 bg-white/5 text-foreground/40"
                            )}
                        >
                            {c} Qs
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant="ghost" className="flex-1 rounded-xl h-12"
                        onClick={() => setExamConfig({ open: false, count: 10 })}
                    >Cancel</Button>
                    <Button 
                        className="flex-1 rounded-xl h-12 bg-indigo-600"
                        onClick={handleStartExam}
                    >Initialize</Button>
                </div>
             </motion.div>
           </motion.div>
        )}

        {isExamActive && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-background/95 backdrop-blur-3xl pt-24 overflow-y-auto"
            >
                {isGeneratingExam ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">ZED is synthesizing exam...</h2>
                    </div>
                ) : (
                    <QuizValidation 
                        quiz={quizData}
                        subject={selectedSessionForExam?.subject || "Core Mastery"}
                        onComplete={() => {
                            setIsExamActive(false);
                            toast.success("Examination Complete. Neural metrics updated.");
                            utils.study.getSchedule.invalidate();
                        }}
                        onRetry={() => setIsExamActive(false)}
                    />
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
