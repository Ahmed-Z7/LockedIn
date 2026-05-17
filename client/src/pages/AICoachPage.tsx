import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, MessageCircle, Loader2, Sparkles, Moon, 
  AlertTriangle, Feather, Dumbbell, RotateCcw,
  TrendingUp, Zap, Target, Brain, Trash2, Globe, Settings2, X, Edit2, Check
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AICoachPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: t('ai.welcome') }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const utils = trpc.useUtils();
  const chatMutation = trpc.aiCoach.chat.useMutation();
  // ZED Training & Config
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  const { data: conversations, refetch: refetchConversations } = trpc.aiCoach.getConversations.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history, isLoading: isHistoryLoading, refetch: refetchHistory } = trpc.aiCoach.getHistory.useQuery(
    { conversationId: activeConversationId || undefined }, 
    { enabled: isAuthenticated }
  );
  const { data: knowledge, refetch: refetchKnowledge } = trpc.aiCoach.getKnowledge.useQuery(undefined, { enabled: isAuthenticated });
  const { data: settings } = trpc.notifications.getSettings.useQuery(undefined, { enabled: isAuthenticated });
  const { data: profile } = trpc.userAccount.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  
  const createConvMutation = trpc.aiCoach.createConversation.useMutation();
  const deleteConvMutation = trpc.aiCoach.deleteConversation.useMutation();
  const renameConvMutation = trpc.aiCoach.renameConversation.useMutation();
  const deleteKnowledgeMutation = trpc.aiCoach.deleteKnowledge.useMutation();
  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation();

  useEffect(() => {
    if (history) {
      const mapped = history.flatMap(h => [
        { role: "user" as const, content: h.message },
        { role: "assistant" as const, content: h.response || "" }
      ]);
      
      // Only set messages from history if we haven't manually added NEW ones 
      // or if we just switched conversations
      setMessages(prev => {
         // Simple check: if prev has more messages than history * 2, keep prev
         if (prev.length > mapped.length && activeConversationId) return prev;
         return mapped.length > 0 ? mapped : [
           { role: "assistant", content: t('ai.welcome_back') }
         ];
      });
    }
  }, [history, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string = input) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: message }]);
    if (message === input) setInput("");

    try {
      const response = await chatMutation.mutateAsync({ 
        message, 
        conversationId: activeConversationId || undefined 
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
      
      if (!activeConversationId) {
        setActiveConversationId(response.conversationId ?? null);
        refetchConversations();
      }

      if (response.learnedSomething) {
        toast.info(t('ai.learned'));
        refetchKnowledge();
      }

      if (response.actionsCount > 0) {
        utils.study.getSchedule.invalidate();
        setMessages(prev => [...prev, { role: "assistant", content: t('ai.synced') }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: t('ai.error') }]);
    }
  };

  const handleNewChat = async () => {
    try {
      const newConv = await createConvMutation.mutateAsync();
      setActiveConversationId(newConv.id);
      setMessages([]);
      refetchConversations();
      toast.success(t('ai.new_thread'));
    } catch (error) {
      toast.error(t('ai.error_new'));
    }
  };

  const handleDeleteConv = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConvMutation.mutateAsync({ id });
      if (activeConversationId === id) setActiveConversationId(null);
      refetchConversations();
      toast.success(t('ai.purged'));
    } catch (error) {
      toast.error(t('ai.error_purge'));
    }
  };

  const handleRenameConv = async (id: number) => {
    if (!editingTitle.trim()) return;
    try {
      await renameConvMutation.mutateAsync({ id, title: editingTitle });
      setEditingConversationId(null);
      refetchConversations();
      toast.success(t('ai.renamed'));
    } catch (error) {
      toast.error(t('ai.error_rename'));
    }
  };

  const updateAISetting = async (key: string, value: string) => {
    try {
      await updateSettingsMutation.mutateAsync({ [key]: value });
      toast.success(t('ai.updated'));
      utils.notifications.getSettings.invalidate();
    } catch (error) {
      toast.error(t('ai.error_update'));
    }
  };

  const deleteFact = async (id: number) => {
      try {
          await deleteKnowledgeMutation.mutateAsync({ id });
          toast.success(t('ai.memory_removed'));
          refetchKnowledge();
      } catch (error) {
          toast.error(t('ai.error_remove'));
      }
  };

  const quickCommands = [
    { label: t('ai.study_night'), icon: Moon, text: "I study best at night" },
    { label: t('ai.exam'), icon: AlertTriangle, text: "I have an exam in 3 days!" },
    { label: t('ai.easier'), icon: Feather, text: "Make the schedule easier" },
    { label: t('ai.weekend'), icon: Dumbbell, text: "Heavier sessions on weekends" },
    { label: t('ai.review'), icon: RotateCcw, text: "Add more review sessions" },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto pt-44 pb-20 px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar: Conversations */}
            <div className="hidden lg:flex flex-col gap-6">
                <Button 
                    onClick={handleNewChat}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl py-6 shadow-xl shadow-purple-500/20 gap-2 border-none"
                    disabled={createConvMutation.isPending}
                >
                    {createConvMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {t('ai.new')}
                </Button>

                <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-4 flex-1 flex flex-col min-h-[500px]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 px-4 mb-4">{t('ai.history')}</h3>
                    <div className="space-y-1 overflow-y-auto max-h-[600px] scrollbar-hide">
                        {conversations?.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => {
                                    if (editingConversationId !== conv.id) {
                                        setActiveConversationId(conv.id);
                                    }
                                }}
                                className={cn(
                                    "group relative p-4 rounded-2xl cursor-pointer transition-all border",
                                    activeConversationId === conv.id 
                                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                                        : "bg-transparent border-white/0 hover:bg-white/5 text-foreground/50 hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <MessageCircle className="w-4 h-4 shrink-0" />
                                    {editingConversationId === conv.id ? (
                                        <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                                            <input 
                                                autoFocus
                                                value={editingTitle}
                                                onChange={e => setEditingTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleRenameConv(conv.id)}
                                                className="bg-background/50 border border-border rounded-lg px-2 py-1 text-[10px] w-full focus:outline-none focus:border-purple-500"
                                            />
                                            <button onClick={() => handleRenameConv(conv.id)} className="p-1 hover:text-white">
                                                <Check className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setEditingConversationId(null)} className="p-1 hover:text-white">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold truncate pr-12">{conv.title}</span>
                                    )}
                                </div>
                                
                                {editingConversationId !== conv.id && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingConversationId(conv.id);
                                                setEditingTitle(conv.title);
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteConv(conv.id, e)}
                                            className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle: Chat Area */}
            <div className="lg:col-span-2 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden flex flex-col h-[750px] shadow-2xl shadow-purple-500/5"
                >
                    {/* Chat Header */}
                    <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">{t('ai.title')}</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('ai.online')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Training Center Trigger */}
                        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="relative group border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-2xl px-4 py-6">
                                    <Brain className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                                    <span className="font-bold uppercase tracking-wider text-xs">{t('ai.training')}</span>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-card/90 backdrop-blur-2xl border-border/50 text-foreground rounded-3xl shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                                            <Brain className="w-6 h-6 text-white" />
                                        </div>
                                        ZED TRAINING CENTER
                                    </DialogTitle>
                                    <DialogDescription className="text-foreground/50">
                                        Manage ZED's permanent memory and core personality protocols.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    {/* Personality Config */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                            <Settings2 className="w-4 h-4" />
                                            Personality Core
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'friendly', label: 'Friendly Buddy', icon: Sparkles, desc: 'Empathetic and humorous' },
                                                { id: 'strict', label: 'Strict Mentor', icon: Target, desc: 'Direct, firm, and disciplined' },
                                                { id: 'scientific', label: 'Scientific', icon: Zap, desc: 'Neuro-efficiency focused' }
                                            ].map((tone) => (
                                                <button
                                                    key={tone.id}
                                                    onClick={() => updateAISetting('aiTone', tone.id)}
                                                    className={cn(
                                                        "flex items-start gap-4 p-4 rounded-2xl transition-all border text-left",
                                                        settings?.aiTone === tone.id 
                                                            ? "bg-purple-500/20 border-purple-500/50" 
                                                            : "bg-white/5 border-border/50 hover:bg-white/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        settings?.aiTone === tone.id ? "bg-purple-500 text-white" : "bg-white/5 text-foreground/40"
                                                    )}>
                                                        <tone.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold">{tone.label}</div>
                                                        <div className="text-[10px] text-foreground/40">{tone.desc}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 pt-4">
                                            <Globe className="w-4 h-4" />
                                            Language Protocol
                                        </h3>
                                        <div className="flex gap-2">
                                            {['Bilingual', 'Arabic', 'English'].map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => updateAISetting('aiLanguage', lang.toLowerCase())}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl border text-xs font-bold transition-all",
                                                        settings?.aiLanguage === lang.toLowerCase()
                                                            ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                                            : "bg-white/5 border-border/50 hover:bg-white/10 text-foreground/40"
                                                    )}
                                                >
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Knowledge Feed */}
                                    <div className="flex flex-col h-full max-h-[400px]">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-4">
                                            <Sparkles className="w-4 h-4" />
                                            Active Neural Facts
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                            {knowledge && knowledge.length > 0 ? (
                                                knowledge.map((k: any) => (
                                                    <div 
                                                        key={k.id}
                                                        className="group p-4 bg-white/5 border border-border/50 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="text-[10px] uppercase font-bold text-indigo-400/50 mb-1">{k.category}</div>
                                                            <div className="text-xs text-foreground/80 leading-relaxed font-medium">{k.content}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => deleteFact(k.id)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all text-foreground/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                                                    <Brain className="w-12 h-12 mb-4" />
                                                    <p className="text-sm font-bold">Neural Bank Empty</p>
                                                    <p className="text-[10px]">Chat with ZED more to build internal memory.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "flex max-w-[85%] flex-col gap-2",
                                        msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        msg.role === 'user' 
                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-purple-500/20" 
                                            : "bg-white/5 border border-border text-foreground/90 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {chatMutation.isPending && (
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {t('ai.syncing')}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-white/5 border-t border-border/50">
                        <div className="relative group">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={t('ai.input')}
                                className="w-full bg-background/50 border border-border rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-foreground/20"
                            />
                            <button 
                                onClick={() => handleSendMessage()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right: Sidebar Info */}
            <div className="space-y-6">
                {/* Chat History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card/30 backdrop-blur-xl border border-border/50 p-6 rounded-3xl"
                >
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {t('ai.recent')}
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {isHistoryLoading ? (
                            <div className="py-4 text-center text-xs text-foreground/20">Loading memories...</div>
                        ) : history && history.length > 0 ? (
                            history.slice(0, 5).map((h) => (
                                <div
                                    key={h.id}
                                    className="p-3 rounded-xl bg-white/5 border border-border/50 hover:border-purple-500/20 transition-all text-left cursor-default"
                                >
                                    <p className="text-[10px] text-foreground/40 mb-1 line-clamp-1">{h.message}</p>
                                    <p className="text-xs text-foreground/70 line-clamp-1">{h.response}</p>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-xs text-foreground/20">{t('ai.no_history')}</div>
                        )}
                    </div>
                </motion.div>

                {/* Points Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 p-8 rounded-3xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-lg font-bold mb-1">{t('ai.knowledge')}</h3>
                        <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            {profile?.xp || 0}
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                <span className="text-foreground/40">Level {profile?.level || 1}</span>
                                <span className="text-purple-400">Next: {((profile?.level || 1) * 1000)} pts</span>
                            </div>
                            <div className="h-2 bg-background/40 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(profile?.xp || 0) % 1000 / 10}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <Target className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-400/5 rotate-12" />
                </motion.div>
            </div>
        </div>
      </main>
    </div>
  );
}
