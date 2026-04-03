import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Play, Pause, RotateCcw, 
  Brain, BookOpen, Lightbulb, MessageSquare, 
  CheckCircle, AlertCircle, Timer, 
  Send, Loader2, X, Zap, Map, Sparkles, ArrowLeft, Layout
} from "lucide-react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuizValidation } from "@/components/QuizValidation";
import { OctopusCelebration } from "@/components/OctopusCelebration";

type StudyMethod = "pomodoro" | "52/17" | "feynman" | "spaced" | "custom";

const STUDY_METHODS = [
  { id: "pomodoro", title: "Pomodoro Technique", desc: "25 min focus + 5 min break.", icon: Timer, work: 25, break: 5 },
  { id: "52/17", title: "52/17 Rule", desc: "52 min work + 17 min break.", icon: Brain, work: 52, break: 17 },
  { id: "feynman", title: "Feynman Technique", desc: "Study, then explain clearly.", icon: Lightbulb, work: 20, break: 5 },
  { id: "custom", title: "Custom Session", desc: "Set your own pace.", icon: Layout, work: 45, break: 10 },
];

export default function StudySessionPage() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/study-session/:id");
  const sessionId = parseInt(params?.id || "0");

  const { data: session, isLoading } = trpc.study.getSession.useQuery({ sessionId }, { enabled: !!sessionId && isAuthenticated });
  const { data: fullSchedule } = trpc.study.getSchedule.useQuery(undefined, { enabled: isAuthenticated });
  const updateStatus = trpc.study.updateSession.useMutation();

  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [activeTool, setActiveTool] = useState<"content" | "mindmap" | "flashcards" | "quiz" | "notes" | "feynman">("content");
  const [distractions, setDistractions] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [showStartCelebration, setShowStartCelebration] = useState(false);
  const [showLevelCelebration, setShowLevelCelebration] = useState(false);

  const generateQuizMutation = trpc.aiCoach.generateQuiz.useMutation();
  const generateFlashCardsMutation = trpc.aiCoach.generateFlashCards.useMutation();
  const generateMindMapMutation = trpc.aiCoach.generateMindMap.useMutation();
  const generateSummaryMutation = trpc.aiCoach.generateSummary.useMutation();
  const chatMutation = trpc.aiCoach.chat.useMutation();

  const [flashCards, setFlashCards] = useState<any[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (blockTimeLeft > 0) {
          setBlockTimeLeft(prev => prev - 1);
        } else {
          setIsActive(false);
          toast.success("Phase complete!");
        }
        if (!isBreak) setTotalSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, blockTimeLeft, isBreak]);

  const startSession = (m: any) => {
    setMethod(m.id);
    setBlockTimeLeft(m.work * 60);
    setShowStartCelebration(true);
    setTimeout(() => {
      setShowStartCelebration(false);
      setIsActive(true);
    }, 3000);
  };

  const handleToolSwitch = async (tool: any) => {
    setActiveTool(tool);
    const content = session?.material?.content || session?.subject || "";
    const subject = session?.subject || "Topic";

    if (tool === 'flashcards' && flashCards.length === 0) {
      const res = await generateFlashCardsMutation.mutateAsync({ content, subject });
      setFlashCards(res.cards);
    }
    if (tool === 'mindmap' && !mindMapData) {
      const res = await generateMindMapMutation.mutateAsync({ content, subject });
      setMindMapData(res.mindmap);
    }
    if (tool === 'content' && !summaryData) {
      const res = await generateSummaryMutation.mutateAsync({ content, subject });
      setSummaryData(res.summary);
    }
  };

  const initiateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setIsQuizActive(true);
    try {
      const res = await generateQuizMutation.mutateAsync({
        sessionId,
        content: session?.material.content || session?.subject || "Academic Material"
      });
      setQuizData(res.quiz);
    } catch (e) {
      toast.error("ZED failed to generate quiz. Using fallback.");
      setQuizData([{ question: `Explain ${session?.subject}`, options: ["Ok", "No", "Maybe", "Yes"], answer: "Ok" }]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isAuthenticated) return null;
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-purple-500" /></div>;

  if (!method) {
    return (
      <div className="min-h-screen bg-black pt-32 px-6 flex flex-col items-center">
        <h1 className="text-4xl font-black mb-12">Start Your <span className="text-purple-500">Neural Sync</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
          {STUDY_METHODS.map(m => (
            <button key={m.id} onClick={() => startSession(m)} className="p-8 bg-white/5 border border-white/10 rounded-3xl text-left hover:border-purple-500 transition-all">
              <m.icon className="w-8 h-8 mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2">{m.title}</h3>
              <p className="text-sm text-white/40">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setMethod(null)}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="font-bold">{session?.subject}</h2>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-2xl text-purple-400">{formatTime(blockTimeLeft)}</span>
          <Button size="icon" variant="ghost" onClick={() => setIsActive(!isActive)}>{isActive ? <Pause /> : <Play />}</Button>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl">
          {[
            { id: 'content', icon: BookOpen },
            { id: 'mindmap', icon: Brain },
            { id: 'flashcards', icon: Layout },
            { id: 'quiz', icon: CheckCircle }
          ].map(t => (
            <button key={t.id} onClick={() => handleToolSwitch(t.id)} className={cn("p-2 rounded-xl transition-all", activeTool === t.id ? "bg-purple-600 text-white" : "text-white/20")}>
              <t.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <Button onClick={initiateQuiz} className="bg-purple-600">End Session</Button>
      </header>

      <main className="flex-1 p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTool === 'content' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
              <h1 className="text-4xl font-bold">{session?.subject}</h1>
              <p className="text-lg text-white/60 leading-relaxed">{session?.material?.content || "No detailed material found."}</p>
            </motion.div>
          )}

          {activeTool === 'flashcards' && (
            <div className="flex flex-col items-center gap-8 py-20">
              {flashCards.length > 0 ? (
                <div className="w-full max-w-lg aspect-video bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center p-12 text-center cursor-pointer" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                  <h3 className="text-2xl font-bold">{isCardFlipped ? flashCards[currentCardIdx].back : flashCards[currentCardIdx].front}</h3>
                </div>
              ) : <Loader2 className="animate-spin" />}
              <div className="flex gap-4">
                <Button onClick={() => setCurrentCardIdx(i => Math.max(0, i-1))}>Prev</Button>
                <Button onClick={() => setCurrentCardIdx(i => Math.min(flashCards.length-1, i+1))}>Next</Button>
              </div>
            </div>
          )}

          {activeTool === 'mindmap' && (
             <div className="max-w-4xl mx-auto p-12 bg-white/5 rounded-3xl text-center">
                <h2 className="text-2xl font-bold mb-8">Concept Map</h2>
                {mindMapData ? (
                  <div className="grid grid-cols-2 gap-4">
                    {mindMapData.branches?.map((b: any, i: number) => (
                      <div key={i} className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                        <h4 className="font-bold text-purple-400">{b.title}</h4>
                        <ul className="text-sm text-white/40">{b.nodes?.map((n: any, j: number) => <li key={j}>{n}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                ) : <Loader2 className="animate-spin mx-auto" />}
             </div>
          )}

          {activeTool === 'quiz' && (
            <div className="max-w-3xl mx-auto py-10 space-y-8">
              <h2 className="text-3xl font-black text-center">Subject Validation</h2>
              <Button onClick={initiateQuiz} className="w-full bg-purple-600 py-6 text-lg font-bold">Generate Topic Quiz</Button>
              {quizData.length > 0 && (
                <div className="space-y-6">
                  {quizData.map((q, i) => (
                    <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                      <h4 className="text-xl font-bold">{q.question}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options?.map((o: any, j: number) => <div key={j} className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm">{o}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <OctopusCelebration show={showStartCelebration} title="FOCUS LOCK INITIATED" subtitle="The ZED-Nexus is now analyzing your topic." />
      
      {isQuizActive && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-12">
           {isGeneratingQuiz ? (
             <div className="h-full flex flex-col items-center justify-center gap-4">
               <Loader2 className="animate-spin w-12 h-12 text-purple-500" />
               <h2 className="text-2xl font-bold">ZED IS SCANNING YOUR TOPIC...</h2>
             </div>
           ) : (
             <QuizValidation quiz={quizData} subject={session?.subject || ""} onComplete={(s) => { setIsQuizActive(false); setIsActive(false); toast.success("Session Validated!"); }} onRetry={() => setIsQuizActive(false)} />
           )}
        </div>
      )}
    </div>
  );
}
