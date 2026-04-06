import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, FileText, CheckCircle2, Loader2, X, FileMinus, HardDrive } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function StartLearningPage() {
    const [, setLocation] = useLocation();
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [step, setStep] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const analyzeMutation = trpc.study.analyzeMaterial.useMutation();
    const savePlanMutation = trpc.study.savePlan.useMutation({
        onSuccess: () => {
            toast.success("10-Level Mastery Plan Generated!");
            setLocation('/schedule');
        }
    });

    const analyzeSteps = [
        'Ingesting documents...',
        'Extracting core concepts...',
        'Mapping difficulty curves...',
        'Structuring 10 Neural Levels...',
        'Compiling schedule...',
        'Finalizing Neural Link...'
    ];

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    const maxSizeMB = 300;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        
        if (files.length + newFiles.length > 3) {
            toast.error("Maximum 3 files allowed in queue.");
            return;
        }

        const newSize = totalSize + newFiles.reduce((acc, f) => acc + f.size, 0);
        if (newSize > maxSizeMB * 1024 * 1024) {
             toast.error(`Exceeds 300MB limit. Current: ${(newSize / (1024*1024)).toFixed(1)}MB`);
             return;
        }

        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartAnalysis = async () => {
        if (files.length === 0) {
            toast.error("Please upload at least one file to process.");
            return;
        }

        setIsAnalyzing(true);
        setStep(0);

        // Simulate animation steps
        const interval = setInterval(() => {
            setStep(prev => {
                if (prev < analyzeSteps.length - 1) return prev + 1;
                clearInterval(interval);
                return prev;
            });
        }, 1200);

        try {
            // Read content from files (txt parsing mainly for simulation)
            let combinedContent = "";
            for (const file of files) {
                if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
                   const text = await file.text();
                   combinedContent += `\n[File: ${file.name}]\n` + text;
                } else {
                   combinedContent += `\n[File: ${file.name}] (Binary Content - Processing via Meta-layer)`;
                }
            }

            // Fallback content if empty
            if (!combinedContent.trim() || combinedContent.length < 50) {
                combinedContent = "General logic structure and algorithms.";
            }

            const { topics } = await analyzeMutation.mutateAsync({
                content: combinedContent,
                days: 10,
                hoursPerDay: 1
            });

            // Make sure we have 10 strict tasks for 10-Level System
            let finalTopics = [...topics];
            while (finalTopics.length < 10) {
                finalTopics.push({ title: `Mastery Tier ${finalTopics.length + 1}`, duration: 60, difficulty: 'medium' });
            }
            finalTopics = finalTopics.slice(0, 10); // clamp to 10

            const sessions = finalTopics.map((topic, i) => {
                const date = new Date();
                date.setHours(date.getHours() + (i * 12)); // Spread roughly over 5 days
                return {
                    subject: `${topic.title} (Level ${i + 1})`,
                    scheduledTime: date.toISOString(),
                    duration: topic.duration || 45,
                    priority: 'high' as 'high',
                    difficulty: topic.difficulty as 'medium',
                    sessionType: 'study' as 'study'
                };
            });

            await savePlanMutation.mutateAsync({ sessions });
        } catch (error) {
            toast.error("Failed to analyze material. Neural link disrupted.");
            setIsAnalyzing(false);
            clearInterval(interval);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#09090b] overflow-hidden relative">
            {/* Background Animations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-white">
                        Neural Material Processing ✨
                    </h1>
                    <p className="text-foreground/40 text-lg font-bold uppercase tracking-widest">
                        Upload textbooks, notes, or slides. Max 3 Files. 300MB Cap.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!isAnalyzing ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="bg-white/5 border border-border/50 p-8 rounded-[3rem] shadow-2xl backdrop-blur-3xl"
                        >
                            {/* Stats Header */}
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                     <HardDrive className="w-5 h-5 text-purple-400" />
                                   </div>
                                   <div>
                                     <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">Queue Capacity</p>
                                     <p className="font-bold text-white text-lg">{files.length}/3 Files</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">Storage Payload</p>
                                   <div className="flex items-center gap-2 justify-end">
                                      <p className="font-bold text-white text-lg">{totalSizeMB}<span className="text-foreground/30">/300 MB</span></p>
                                      <div className="w-24 h-2 bg-white/10 rounded-full ml-2">
                                         <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(totalSize / (maxSizeMB * 1024 * 1024)) * 100}%` }} />
                                      </div>
                                   </div>
                                </div>
                            </div>

                            {/* Dropzone */}
                            {files.length < 3 && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 rounded-3xl p-12 text-center transition-all cursor-pointer group mb-8"
                                >
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".pdf,.txt,.md,.doc,.docx"
                                    />
                                    <div className="w-20 h-20 bg-purple-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                                        <Upload className="w-10 h-10 text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Drag & Drop or Browse</h3>
                                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">PDF, TXT, DOCX Supported</p>
                                </div>
                            )}

                            {/* File Queue */}
                            <AnimatePresence>
                               {files.length > 0 && (
                                  <div className="space-y-3 mb-8">
                                    {files.map((file, idx) => (
                                       <motion.div 
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, scale: 0.9 }}
                                          key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
                                       >
                                          <div className="flex items-center gap-4 truncate">
                                             <FileText className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                                             <div className="truncate">
                                                <p className="text-white font-bold text-sm truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-foreground/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                             </div>
                                          </div>
                                          <button onClick={() => removeFile(idx)} className="p-2 hover:bg-red-500/20 rounded-xl text-foreground/40 hover:text-red-400 transition-all">
                                             <X className="w-5 h-5" />
                                          </button>
                                       </motion.div>
                                    ))}
                                  </div>
                               )}
                            </AnimatePresence>

                            <Button
                                onClick={handleStartAnalysis}
                                disabled={files.length === 0}
                                className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg disabled:opacity-50 transition-all"
                            >
                                Process to 10-Level System
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-border p-12 rounded-[3rem] shadow-2xl text-center backdrop-blur-3xl"
                        >
                            <div className="relative w-32 h-32 mx-auto mb-10">
                                <motion.div
                                    className="absolute inset-0 border-[6px] border-purple-500/10 rounded-[3rem]"
                                />
                                <motion.div
                                    className="absolute inset-0 border-[6px] border-t-purple-500 rounded-[3rem]"
                                    animate={{ rotate: 360, borderRadius: ['3rem', '4rem', '3rem'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-purple-400 animate-spin" />
                            </div>

                            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">AI Processing Material</h2>
                            <p className="text-purple-400 font-bold animate-pulse mb-10 tracking-widest text-sm uppercase">
                                {analyzeSteps[step]}
                            </p>

                            <div className="max-w-sm mx-auto space-y-4">
                                {analyzeSteps.map((s, i) => (
                                    <motion.div 
                                      initial={false}
                                      animate={{
                                        scale: i === step ? 1.05 : 1,
                                        opacity: i <= step ? 1 : 0.3
                                      }}
                                      key={i} className="flex items-center gap-4"
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${i <= step ? 'bg-purple-500 shadow-purple-500/20' : 'bg-white/5'}`}>
                                            {i < step ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-white/20 rounded-full" />}
                                        </div>
                                        <span className={`text-sm tracking-wide ${i === step ? 'text-white font-black' : i < step ? 'text-foreground/60 font-bold' : 'text-foreground/30 font-medium'}`}>
                                            {s}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

