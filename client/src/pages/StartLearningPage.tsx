import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Wand2, FileText, CheckCircle2, ChevronRight, Clock, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function StartLearningPage() {
    const [, setLocation] = useLocation();
    const [content, setContent] = useState('');
    const [days, setDays] = useState(5);
    const [hours, setHours] = useState(3);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [step, setStep] = useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const analyzeMutation = trpc.study.analyzeMaterial.useMutation();
    const uploadMaterialMutation = trpc.study.uploadMaterial.useMutation();
    const savePlanMutation = trpc.study.savePlan.useMutation({
        onSuccess: () => {
            toast.success("ZED Neural Plan Synced!");
            setLocation('/schedule');
        }
    });

    const [materialId, setMaterialId] = useState<number | null>(null);

    const analyzeSteps = [
        'Segmenting content...',
        'Extracting topics...',
        'Estimating difficulty...',
        'Calculating study time...',
        'Building daily schedule...',
        'Finalizing your plan...'
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                setContent(text);
                toast.success(`Successfully loaded ${file.name}`);
            }
        };
        reader.readAsText(file);
    };

    const handleStartAnalysis = async () => {
        if (!content.trim()) {
            toast.error("Please provide some study material first!");
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
        }, 800);

        try {
            const mat = await uploadMaterialMutation.mutateAsync({
                title: "Syllabus Analysis",
                content,
                type: "syllabus"
            });

            const { topics } = await analyzeMutation.mutateAsync({
                content,
                days,
                hoursPerDay: hours
            });

            // Transform topics into a full schedule
            const sessions: any[] = [];
            const startDate = new Date();
            let currentTopicIdx = 0;

            for (let d = 0; d < days && currentTopicIdx < topics.length; d++) {
                const scheduledDate = new Date(startDate);
                scheduledDate.setDate(startDate.getDate() + d);

                // Add 2 sessions per day for focus
                for (let s = 0; s < 2 && currentTopicIdx < topics.length; s++) {
                    const topic = topics[currentTopicIdx];
                    sessions.push({
                        subject: topic.title,
                        scheduledTime: scheduledDate.toISOString(),
                        duration: topic.duration,
                        priority: (topic.difficulty === 'hard' ? 'high' : 'medium'),
                        difficulty: topic.difficulty,
                        sessionType: 'study'
                    });
                    currentTopicIdx++;
                }
            }

            await savePlanMutation.mutateAsync({ 
                materialId: mat.id,
                sessions 
            });
        } catch (error) {
            toast.error("Failed to analyze material. Please try again.");
            setIsAnalyzing(false);
            clearInterval(interval);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        What do you want to master? ✨
                    </h1>
                    <p className="text-foreground/60 text-lg">
                        Upload your study material and let AI build your perfect plan.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!isAnalyzing ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid gap-6 md:grid-cols-1"
                        >
                            <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                                <label className="block text-sm font-medium text-foreground/70 mb-3">
                                    Paste Study Material (Syllabus, Notes, or Topics)
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-48 bg-background/50 border border-purple-500/20 rounded-2xl p-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                    placeholder="Example:&#10;Chapter 1: Quantum Physics Introduction&#10;Chapter 2: Wave Mechanics&#10;Chapter 3: Schrödinger Equation..."
                                />

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                                            Study Days
                                        </label>
                                        <input
                                            type="number"
                                            value={days}
                                            onChange={(e) => setDays(Number(e.target.value))}
                                            className="w-full bg-background/50 border border-purple-500/20 rounded-xl px-4 py-3 text-foreground"
                                            min="1" max="30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                                            Hours per Day
                                        </label>
                                        <input
                                            type="number"
                                            value={hours}
                                            onChange={(e) => setHours(Number(e.target.value))}
                                            className="w-full bg-background/50 border border-purple-500/20 rounded-xl px-4 py-3 text-foreground"
                                            min="1" max="12"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleStartAnalysis}
                                    className="w-full mt-8 py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20 group"
                                >
                                    <span className="text-lg font-bold flex items-center gap-2">
                                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Generate Study Plan
                                    </span>
                                </Button>
                            </div>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".txt,.rtf,.md,.pdf,.docx,.pptx"
                                onChange={handleFileUpload}
                            />
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-card/30 backdrop-blur-xl border border-white/5 p-8 rounded-3xl text-center group cursor-pointer hover:border-purple-500/30 transition-all"
                            >
                                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Upload Syllabus File</h3>
                                <p className="text-foreground/50 text-sm">PDF, TXT, PPTX, or DOCX (Up to 300MB)</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl text-center"
                        >
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <motion.div
                                    className="absolute inset-0 border-4 border-purple-500/20 rounded-full"
                                />
                                <motion.div
                                    className="absolute inset-0 border-4 border-t-purple-500 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-purple-400" />
                            </div>

                            <h2 className="text-2xl font-bold mb-2">LockedIn AI is Analyzing...</h2>
                            <p className="text-purple-400 font-medium animate-pulse mb-8">
                                {analyzeSteps[step]}
                            </p>

                            <div className="max-w-xs mx-auto space-y-3">
                                {analyzeSteps.map((s, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i <= step ? 'bg-purple-500' : 'bg-white/10'}`}>
                                            {i < step ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />}
                                        </div>
                                        <span className={`text-sm ${i === step ? 'text-foreground font-semibold' : i < step ? 'text-foreground/60' : 'text-foreground/30'}`}>
                                            {s}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
