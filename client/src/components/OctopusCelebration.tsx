import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

interface OctopusCelebrationProps {
    show: boolean;
    onClose?: () => void;
    title?: string;
    subtitle?: string;
    buttonText?: string;
}

export function OctopusCelebration({ 
    show, 
    onClose, 
    title = "LEVEL COMPLETE!", 
    subtitle = "Your neural network is evolving. The Octopus is pleased with your progress.",
    buttonText = "CONTINUE ASCENSION"
}: OctopusCelebrationProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="relative w-full max-w-lg mb-8"
                    >
                        <img 
                            src="/images/octopus/octopus_main.png" 
                            alt="Octopus Celebration" 
                            className="w-full drop-shadow-[0_0_50px_rgba(168,85,247,0.5)]"
                            onError={(e) => {
                                (e.target as any).src = "https://placehold.co/600x400/1a1a1a/purple?text=Octopus+Party!";
                            }}
                        />
                        
                        <div className="absolute inset-0 overflow-visible pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ 
                                        x: '50%', y: '50%', 
                                        scale: 0, 
                                        rotate: 0,
                                        backgroundColor: ['#22d3ee', '#a855f7', '#fbbf24'][Math.floor(Math.random() * 3)]
                                    }}
                                    animate={{ 
                                        x: `${Math.random() * 200 - 100}%`, 
                                        y: `${Math.random() * 200 - 100}%`, 
                                        scale: Math.random() + 0.5,
                                        rotate: 360,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
                                    className="absolute w-4 h-4 rounded-sm"
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.h2 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-black mb-4 tracking-tighter uppercase italic text-white"
                    >
                        {title.includes("!") ? (
                            <>
                                <span className="text-cyan-400">{title.split("!")[0]}</span>
                                <span className="text-purple-400">!</span>
                            </>
                        ) : (
                            <span className="text-cyan-400">{title}</span>
                        )}
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.5 }}
                        className="text-white/60 text-xl mb-8 max-w-md mx-auto"
                    >
                        {subtitle}
                    </motion.p>

                    {onClose && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button 
                                onClick={onClose}
                                className="px-12 py-8 text-xl font-black bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                            >
                                {buttonText}
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
