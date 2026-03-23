import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, MessageCircle, Loader2, Sparkles, Moon, 
  AlertTriangle, Feather, Dumbbell, RotateCcw,
  TrendingUp, Zap, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

export default function AICoachPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Welcome to LOCKEDIN! 🔒 I'm your AI coach. Ask me anything about your studies or tell me about your preferences." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const utils = trpc.useUtils();
  const chatMutation = trpc.aiCoach.chat.useMutation();
  const adjustMutation = trpc.study.adjustSchedule.useMutation({
    onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "assistant", content: `[SYSTEM LINK]: ${data.response}` }]);
        utils.study.getSchedule.invalidate();
    }
  });
  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    if (text === input) setInput("");

    try {
      // Check if it's a schedule adjustment request
      const identifiesAsAdjustment = ["easier", "harder", "exam", "review", "schedule", "plan", "time"].some(kw => text.toLowerCase().includes(kw));
      
      if (identifiesAsAdjustment) {
        await adjustMutation.mutateAsync({ message: text });
      } else {
        const response = await chatMutation.mutateAsync({ message: text });
        setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection pulse lost. Trying to reconnect..." }]);
    }
  };

  const quickCommands = [
    { label: "Study at Night", icon: Moon, text: "I study best at night" },
    { label: "Exam in 3 Days", icon: AlertTriangle, text: "I have an exam in 3 days!" },
    { label: "Make it Easier", icon: Feather, text: "Make the schedule easier" },
    { label: "Weekend Focus", icon: Dumbbell, text: "Heavier sessions on weekends" },
    { label: "More Review", icon: RotateCcw, text: "Add more review sessions" },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-6xl mx-auto pt-28 pb-20 px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Chat Area */}
            <div className="lg:col-span-2 space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl shadow-purple-500/5"
                >
                    {/* Chat Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Nex AI Coach</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Neural Link Active</span>
                                </div>
                            </div>
                        </div>
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
                                            : "bg-white/5 border border-white/10 text-foreground/90 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {chatMutation.isPending && (
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                SYNCING NEURAL NETWORK...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-white/5 border-t border-white/5">
                        <div className="relative group">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Command the AI..."
                                className="w-full bg-background/50 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-foreground/20"
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
                {/* Quick Commands */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-3xl"
                >
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Quick Commands
                    </h3>
                    <div className="space-y-2">
                        {quickCommands.map((cmd) => (
                            <button
                                key={cmd.label}
                                onClick={() => handleSendMessage(cmd.text)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all text-left group"
                            >
                                <cmd.icon className="w-4 h-4 text-foreground/30 group-hover:text-purple-400 transition-colors" />
                                <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">{cmd.label}</span>
                            </button>
                        ))}
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
                        <h3 className="text-lg font-bold mb-1">Knowledge Points</h3>
                        <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            {profile?.xp || 0}
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                <span className="text-foreground/40">Level {profile?.level || 1}</span>
                                <span className="text-purple-400">Next: {((profile?.level || 1) * 1000)} pts</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
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
