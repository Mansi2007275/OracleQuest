'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Cpu, 
  Zap, 
  Award, 
  CheckCircle2, 
  X, 
  PartyPopper 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnlockedAchievement } from '@/lib/achievements';

interface AchievementCelebrationModalProps {
  achievement: UnlockedAchievement | null;
  onClose: () => void;
}

export function AchievementCelebrationModal({
  achievement,
  onClose,
}: AchievementCelebrationModalProps) {
  if (!achievement) return null;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="h-10 w-10 text-black" />;
      case 'Cpu':
        return <Cpu className="h-10 w-10 text-black" />;
      case 'Zap':
        return <Zap className="h-10 w-10 text-black" />;
      case 'Award':
        return <Award className="h-10 w-10 text-black" />;
      case 'Trophy':
        return <Trophy className="h-10 w-10 text-black" />;
      default:
        return <Sparkles className="h-10 w-10 text-black" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-sm border-4 border-black bg-white text-black p-8 text-center shadow-[8px_8px_0px_#000000] overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-sm border-2 border-black bg-white text-black hover:bg-[#FF3EA5] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border-2 border-black bg-[#F5FF00] text-black font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
              <PartyPopper className="h-4 w-4" />
              <span>ACHIEVEMENT UNLOCKED!</span>
            </div>

            <div className="mx-auto h-24 w-24 rounded-sm bg-[#00F0FF] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000]">
              {getBadgeIcon(achievement.icon)}
            </div>

            <div className="space-y-1.5 pt-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                {achievement.name}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed font-sans">
                {achievement.description}
              </p>
            </div>

            {achievement.xpBonus > 0 && (
              <div className="inline-block p-2.5 px-4 rounded-sm bg-[#00FF66] border-2 border-black text-xs font-mono font-black text-black shadow-[2px_2px_0px_#000000]">
                <span>REWARD BONUS: </span>
                <strong className="text-black font-black text-sm">
                  +{achievement.xpBonus} STT-XP
                </strong>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={onClose}
                className="w-full h-12 bg-[#8A2BE2] text-white border-3 border-black font-black font-mono tracking-wider shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000]"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                CLAIM BADGE &amp; CONTINUE
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

