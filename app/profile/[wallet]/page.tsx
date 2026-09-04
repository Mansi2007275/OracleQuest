'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Copy,
  Flame,
  Medal,
  Sparkles,
  Trophy,
  User,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserRankBadge } from '@/components/user-rank-badge';
import { calculateLevelFromXP, getRankTitle, UserRank } from '@/lib/xp';
import { useAccount } from 'wagmi';

interface CategoryAccuracyData {
  category: string;
  accuracy: number;
  total: number;
  color: string;
}

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  earnedAt: string | null;
  color: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const rawWallet = (params?.wallet as string) || '0x94f27a819c120bc7';
  const { address: connectedAddress } = useAccount();

  const [copied, setCopied] = React.useState(false);

  const isOwner = connectedAddress?.toLowerCase() === rawWallet?.toLowerCase();
  const userXp = 1450;
  const userLevel = calculateLevelFromXP(userXp);
  const userRank: UserRank = getRankTitle(userLevel);

  const currentLevelFloorXp = Math.pow(userLevel - 1, 2) * 100;
  const nextLevelTargetXp = Math.pow(userLevel, 2) * 100;
  const xpInCurrentLevel = userXp - currentLevelFloorXp;
  const xpSpanForLevel = nextLevelTargetXp - currentLevelFloorXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / (xpSpanForLevel || 1)) * 100));

  const categoryData: CategoryAccuracyData[] = [
    { category: 'Crypto', accuracy: 88, total: 32, color: '#00F0FF' },
    { category: 'Sports', accuracy: 74, total: 19, color: '#00FF66' },
    { category: 'Weather', accuracy: 82, total: 11, color: '#F5FF00' },
    { category: 'Politics', accuracy: 65, total: 14, color: '#FF3EA5' },
  ];

  const achievements: AchievementItem[] = [
    {
      id: 'ach-1',
      name: 'Genesis Oracle',
      description: 'Participated in the first public testnet cohort on Somnia Network.',
      icon: Sparkles,
      earnedAt: 'Aug 2026',
      color: 'bg-[#00F0FF] text-black border-3 border-black shadow-[3px_3px_0px_#000000]',
    },
    {
      id: 'ach-2',
      name: 'Early Scout',
      description: 'Placed 5 predictions more than 24 hours before market resolution.',
      icon: Zap,
      earnedAt: 'Aug 2026',
      color: 'bg-[#F5FF00] text-black border-3 border-black shadow-[3px_3px_0px_#000000]',
    },
    {
      id: 'ach-3',
      name: '5x Win Streak',
      description: 'Successfully predicted 5 consecutive outcomes without a loss.',
      icon: Flame,
      earnedAt: 'Aug 2026',
      color: 'bg-[#FF3EA5] text-white border-3 border-black shadow-[3px_3px_0px_#000000]',
    },
    {
      id: 'ach-4',
      name: 'Quantum Seer',
      description: 'Attained Level 4 (Analyst Rank) through verifiable on-chain precision.',
      icon: Trophy,
      earnedAt: 'Sep 2026',
      color: 'bg-[#8A2BE2] text-white border-3 border-black shadow-[3px_3px_0px_#000000]',
    },
    {
      id: 'ach-5',
      name: 'High Roller',
      description: 'Accumulated over 10,000 STT in cumulative winning payouts.',
      icon: Medal,
      earnedAt: null,
      color: 'bg-slate-200 text-slate-500 border-2 border-black opacity-60',
    },
    {
      id: 'ach-6',
      name: 'Grand Oracle',
      description: 'Reach Level 13+ and unlock the supreme Oracle master rank.',
      icon: Award,
      earnedAt: null,
      color: 'bg-slate-200 text-slate-500 border-2 border-black opacity-60',
    },
  ];

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(rawWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FFFDF0] text-black">
      {/* Top Neubrutalist Navigation */}
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black hover:underline group">
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ARENA</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <Button variant="secondary" size="sm" className="font-mono text-xs">
                <Trophy className="h-3.5 w-3.5 mr-1 text-black" /> Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Profile Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        {/* Profile Card Header */}
        <div className="p-8 rounded-sm border-3 border-black bg-white shadow-[6px_6px_0px_#000000] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-sm bg-[#8A2BE2] border-3 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-white">
                <User className="h-12 w-12" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#F5FF00] border-2 border-black text-black font-mono text-[11px] font-black px-2 py-0.5 rounded-sm shadow-[2px_2px_0px_#000000]">
                Lv.{userLevel}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight">
                  {rawWallet.slice(0, 8)}...{rawWallet.slice(-6)}
                </h1>
                <UserRankBadge rank={userRank} level={userLevel} size="lg" />
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-mono font-black text-slate-800">
                <span>Joined Somnia Network Aug 2026</span>
                <button
                  onClick={handleCopyWallet}
                  className="inline-flex items-center gap-1 text-black hover:underline cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'COPIED!' : 'COPY ADDRESS'}</span>
                </button>
              </div>

              {/* XP Progress Bar */}
              <div className="pt-4 max-w-xl space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-black text-black">
                  <span>XP: {userXp} / {nextLevelTargetXp} STT-XP</span>
                  <span>NEXT: LV.{userLevel + 1} ({nextLevelTargetXp - userXp} XP REMAINING)</span>
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
            </div>

            {/* Stats Badges */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3 rounded-sm bg-[#FFFDF0] border-2 border-black text-center min-w-[110px] shadow-[2px_2px_0px_#000000]">
                <span className="text-[10px] font-mono font-black text-slate-700 block">QUESTS</span>
                <strong className="text-xl font-black text-black font-mono">76</strong>
              </div>
              <div className="p-3 rounded-sm bg-[#00FF66] border-2 border-black text-center min-w-[110px] shadow-[2px_2px_0px_#000000]">
                <span className="text-[10px] font-mono font-black text-black block">WIN RATE</span>
                <strong className="text-xl font-black text-black font-mono">81.5%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recharts Flat Bar Chart */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-black" />
                    <CardTitle className="text-xl font-black uppercase text-black">Category-Wise Accuracy</CardTitle>
                  </div>
                  <Badge variant="cyan" className="font-mono text-[10px]">
                    VERIFIED ACCURACY
                  </Badge>
                </div>
                <CardDescription className="text-xs font-bold text-slate-700">
                  Historical win percentages broken down by market domain.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="category"
                        stroke="#000000"
                        fontSize={12}
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                      />
                      <YAxis
                        stroke="#000000"
                        fontSize={12}
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        unit="%"
                        domain={[0, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CategoryAccuracyData;
                            return (
                              <div className="p-3 rounded-sm bg-white border-3 border-black font-mono font-black text-xs shadow-[3px_3px_0px_#000000] text-black">
                                <p className="font-black text-sm uppercase mb-1">{data.category}</p>
                                <p>ACCURACY: {data.accuracy}%</p>
                                <p className="text-slate-700">TOTAL BETS: {data.total}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="accuracy" radius={[0, 0, 0, 0]} stroke="#000000" strokeWidth={2}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-black text-black uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-black" /> Earned Achievement Badges
              </h2>
              <span className="text-xs font-mono font-black text-black">
                {achievements.filter((a) => a.earnedAt !== null).length}/{achievements.length} UNLOCKED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                const isEarned = ach.earnedAt !== null;

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-sm transition-all ${ach.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-sm bg-white border-2 border-black shrink-0 text-black">
                        <Icon className="h-4 w-4" />
                      </div>
                      {isEarned ? (
                        <Badge variant="green" className="text-[9px]">
                          {ach.earnedAt}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px]">
                          LOCKED
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase leading-snug">{ach.name}</h4>
                      <p className="text-[10px] font-bold leading-tight mt-1 opacity-90">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST ON-CHAIN IDENTITY & CREDENTIAL MATRIX</span>
          </div>
          <div className="flex gap-6 text-black font-black">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/events" className="hover:underline">Events</Link>
            <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

