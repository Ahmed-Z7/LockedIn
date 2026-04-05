import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Sparkles, Zap, Shield, Flame } from 'lucide-react';

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Original', color: 'border-transparent' },
  { id: 'octopus', name: 'ZED Octopus', color: 'border-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]', icon: '🐙' },
  { id: 'lockedin', name: 'LOCKEDIN Elite', color: 'border-cyan-400', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]', icon: '🔒' },
  { id: 'golden', name: 'Golden Mind', color: 'border-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]', icon: '✨' },
  { id: 'neon', name: 'Neon Focus', color: 'border-pink-500', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.5)]', icon: '🔥' },
];

export const STATUS_PRESETS = [
  { id: 1, text: "Focus Mode On – Ana LOCKEDIN", type: 'active' },
  { id: 2, text: "Study First – Drama Ba3deen... Stay LOCKEDIN", type: 'funny' },
  { id: 3, text: "Focus Kicks In... the Moment You're LOCKEDIN", type: 'hype' },
  { id: 4, text: "Your Focus Starts – When You’re LOCKEDIN", type: 'zen' },
  { id: 5, text: "Stop Scrolling – Stay Locked In", type: 'warn' },
];

interface AvatarWithFrameProps {
  src?: string | null;
  username?: string;
  frameId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({ src, username, frameId = 'none', size = 'md', className }) => {
  const frame = AVATAR_FRAMES.find(f => f.id === frameId) || AVATAR_FRAMES[0];
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44'
  };

  return (
    <div className={cn("relative group shrink-0", sizeClasses[size], className)}>
      {/* Frame Glow */}
      {frame.glow && (
        <div className={cn("absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse", frame.glow)} />
      )}
      
      {/* The Actual Frame */}
      <div className={cn(
        "absolute inset-0 rounded-full border-[3px] z-10 transition-all duration-500",
        frame.color,
        frame.glow
      )}>
          {frame.icon && (
              <div className="absolute -top-2 -right-2 bg-background border border-border rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-xl">
                  {frame.icon}
              </div>
          )}
      </div>

      {/* Avatar Content */}
      <div className="w-full h-full rounded-full bg-card/80 backdrop-blur-md overflow-hidden relative z-0 border border-border/50">
        {src ? (
          <img src={src} alt={username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/20 font-black uppercase text-2xl">
            {username?.[0] || '?'}
          </div>
        )}
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    return (
        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-border backdrop-blur-md flex items-center gap-3 group hover:border-purple-500/50 transition-all cursor-default">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-xs font-bold text-foreground/60 group-hover:text-white transition-colors">{status}</span>
        </div>
    );
};
