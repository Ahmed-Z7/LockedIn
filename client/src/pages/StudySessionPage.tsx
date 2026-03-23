import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Play, Pause, RotateCcw, SkipForward, 
  Brain, BookOpen, Lightbulb, MessageSquare, 
  CheckCircle, AlertCircle, Timer, Gamepad2, 
  ArrowLeft, Layout, Sparkles, ChevronRight,
  FlipCw, Send, Loader2, X
} from "lucide-react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StudyMethod = "pomodoro" | "52/17" | "feynman" | "spaced" | "custom";

const STUDY_METHODS = [
  { id: "pomodoro", title: "Pomodoro Technique", desc: "25 min focus + 5 min break. Perfect for intense sprints.", icon: Timer, work: 25, break: 5 },
  { id: "52/17", title: "52/17 Rule", desc: "52 min work + 17 min break. The ultimate productivity ratio.", icon: Brain, work: 52, break: 17 },
  { id: "feynman", title: "Feynman Technique", desc: "Study for 20 mins, then explain clearly.", icon: Lightbulb, work: 20, break: 5 },
  { id: "custom", title: "Custom Session", desc: "Set your own pace and rhythm.", icon: Layout, work: 45, break: 10 },
];

export default function StudySessionPage() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/study-session/:id");
  const sessionId = parseInt(params?.id || "0");

  // Data
  const { data: session, isLoading } = trpc.study.getSession.useQuery({ sessionId }, { enabled: !!sessionId && isAuthenticated });
  const updateStatus = trpc.study.updateSession.useMutation();

  // State
  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
  const [activeTool, setActiveTool] = useState<"content" | "flashcards" | "quiz" | "notes" | "feynman">("content");
  const [isCompleted, setIsCompleted] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', content: string}>>([]);
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  
  const chatMutation = trpc.aiCoach.chat.useMutation();
  
  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (!isBreak) setTotalWorkTime(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const handlePhaseComplete = () => {
    setIsActive(false);
    if (!isBreak) {
      toast.success("Focus block complete! Time for a break.");
      setIsBreak(true);
      const selectedMethod = STUDY_METHODS.find(m => m.id === method);
      setTimeLeft((selectedMethod?.break || 5) * 60);
      initializeMemoryGame();
      if (method === 'feynman') setActiveTool('feynman');
    } else {
      toast("Break over. Back to focus mode!", { icon: "🔥" });
      setIsBreak(false);
      const selectedMethod = STUDY_METHODS.find(m => m.id === method);
      setTimeLeft((selectedMethod?.work || 25) * 60);
    }
    // Auto-resume? Let's keep it manual for user control
  };

  const startSession = (m: any) => {
    setMethod(m.id as StudyMethod);
    setTimeLeft(m.work * 60);
    setIsActive(true);
    setChatMessages([{ role: 'ai', content: `Neural link established for ${m.title}. I've prepared your materials. Ready to begin?` }]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    try {
        const res = await chatMutation.mutateAsync({ message: msg });
        setChatMessages(prev => [...prev, { role: 'ai', content: res.response }]);
    } catch (e) {
        toast.error("Telemetry link unstable.");
    }
  };

  const initializeMemoryGame = () => {
      const concepts = ["Neural", "Nexus", "Focus", "Sync"];
      const cards = [...concepts, ...concepts]
        .sort(() => Math.random() - 0.5)
        .map((content, id) => ({ id, content }));
      setMemoryCards(cards);
      setFlippedCards([]);
      setMatchedPairs([]);
  };

  const handleCardClick = (id: number) => {
      if (flippedCards.length === 2 || flippedCards.includes(id) || matchedPairs.includes(id)) return;
      
      const newFlipped = [...flippedCards, id];
      setFlippedCards(newFlipped);

      if (newFlipped.length === 2) {
          const [c1, c2] = newFlipped;
          if (memoryCards[c1].content === memoryCards[c2].content) {
              setMatchedPairs([...matchedPairs, c1, c2]);
              setFlippedCards([]);
              if (matchedPairs.length + 2 === memoryCards.length) {
                  toast.success("Cognitive harmony achieved!");
              }
          } else {
              setTimeout(() => setFlippedCards([]), 1000);
          }
      }
  };

  if (!isAuthenticated) return null;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  // Render Method Selection
  if (!method) {
    return (
      <div className="min-h-screen bg-background pt-32 px-6 flex flex-col items-center">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> System Initialization
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter">Choose Your <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Study Catalyst</span></h1>
          <p className="text-foreground/40 text-lg">Select a neural-optimized methodology to begin your session.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
          {STUDY_METHODS.map((m, idx) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => startSession(m)}
              className="group relative bg-card/30 backdrop-blur-xl border border-white/5 hover:border-purple-500/40 p-8 rounded-[2rem] text-left transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all">
                <m.icon className="w-8 h-8 text-foreground/20 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors tracking-tight">{m.title}</h3>
              <p className="text-foreground/40 text-sm leading-relaxed mb-6">{m.desc}</p>
              <div className="flex items-center gap-3 text-xs font-bold text-foreground/20 uppercase tracking-widest">
                <span>{m.work}m Focus</span>
                <span className="w-1 h-1 rounded-full bg-foreground/10" />
                <span>{m.break}m Recovery</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Session UI (To be expanded in next steps)
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0" onClick={() => setMethod(null)}>
                    <ArrowLeft className="w-5 h-5 text-foreground/40" />
                </Button>
                <div>
                    <h2 className="font-bold tracking-tight text-lg">{session?.subject}</h2>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-foreground/30 font-black">
                        <div className={cn("w-2 h-2 rounded-full", isBreak ? "bg-blue-400 animate-pulse" : "bg-purple-500 animate-[pulse_1.5s_infinite]")} />
                        {isBreak ? "Refueling Circuit" : "Neural Focus Active"}
                    </div>
                </div>
            </div>

            {/* Timer Display Quick View */}
            {!isBreak && (
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-black font-mono tracking-tighter text-purple-400">
                            {formatTime(timeLeft)}
                        </div>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl"
                            onClick={() => setIsActive(!isActive)}
                        >
                            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                    </div>
                    {isActive && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 animate-pulse">
                            <Zap className="w-2.5 h-2.5 fill-emerald-400" /> Focus Mode Active
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mr-4">
                    {[
                        { id: 'content', icon: BookOpen },
                        { id: 'flashcards', icon: Layout },
                        { id: 'quiz', icon: CheckCircle },
                        { id: 'feynman', icon: Lightbulb },
                        { id: 'notes', icon: MessageSquare }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTool(tab.id as any)}
                            className={cn(
                                "p-2 rounded-xl transition-all",
                                activeTool === tab.id ? "bg-purple-600 text-white shadow-lg" : "text-foreground/30 hover:text-foreground/60"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
                <Button 
                    variant="outline" 
                    className="border-white/5 bg-white/5 hover:bg-white/10 rounded-xl px-6 text-xs font-bold"
                    onClick={() => {
                        updateStatus.mutate({ sessionId, completed: 1 });
                        setIsCompleted(true);
                        toast.success("Session synchronized with network.");
                    }}
                >
                    End Session
                </Button>
            </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
            {/* Left: Content Area */}
            <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {activeTool === 'content' && (
                        <motion.div 
                            key="content"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black tracking-tight">{session?.subject}</h1>
                                <div className="flex items-center gap-4 text-sm text-foreground/40 pb-8 border-b border-white/5">
                                    <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full font-bold">12 Topics</span>
                                    <span>2.4k Words Analyzed</span>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <section className="space-y-6">
                                    <h2 className="text-2xl font-bold flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                        Fundamentals
                                    </h2>
                                    <p className="text-lg leading-relaxed text-foreground/70 font-medium">
                                        {session?.material?.content || "No material content available for this session. Use the Nex Focus AI to generate a summary."}
                                    </p>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {activeTool === 'flashcards' && (
                        <motion.div 
                            key="flashcards"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col items-center justify-center gap-8"
                        >
                            <div className="w-full max-w-lg aspect-[4/3] relative perspective-1000 group cursor-pointer">
                                <div className="w-full h-full p-12 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-700 group-hover:[transform:rotateY(180deg)] [transform-style:preserve-3d]">
                                    {/* Front */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 [backface-visibility:hidden]">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-2xl font-bold leading-tight">What is the core principle of the Feynman Technique?</h3>
                                        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-foreground/20">Hover to Reveal</p>
                                    </div>
                                    {/* Back */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                        <p className="text-xl font-medium leading-relaxed text-purple-400">
                                            The core principle is to explain a concept in simple terms, as if you were teaching it to a child, to identify gaps in your own understanding.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" className="h-14 w-14 rounded-full border-white/5 bg-white/5"><RotateCcw className="w-5 h-5" /></Button>
                                <Button className="h-14 px-8 rounded-full bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/20">Next Card</Button>
                            </div>
                        </motion.div>
                    )}

                    {activeTool === 'feynman' && (
                        <motion.div 
                            key="feynman"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto h-full flex flex-col justify-center gap-8"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                                    <Lightbulb className="w-8 h-8" />
                                </div>
                                <h1 className="text-4xl font-black">Explain to a Child</h1>
                                <p className="text-foreground/40 text-lg">Type a simple explanation of what you just learned. Nex AI will grade your clarity.</p>
                            </div>
                            <textarea 
                                className="w-full h-64 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-lg focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-foreground/10"
                                placeholder="Once upon a time, there was this concept called..."
                            />
                            <Button className="h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg shadow-xl shadow-amber-500/10">Analyze Clarity</Button>
                        </motion.div>
                    )}

                    {activeTool === 'notes' && (
                        <motion.div 
                            key="notes"
                            className="max-w-4xl mx-auto h-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">Personal Insights</h2>
                                <Button variant="ghost" className="text-foreground/30 hover:text-foreground">Save as PDF</Button>
                            </div>
                            <textarea 
                                className="w-full h-[600px] bg-transparent border-none text-xl leading-relaxed focus:outline-none resize-none scrollbar-hide"
                                placeholder="Begin typing your mental uplink..."
                            />
                        </motion.div>
                    )}

                    {activeTool === 'quiz' && (
                        <motion.div 
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="space-y-4 text-center">
                                <h2 className="text-3xl font-black">Knowledge Check</h2>
                                <p className="text-foreground/40 font-medium">Topic: Core Fundamentals - {session?.subject}</p>
                            </div>

                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                                <div className="p-10 border-b border-white/5 bg-white/5">
                                    <h3 className="text-xl font-bold leading-tight">Which of the following best describes the 'Spaced Repetition' technique?</h3>
                                </div>
                                <div className="p-8 space-y-3">
                                    {[
                                        "Studying for 10 hours straight before an exam.",
                                        "Reviewing content at increasing intervals over time.",
                                        "Explaining a topic to a child using simple terms.",
                                        "Drawing a visual map of all related concepts."
                                    ].map((opt, i) => (
                                        <button 
                                            key={i}
                                            className="w-full text-left p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all font-medium text-foreground/70 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black group-hover:bg-purple-500 group-hover:text-white">{String.fromCharCode(65 + i)}</div>
                                                {opt}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-foreground/20 px-4">
                                <span>Question 1 of 10</span>
                                <span className="text-purple-400">Current Score: 0/100</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right: AI Panel */}
            <aside className="w-[400px] border-l border-white/5 bg-background/50 backdrop-blur-xl flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm">Nex Focus Assist</h3>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatMessages.map((m, i) => (
                        <div key={i} className={cn(
                            "p-4 rounded-2xl text-xs leading-relaxed",
                            m.role === 'ai' ? "bg-white/5 border border-white/5 text-foreground/70" : "bg-purple-600 ml-auto max-w-[80%] text-white"
                        )}>
                            {m.content}
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5">
                    <div className="relative group">
                        <input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Request context..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-xs focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={chatMutation.isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {chatMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </aside>
        </main>

        {/* Break Mode Overlay */}
        <AnimatePresence>
            {isBreak && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center"
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-500/10 rounded-full blur-[120px]" />
                    </div>
                    <div className="relative z-10 w-full max-w-4xl">
                        <div className="text-8xl font-black font-mono tracking-tighter text-blue-400 mb-8 animate-[pulse_2s_infinite]">
                            {formatTime(timeLeft)}
                        </div>
                        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Refueling Neural Network</h2>
                        <p className="text-foreground/40 text-lg mb-12">Break is active. Let's recharge with a quick cognition challenge.</p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                            <div className="space-y-6 text-left">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-blue-400">
                                    <Gamepad2 className="w-6 h-6" /> Cognitive Memory Match
                                </h3>
                                <p className="text-foreground/40 text-lg leading-relaxed">
                                    Match the core concepts of your current session to maintain neural alignment during rest.
                                </p>
                                <div className="text-xs font-black uppercase tracking-widest text-foreground/20"> Pairs Matched: {matchedPairs.length / 2} / 4 </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto lg:mx-0">
                                {memoryCards.map((card) => (
                                    <button
                                        key={card.id}
                                        onClick={() => handleCardClick(card.id)}
                                        className={cn(
                                            "aspect-square rounded-2xl border transition-all duration-500 flex items-center justify-center font-black text-[10px] uppercase tracking-tighter",
                                            flippedCards.includes(card.id) || matchedPairs.includes(card.id)
                                                ? "bg-blue-500/20 border-blue-500 text-blue-400 [transform:rotateY(0deg)]"
                                                : "bg-white/5 border-white/10 text-transparent [transform:rotateY(180deg)] hover:border-white/20"
                                        )}
                                    >
                                        {(flippedCards.includes(card.id) || matchedPairs.includes(card.id)) ? card.content : "?"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={() => setTimeLeft(0)} variant="outline" className="border-white/5 text-foreground/30 hover:text-foreground">
                            Skip Break
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Completion Modal */}
        <AnimatePresence>
            {isCompleted && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-card border border-white/10 rounded-[3rem] p-12 max-w-lg w-full text-center shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight uppercase">Session Locked</h2>
                        <p className="text-foreground/40 mb-10 font-medium">Neural pathways reinforced successfully.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-3xl font-black text-purple-400">+{Math.round(totalWorkTime / 60) * 10}</div>
                                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">XP Gained</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-3xl font-black text-blue-400">{Math.round(totalWorkTime / 60)}m</div>
                                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">Focus Time</div>
                            </div>
                        </div>

                        <Button 
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full h-16 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-xl shadow-purple-500/20"
                        >
                            Return to Command
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
