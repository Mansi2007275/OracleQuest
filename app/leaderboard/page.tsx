'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Sparkles, 
  ArrowLeft, 
  Crown, 
  User, 
  ArrowUpRight,
  Search,
  Percent,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRankBadge } from '@/components/user-rank-badge';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { useAccount } from 'wagmi';

interface LeaderboardUser {
  rankPosition?: number;
  walletAddress: string;
  username: string;
  level: number;
  xp: number;
  weeklyXp: number;
  winRate: number;
  totalPredictions: number;
  totalEarnings: string;
}

type SortTab = 'all_time' | 'this_week' | 'accuracy';

const BASE_LEADERBOARD: LeaderboardUser[] = [
  {
    walletAddress: '0x94f27a819c120bc7',
    username: 'QuantumProphet',
    level: 14,
    xp: 19800,
    weeklyXp: 3450,
    winRate: 92,
    totalPredictions: 142,
    totalEarnings: '48,250 STT',
  },
  {
    walletAddress: '0x31a892df48e100c3',
    username: 'CyberSeer_Alpha',
    level: 11,
    xp: 12400,
    weeklyXp: 4100,
    winRate: 88,
    totalPredictions: 110,
    totalEarnings: '34,100 STT',
  },
  {
    walletAddress: '0x88c4b120df99ac15',
    username: 'IceDBSwarm',
    level: 9,
    xp: 8200,
    weeklyXp: 1800,
    winRate: 84,
    totalPredictions: 85,
    totalEarnings: '21,800 STT',
  },
  {
    walletAddress: '0x7e10bb4288cc1091',
    username: 'MatrixStrategist',
    level: 8,
    xp: 6500,
    weeklyXp: 2900,
    winRate: 79,
    totalPredictions: 72,
    totalEarnings: '15,400 STT',
  },
  {
    walletAddress: '0x55aa33ff8890bb41',
    username: 'SomniaHunter',
    level: 6,
    xp: 3800,
    weeklyXp: 950,
    winRate: 95,
    totalPredictions: 50,
    totalEarnings: '9,200 STT',
  },
  {
    walletAddress: '0x12bb99ee4400cc18',
    username: 'OracleNovice',
    level: 3,
    xp: 850,
    weeklyXp: 850,
    winRate: 68,
    totalPredictions: 24,
    totalEarnings: '2,400 STT',
  },
];

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = React.useState<SortTab>('all_time');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const rankedPlayers = React.useMemo(() => {
    const sorted = [...BASE_LEADERBOARD].sort((a, b) => {
      if (activeTab === 'all_time') return b.xp - a.xp;
      if (activeTab === 'this_week') return b.weeklyXp - a.weeklyXp;
      if (activeTab === 'accuracy') return b.winRate - a.winRate;
      return 0;
    });

    return sorted.map((player, idx) => ({
      ...player,
      rankPosition: idx + 1,
    }));
  }, [activeTab]);

  const filteredPlayers = rankedPlayers.filter((player) => {
    const q = searchQuery.toLowerCase();
    return (
      player.username.toLowerCase().includes(q) ||
      player.walletAddress.toLowerCase().includes(q)
    );
  });

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
            <Link href="/history">
              <Button variant="purple" size="sm" className="font-mono text-xs">
                My Predictions
              </Button>
            </Link>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        
        {/* Title & Pool Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-sm border-3 border-black bg-[#F5FF00] text-black shadow-[4px_4px_0px_#000000]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border-2 border-black rounded-sm shadow-[2px_2px_0px_#000000]">
                <Trophy className="h-7 w-7 text-black" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight">
                Global Oracle Leaderboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 max-w-xl">
              Competitive standings on Somnia Network. Ascend from Novice to supreme Oracle, rack up XP, and claim weekly rewards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-sm border-3 border-black text-xs font-mono font-black shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-2 text-black">
              <Sparkles className="h-4 w-4 text-black" />
              <span>SEASON 1 REWARDS:</span>
            </div>
            <strong className="text-black bg-[#00FF66] px-2.5 py-1 rounded-sm border-2 border-black text-sm font-black">250,000 STT POOL</strong>
          </div>
        </div>

        {/* Controls: Sort Tabs & Predictor Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 p-1.5 rounded-sm bg-white border-3 border-black shadow-[3px_3px_0px_#000000] w-fit">
            <button
              onClick={() => setActiveTab('all_time')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                activeTab === 'all_time'
                  ? 'bg-[#F5FF00] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'text-black hover:bg-[#FAF8F5]'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>All Time XP</span>
            </button>

            <button
              onClick={() => setActiveTab('this_week')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                activeTab === 'this_week'
                  ? 'bg-[#F5FF00] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'text-black hover:bg-[#FAF8F5]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>This Week</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                activeTab === 'accuracy'
                  ? 'bg-[#F5FF00] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'text-black hover:bg-[#FAF8F5]'
              }`}
            >
              <Percent className="h-3.5 w-3.5" />
              <span>Accuracy %</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-700" />
            <Input
              type="text"
              placeholder="Search predictor or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-3 border-black text-black placeholder:text-slate-500 font-bold font-mono text-xs shadow-[3px_3px_0px_#000000]"
            />
          </div>
        </div>

        {/* Leaderboard Table Card */}
        <Card className="border-3 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b-3 border-black bg-[#F5FF00] text-black font-black">
                  <th className="py-4 px-6">RANK</th>
                  <th className="py-4 px-6">PREDICTOR</th>
                  <th className="py-4 px-6">TIER & LEVEL</th>
                  <th className="py-4 px-6">
                    {activeTab === 'accuracy' ? 'ACCURACY (PRIORITY)' : 'ACCURACY'}
                  </th>
                  <th className="py-4 px-6">
                    {activeTab === 'this_week' ? 'WEEKLY XP' : 'TOTAL XP'}
                  </th>
                  <th className="py-4 px-6">EARNINGS</th>
                  <th className="py-4 px-6 text-right">PROFILE</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                <AnimatePresence>
                  {filteredPlayers.map((player) => {
                    const isConnectedUser =
                      address && player.walletAddress.toLowerCase() === address.toLowerCase();

                    return (
                      <motion.tr
                        key={player.walletAddress}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`transition-colors ${
                          isConnectedUser
                            ? 'bg-[#00F0FF] text-black font-black'
                            : 'hover:bg-[#FFFDF0]'
                        }`}
                      >
                        <td className="py-4 px-6 font-black">
                          <div className="flex items-center gap-2">
                            {player.rankPosition === 1 && (
                              <Crown className="h-4 w-4 text-black fill-current shrink-0" />
                            )}
                            {player.rankPosition === 2 && (
                              <Crown className="h-4 w-4 text-slate-700 shrink-0" />
                            )}
                            {player.rankPosition === 3 && (
                              <Crown className="h-4 w-4 text-amber-800 shrink-0" />
                            )}
                            <span className="font-black text-sm text-black">
                              #{player.rankPosition}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-sm bg-white border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000000] shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-black text-black text-sm font-sans">
                                  {player.username}
                                </p>
                                {isConnectedUser && (
                                  <Badge variant="cyan" className="text-[9px] py-0 px-1 font-mono">
                                    YOU
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-600">
                                {player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <UserRankBadge level={player.level} size="sm" />
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black bg-[#00FF66] px-2 py-0.5 rounded-sm border border-black text-xs">
                              {player.winRate}%
                            </span>
                            <span className="text-[10px] font-bold text-slate-700">
                              ({player.totalPredictions} bets)
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {activeTab === 'this_week' ? (
                            <span className="text-black font-black">
                              +{player.weeklyXp.toLocaleString()} XP
                            </span>
                          ) : (
                            <span className="text-black font-black">
                              +{player.xp.toLocaleString()} XP
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-black font-black">{player.totalEarnings}</span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Link href={`/profile/${player.walletAddress}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs font-mono font-black"
                            >
                              View <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST GLOBAL LEADERBOARD & REPUTATION MATRIX</span>
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

