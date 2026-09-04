'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Trophy, Zap, Clock, ArrowRight, ArrowUpRight,
  TrendingUp, Target, Activity, ChevronLeft, ChevronRight,
  User, Star, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserRankBadge } from '@/components/user-rank-badge';
import { DailyQuestsWidget } from '@/components/daily-quests-widget';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { calculateLevelFromXP, getRankTitle } from '@/lib/xp';
import { useAccount } from 'wagmi';

const DEMO_USER = {
  username: 'OracleHunter',
  xp: 1340,
  totalPredictions: 28,
  wins: 19,
};

const ACTIVE_PREDICTIONS = [
  {
    id: 'pred-a1',
    eventId: 'evt-101',
    eventTitle: 'Somnia Network mainnet achieves >300k TPS',
    choice: 'YES' as const,
    stakeAmount: '100 STT',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 17 + 1000 * 60 * 42).toISOString(),
    yesProbability: 74,
    category: 'crypto',
  },
  {
    id: 'pred-a2',
    eventId: 'evt-102',
    eventTitle: 'AI Hedge Agent manages >$10M TVL across EVM pools',
    choice: 'NO' as const,
    stakeAmount: '75 STT',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 47 + 1000 * 60 * 15).toISOString(),
    yesProbability: 62,
    category: 'crypto',
  },
  {
    id: 'pred-a3',
    eventId: 'evt-103',
    eventTitle: 'Real Madrid scores in both halves — Champions League QF',
    choice: 'YES' as const,
    stakeAmount: '50 STT',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 7 + 1000 * 60 * 30).toISOString(),
    yesProbability: 53,
    category: 'sports',
  },
];

const TRENDING_EVENTS = [
  {
    id: 'evt-101',
    title: 'Somnia Network mainnet achieves >300k TPS in public stress test',
    category: 'crypto',
    totalPool: '84,500 STT',
    participants: 342,
    yesProbability: 74,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    trend: '+12%',
  },
  {
    id: 'evt-102',
    title: 'Autonomous AI Hedge Agent manages over $10M TVL across EVM pools',
    category: 'crypto',
    totalPool: '128,900 STT',
    participants: 519,
    yesProbability: 62,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    trend: '+8%',
  },
  {
    id: 'evt-103',
    title: 'Champions League QF: Cyber Real Madrid scores in both halves',
    category: 'sports',
    totalPool: '41,200 STT',
    participants: 210,
    yesProbability: 53,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    trend: '+21%',
  },
  {
    id: 'evt-104',
    title: 'US Federal Reserve cuts interest rates 50bps at September FOMC',
    category: 'politics',
    totalPool: '96,700 STT',
    participants: 431,
    yesProbability: 38,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    trend: '+5%',
  },
  {
    id: 'evt-105',
    title: 'ETH price exceeds $5,000 before end of Q3 2026',
    category: 'crypto',
    totalPool: '213,400 STT',
    participants: 874,
    yesProbability: 44,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    trend: '+33%',
  },
];

function XPProgressBar({ xp }: { xp: number }) {
  const level = calculateLevelFromXP(xp);
  const rank = getRankTitle(level);

  const xpForLevel = (lv: number) => (lv - 1) * (lv - 1) * 100;
  const xpCurrentLevel = xpForLevel(level);
  const xpNextLevel = xpForLevel(level + 1);
  const progress = Math.min(100, Math.round(((xp - xpCurrentLevel) / (xpNextLevel - xpCurrentLevel)) * 100));
  const xpToNext = xpNextLevel - xp;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono font-black text-black">
        <span>Level {level} → {level + 1}</span>
        <span>{xp.toLocaleString()} XP</span>
      </div>
      <div className="w-full h-4 bg-white rounded-sm border-3 border-black p-[2px] shadow-[2px_2px_0px_#000000]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full rounded-sm bg-[#00FF66] border-r-2 border-black"
        />
      </div>
      <div className="flex justify-between text-[11px] font-mono font-black text-slate-800">
        <span>{progress}% TO LEVEL {level + 1}</span>
        <span>{xpToNext.toLocaleString()} XP NEEDED</span>
      </div>
    </div>
  );
}

function useCountdown(deadlineIso: string) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = new Date(deadlineIso).getTime() - now;
  if (diff <= 0) return 'Settled';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m.toString().padStart(2, '0')}m`;
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

function CountdownBadge({ deadline }: { deadline: string }) {
  const label = useCountdown(deadline);
  const diff = new Date(deadline).getTime() - Date.now();
  const urgent = diff < 1000 * 60 * 60 * 6;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-mono font-black px-2 py-0.5 rounded-sm border-2 border-black ${urgent ? 'bg-[#FF3EA5] text-white' : 'bg-[#00F0FF] text-black'}`}>
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}

function TrendingCarousel() {
  const [index, setIndex] = React.useState(0);
  const visibleCount = 3;
  const maxIndex = TRENDING_EVENTS.length - visibleCount;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));
  const visible = TRENDING_EVENTS.slice(index, index + visibleCount);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-black" />
          <h2 className="text-base font-black font-mono text-black uppercase tracking-widest">
            Trending Prediction Markets
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={index === 0}
            className="h-8 w-8 rounded-sm border-2 border-black bg-white flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000000] hover:bg-[#F5FF00] disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono font-black text-black">{index + 1}–{Math.min(index + visibleCount, TRENDING_EVENTS.length)} of {TRENDING_EVENTS.length}</span>
          <button
            onClick={next}
            disabled={index >= maxIndex}
            className="h-8 w-8 rounded-sm border-2 border-black bg-white flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000000] hover:bg-[#F5FF00] disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/events/${event.id}`}>
                <Card className="border-3 border-black bg-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-sm border-2 border-black bg-[#00F0FF] text-black">
                        {event.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono font-black text-black bg-[#00FF66] border-2 border-black px-2 py-0.5 rounded-sm">
                        {event.trend}
                      </span>
                    </div>

                    <p className="text-sm font-black text-black leading-snug line-clamp-2 uppercase">
                      {event.title}
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-black text-black">
                        <span>YES {event.yesProbability}%</span>
                        <span>NO {100 - event.yesProbability}%</span>
                      </div>
                      <div className="w-full h-3 bg-white rounded-sm border-2 border-black flex overflow-hidden">
                        <div
                          style={{ width: `${event.yesProbability}%` }}
                          className="bg-[#00FF66] h-full border-r-2 border-black"
                        />
                        <div
                          style={{ width: `${100 - event.yesProbability}%` }}
                          className="bg-[#FF3EA5] h-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-800">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.participants}
                      </span>
                      <span>{event.totalPool}</span>
                      <CountdownBadge deadline={event.deadline} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address } = useAccount();

  const xp = DEMO_USER.xp;
  const level = calculateLevelFromXP(xp);
  const rank = getRankTitle(level);
  const wins = DEMO_USER.wins;
  const total = DEMO_USER.totalPredictions;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const displayName = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : DEMO_USER.username;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FFFDF0] text-black overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-sm bg-[#8A2BE2] border-3 border-black flex items-center justify-center text-[#F5FF00] shadow-[3px_3px_0px_#000000]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black tracking-tight text-xl uppercase text-black">
                ORACLEQUEST
              </span>
              <span className="text-[10px] block font-mono font-extrabold text-slate-700 tracking-wider">
                MISSION CONTROL
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {[
              { href: '/dashboard', label: 'Dashboard', active: true },
              { href: '/events', label: 'Arena' },
              { href: '/leaderboard', label: 'Rankings' },
              { href: '/history', label: 'History' },
              { href: '/profile', label: 'Profile' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-mono font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000000] ${
                  link.active
                    ? 'bg-[#F5FF00] text-black'
                    : 'bg-white text-black hover:bg-[#FAF8F5]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-sm border-2 border-black bg-white flex items-center justify-center text-black shadow-[2px_2px_0px_#000000] hover:bg-[#F5FF00] cursor-pointer">
              <Bell className="h-4 w-4" />
            </button>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-sm border-3 border-black bg-white shadow-[4px_4px_0px_#000000]"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-sm bg-[#8A2BE2] border-3 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-white shrink-0">
              <User className="h-8 w-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-black tracking-tight uppercase">{displayName}</h1>
                <UserRankBadge level={level} size="sm" />
              </div>
              <p className="text-xs font-mono font-extrabold text-slate-800 mt-1">
                {total} PREDICTIONS · {winRate}% WIN RATE · +{xp.toLocaleString()} XP EARNED
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href="/events">
              <Button size="sm" className="bg-[#F5FF00] text-black font-black font-mono text-xs border-3 border-black shadow-[3px_3px_0px_#000000]">
                <Zap className="h-3.5 w-3.5 mr-1.5" /> New Prediction
              </Button>
            </Link>
            <Link href={`/profile/${address || 'demo'}`}>
              <Button size="sm" variant="outline" className="font-mono text-xs">
                <User className="h-3.5 w-3.5 mr-1.5" /> Profile
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: xp.toLocaleString(), suffix: 'XP', icon: Star, bg: 'bg-[#F5FF00]' },
            { label: 'Current Level', value: level, suffix: `/ ${rank}`, icon: Trophy, bg: 'bg-[#00F0FF]' },
            { label: 'Active Stakes', value: ACTIVE_PREDICTIONS.length, suffix: 'markets', icon: Activity, bg: 'bg-[#FF3EA5]', textColor: 'text-white' },
            { label: 'Win Rate', value: `${winRate}%`, suffix: `${wins}/${total} wins`, icon: Target, bg: 'bg-[#00FF66]' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className={`p-4 rounded-sm border-3 border-black shadow-[4px_4px_0px_#000000] ${stat.bg} ${stat.textColor || 'text-black'} flex items-center gap-3`}>
                <div className="h-10 w-10 rounded-sm border-2 border-black bg-white text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono font-black uppercase tracking-wider truncate">{stat.label}</p>
                  <p className="text-xl font-black font-mono leading-tight">{stat.value}</p>
                  <p className="text-[10px] font-mono font-black truncate">{stat.suffix}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* XP Progress + Active Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2 border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#F5FF00] border-2 border-black rounded-sm">
                  <Zap className="h-4 w-4 text-black" />
                </div>
                <CardTitle className="text-base font-mono font-black text-black uppercase tracking-widest">XP Progression</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-sm bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0px_#000000]">
                <div>
                  <p className="text-[10px] font-mono font-black text-slate-700 uppercase mb-1">Current Rank</p>
                  <UserRankBadge level={level} size="md" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono font-black text-slate-700 uppercase mb-1">Next Rank</p>
                  <UserRankBadge level={level + 1} size="sm" />
                </div>
              </div>

              <XPProgressBar xp={xp} />

              <div className="space-y-2">
                <p className="text-[10px] font-mono font-black uppercase tracking-wider text-black">Recent XP Activity</p>
                {[
                  { reason: 'Correct Prediction', amount: '+50', time: '2h ago' },
                  { reason: 'Made a Prediction', amount: '+10', time: '4h ago' },
                  { reason: 'Early Research Bonus', amount: '+5', time: '4h ago' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono font-bold text-black border-b border-slate-200 pb-1">
                    <span>{log.reason}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-black font-black bg-[#00FF66] px-1.5 py-0.5 rounded-sm border border-black">{log.amount} XP</span>
                      <span className="text-[10px] text-slate-600">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-[#FF3EA5] text-white border-2 border-black rounded-sm">
                    <Activity className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-mono font-black text-black uppercase tracking-widest">Active Stakes</CardTitle>
                </div>
                <Link href="/history">
                  <Button variant="outline" size="sm" className="text-xs font-mono font-black">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription className="text-xs font-bold text-slate-700">Your open positions with live settlement countdowns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACTIVE_PREDICTIONS.map((pred) => (
                <Link key={pred.id} href={`/events/${pred.eventId}`}>
                  <div className="flex items-start justify-between p-3.5 rounded-sm bg-[#FFFDF0] border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] transition-all cursor-pointer">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                      <p className="text-xs font-black text-black leading-snug line-clamp-2 uppercase">
                        {pred.eventTitle}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-sm border-2 border-black bg-[#00F0FF] text-black">
                          {pred.category.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-sm border-2 border-black ${
                          pred.choice === 'YES'
                            ? 'bg-[#00FF66] text-black'
                            : 'bg-[#FF3EA5] text-white'
                        }`}>
                          {pred.choice}
                        </span>
                        <span className="text-[10px] font-mono font-black text-slate-800">
                          {pred.stakeAmount}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <CountdownBadge deadline={pred.deadline} />
                      <div className="text-[10px] font-mono font-black text-black">
                        {pred.yesProbability}% YES
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Daily Quests */}
        <DailyQuestsWidget />

        {/* Trending Events Carousel */}
        <div className="p-6 rounded-sm border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
          <TrendingCarousel />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST MISSION CONTROL — SOMNIA SHANNON NETWORK</span>
          </div>
          <div className="flex gap-5 text-black font-black">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/events" className="hover:underline">Events</Link>
            <Link href="/leaderboard" className="hover:underline">Rankings</Link>
            <Link href="/history" className="hover:underline">History</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

