import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  const handleStart = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  const totalSeconds = minutes * 60 + seconds;
  const maxSeconds = 25 * 60;
  const progress = ((maxSeconds - totalSeconds) / maxSeconds) * 100;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background opacity-50" />
      </div>

      <div className="container relative z-10 text-center">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Focus Mode
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter a distraction-free zone with our Pomodoro-based focus timer.
            Stay focused, stay productive.
          </p>
        </motion.div>

        {/* Timer circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-64 h-64 mx-auto mb-12"
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 blur-xl opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Progress ring background */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(100, 100, 150, 0.2)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              strokeLinecap="round"
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-white tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400 mt-2">Focus Time</div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center mb-12"
        >
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/70 transition-all"
          >
            {isActive ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </motion.button>

          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full border border-indigo-500/50 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: '🎯', title: 'Stay Focused', desc: 'Eliminate distractions' },
            { icon: '⏱️', title: 'Pomodoro', desc: '25 min work + 5 min break' },
            { icon: '🎵', title: 'Ambient Sound', desc: 'Soothing background music' },
          ].map((tip, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm"
            >
              <div className="text-3xl mb-2">{tip.icon}</div>
              <h4 className="font-semibold text-white mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-400">{tip.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
