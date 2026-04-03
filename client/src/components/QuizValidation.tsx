import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  RotateCcw, 
  Lock, 
  Unlock,
  BrainCircuit,
  Zap,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { OctopusCelebration } from './OctopusCelebration';

interface Question {
  question: string;
  options: string[];
  answer: string;
  type: string;
  weakness?: string;
}

interface QuizValidationProps {
  quiz: Question[];
  onComplete: (score: number) => void;
  onRetry: () => void;
  subject: string;
}

export function QuizValidation({ quiz, onComplete, onRetry, subject }: QuizValidationProps) {
  if (!quiz || quiz.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Neural Link Failure</h2>
        <p className="text-white/40 text-sm max-w-xs">ZED was unable to synthesize the exam matrix. Please try again later.</p>
        <Button onClick={onRetry} className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">Close Telemetry</Button>
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{ question: string; isCorrect: boolean; weakness?: string }[]>([]);

  const currentQuestion = quiz[currentIndex];
  const progress = (currentIndex / quiz.length) * 100;
  const passingScore = 80;
  const finalScore = Math.round((score / quiz.length) * 100);
  const isPassed = finalScore >= passingScore;

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    
    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) setScore(s => s + 1);

    setAnswers([...answers, { 
      question: currentQuestion.question, 
      isCorrect, 
      weakness: isCorrect ? undefined : currentQuestion.weakness 
    }]);

    setTimeout(() => {
      if (currentIndex < quiz.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        setShowResults(true);
      }
    }, 800);
  };

  if (showResults) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        <div className={cn(
          "rounded-3xl p-8 text-center border mb-8",
          isPassed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg",
            isPassed ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          )}>
            {isPassed ? <Unlock size={40} /> : <Lock size={40} />}
          </div>

          <h2 className="text-4xl font-black mb-2 tracking-tight">
            {isPassed ? "Knowledge Verified!" : "Review Required"}
          </h2>
          <p className={cn(
            "text-lg font-bold mb-6",
            isPassed ? "text-emerald-400" : "text-red-400"
          )}>
            SCORE: {finalScore}% • {isPassed ? "FOCUS LOCK DISABLED" : "FOCUS LOCK ACTIVE"}
          </p>

          {!isPassed && (
            <Card className="bg-black/40 border-red-500/30 p-6 text-left mb-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-red-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white mb-2">AI Weakness Report:</h4>
                  <div className="space-y-4">
                    {answers.filter(a => !a.isCorrect).map((a, i) => (
                      <p key={i} className="text-sm text-zinc-400 leading-relaxed">
                        <span className="text-zinc-200 font-medium">Topic: {a.question}</span>
                        <br />
                        {a.weakness || "Re-study this concept to achieve mastery."}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {isPassed && (
            <div className="flex justify-center gap-4 mb-2">
                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold border border-emerald-500/30 flex items-center gap-2">
                    <Zap size={16} fill="currentColor" />
                    +450 XP Awarded
                </div>
                <div className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl text-sm font-bold border border-indigo-500/30">
                    Neural Sync Optimized
                </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="h-14 rounded-2xl bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
          >
            <RotateCcw className="mr-2" size={20} />
            Retry Session
          </Button>
          <Button 
            disabled={!isPassed}
            onClick={() => onComplete(finalScore)}
            className={cn(
                "h-14 rounded-2xl text-lg font-bold transition-all duration-300",
                isPassed 
                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20" 
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {isPassed ? "Continue Mission" : "LOCKED"}
            <ChevronRight className="ml-2" size={24} />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20 mb-3">
            <BrainCircuit size={14} />
            AI KNOWLEDGE VALIDATION
          </div>
          <div className="text-zinc-400 font-bold text-sm tracking-widest uppercase">
            Question {currentIndex + 1} <span className="text-zinc-600">/ {quiz.length}</span>
          </div>
        </div>
        <div className="text-right">
            <div className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-tighter">Current mastery</div>
            <div className="text-2xl font-black text-white">{Math.round((score / quiz.length) * 100)}%</div>
        </div>
      </div>

      <h2 className="text-3xl font-black text-white mb-8 leading-tight tracking-tight">
        {currentQuestion.question}
      </h2>

      <div className="mb-10">
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQuestion.answer;
          
          let stateStyles = "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300";
          if (isSelected) {
            stateStyles = isCorrect 
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
              : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
          }

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionSelect(option)}
              disabled={!!selectedOption}
              className={cn(
                "w-full p-6 text-left rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-between gap-4",
                stateStyles
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border",
                    isSelected ? "bg-transparent border-current" : "bg-white/5 border-white/10 text-zinc-500"
                )}>
                    {String.fromCharCode(65 + i)}
                </div>
                {option}
              </div>
              
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-4 text-zinc-500 italic text-sm">
        <AlertCircle size={16} />
        You must score at least 80% to disable the focus lock and complete the session.
      </div>
    </div>
  );
}
