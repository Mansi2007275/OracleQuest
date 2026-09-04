'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Zap,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';

interface QuestItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  isCompleted: boolean;
}

const DEFAULT_QUESTS: QuestItem[] = [
  {
    id: 'quest_predict_daily',
    title: 'Make 1 prediction today',
    description: 'Stake on any active prediction event in the arena.',
    xpReward: 20,
    icon: 'Zap',
    isCompleted: true,
  },
  {
    id: 'quest_use_ai_research',
    title: 'Use the AI research assistant',
    description: 'Inspect Bull/Bear multi-agent debate or ask a question.',
    xpReward: 15,
    icon: 'Bot',
    isCompleted: false,
  },
  {
    id: 'quest_new_category',
    title: 'Predict in a new category',
    description: 'Diversify into a category you have not staked in today.',
    xpReward: 25,
    icon: 'Compass',
    isCompleted: false,
  },
];

export function DailyQuestsWidget() {
  const { address } = useAccount();
  const effectiveUserId = address || '0x94f2...c120';
  const todayKey = new Date().toISOString().split('T')[0];

  const [quests, setQuests] = React.useState<QuestItem[]>(DEFAULT_QUESTS);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);
  const [justClaimedId, setJustClaimedId] = React.useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = React.useState<string>('00:00:00');

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);

      const diff = nextMidnight.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}h ${minutes
          .toString()
          .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    try {
      const cached = localStorage.getItem(`daily_quests_${effectiveUserId}_${todayKey}`);
      if (cached) {
        setQuests(JSON.parse(cached));
      }
    } catch (_) {}

    async function loadQuests() {
      try {
        const res = await fetch(`/api/daily-quests?userId=${effectiveUserId}&date=${todayKey}`);
        const data = await res.json();
        if (data && data.quests && data.quests.length > 0) {
          setQuests(data.quests);
          localStorage.setItem(`daily_quests_${effectiveUserId}_${todayKey}`, JSON.stringify(data.quests));
        }
      } catch (err) {
        console.warn('Using client fallback for daily quests');
      }
    }

    loadQuests();
  }, [effectiveUserId, todayKey]);

  const handleCompleteQuest = async (questId: string) => {
    setClaimingId(questId);
    try {
      await fetch('/api/daily-quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUserId, questId }),
      });

      const updated = quests.map((q) =>
        q.id === questId ? { ...q, isCompleted: true } : q
      );
      setQuests(updated);
      localStorage.setItem(`daily_quests_${effectiveUserId}_${todayKey}`, JSON.stringify(updated));

      setJustClaimedId(questId);
      setTimeout(() => setJustClaimedId(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalXpAvailable = quests.reduce((acc, q) => acc + q.xpReward, 0);
  const earnedXpToday = quests.filter((q) => q.isCompleted).reduce((acc, q) => acc + q.xpReward, 0);
  const progressPercent = Math.round((completedCount / quests.length) * 100);

  const getQuestIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot':
        return <Bot className="h-5 w-5 text-black" />;
      case 'Compass':
        return <Compass className="h-5 w-5 text-black" />;
      default:
        return <Zap className="h-5 w-5 text-black" />;
    }
  };

  return (
    <Card className="border-3 border-black bg-white shadow-[4px_4px_0px_#000000] relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-sm bg-[#F5FF00] border-2 border-black">
                <Gift className="h-5 w-5 text-black" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-black font-black uppercase tracking-tight">
                Daily Oracle Missions
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-bold text-slate-700">
              Complete daily research and staking quests to earn bonus STT-XP.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-black text-black bg-[#00F0FF] px-3 py-1.5 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000000]">
            <Clock className="h-3.5 w-3.5" />
            <span>RESETS IN:</span>
            <strong className="text-black">{timeRemaining}</strong>
          </div>
        </div>

        <div className="pt-3 space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-black">
            <span className="text-black">
              PROGRESS: {completedCount}/{quests.length} COMPLETED
            </span>
            <span className="text-black">
              +{earnedXpToday} / +{totalXpAvailable} STT-XP EARNED
            </span>
          </div>
          <div className="w-full h-4 bg-white rounded-sm border-3 border-black p-[2px] shadow-[2px_2px_0px_#000000]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-[#00FF66] border-r-2 border-black"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-sm border-3 border-black shadow-[4px_4px_0px_#000000] transition-all flex flex-col justify-between space-y-3 ${
                quest.isCompleted
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#FFFDF0] text-black'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-sm bg-white border-2 border-black shadow-[2px_2px_0px_#000000] shrink-0">
                  {getQuestIcon(quest.icon)}
                </div>
                <Badge variant="cyan" className="font-mono text-xs font-black">
                  +{quest.xpReward} XP
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className={`text-sm font-black uppercase ${quest.isCompleted ? 'line-through opacity-80' : 'text-black'}`}>
                  {quest.title}
                </h4>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {quest.description}
                </p>
              </div>

              {quest.isCompleted ? (
                <div className="flex items-center gap-1.5 text-black text-xs font-mono font-black pt-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
                  <span>CLAIMED</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleCompleteQuest(quest.id)}
                  disabled={claimingId === quest.id}
                  className="w-full h-9 text-xs font-mono font-black bg-[#F5FF00] text-black border-3 border-black shadow-[3px_3px_0px_#000000]"
                >
                  {claimingId === quest.id ? (
                    'CLAIMING...'
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>COMPLETE</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

