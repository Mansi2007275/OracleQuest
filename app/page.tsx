'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Trophy, 
  Wallet, 
  Zap, 
  ArrowRight, 
  Search, 
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRankBadge } from '@/components/user-rank-badge';
import { DailyQuestsWidget } from '@/components/daily-quests-widget';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { useAccount } from 'wagmi';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FFFDF0] text-black">
      {/* Top Neubrutalism Header */}
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-sm bg-[#8A2BE2] border-3 border-black flex items-center justify-center text-[#F5FF00] shadow-[3px_3px_0px_#000000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight uppercase text-black">
                  ORACLEQUEST
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase font-mono bg-[#F5FF00] text-black border-2 border-black shadow-[2px_2px_0px_#000000]">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] block font-mono font-extrabold text-slate-700 tracking-wider">
                SOMNIA NEUBRUTALIST ORACLE PROTOCOL
              </span>
            </div>
          </Link>

          {/* Quick Stats Ticker (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono font-black">
            <div className="flex items-center gap-2 bg-[#00F0FF] text-black px-3 py-1.5 rounded-sm border-3 border-black shadow-[3px_3px_0px_#000000]">
              <span className="h-2.5 w-2.5 rounded-full bg-black animate-ping" />
              <span>SOMNIA TPS:</span>
              <strong className="text-black">400k+</strong>
            </div>
            <div className="flex items-center gap-2 bg-[#FF3EA5] text-white px-3 py-1.5 rounded-sm border-3 border-black shadow-[3px_3px_0px_#000000]">
              <Activity className="h-4 w-4 text-white" />
              <span>ORACLE SPEED:</span>
              <strong className="text-white">Sub-Second</strong>
            </div>
          </div>

          {/* Navigation Links & Wallet Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/events">
              <Button variant="outline" size="sm" className="font-mono text-xs">
                Events Arena
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="secondary" size="sm" className="font-mono text-xs">
                Leaderboard
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="purple" size="sm" className="font-mono text-xs">
                My Predictions
              </Button>
            </Link>

            {isConnected && address && (
              <Link href={`/profile/${address}`}>
                <UserRankBadge level={4} size="sm" className="hidden sm:inline-flex" />
              </Link>
            )}

            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full flex-1 flex flex-col justify-center">
        {/* Top Hero Pill */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border-3 border-black bg-[#F5FF00] text-black text-xs font-mono font-black uppercase shadow-[4px_4px_0px_#000000]"
          >
            <Sparkles className="h-4 w-4 text-black" />
            <span>Autonomous Multi-Agent AI Prediction Matrix</span>
          </motion.div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-[1.1]"
          >
            <span className="bg-[#8A2BE2] text-white px-3 py-1 border-3 border-black inline-block shadow-[5px_5px_0px_#000000] rotate-[-1deg] mr-2">
              Research.
            </span>{' '}
            <span className="bg-[#FF3EA5] text-white px-3 py-1 border-3 border-black inline-block shadow-[5px_5px_0px_#000000] rotate-[1deg] mr-2">
              Predict.
            </span>{' '}
            <span className="bg-[#00F0FF] text-black px-3 py-1 border-3 border-black inline-block shadow-[5px_5px_0px_#000000] rotate-[-1deg]">
              Earn.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-black font-extrabold text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed pt-2"
          >
            Stake on high-frequency prediction markets with multi-agent AI thesis validation on Somnia Network.
          </motion.p>
        </div>

        {/* Neubrutalist Central AI Core Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative my-10 flex items-center justify-center"
        >
          <div className="w-full max-w-xl bg-white border-4 border-black p-6 rounded-sm shadow-[8px_8px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-sm bg-[#8A2BE2] border-3 border-black flex items-center justify-center text-[#F5FF00] shadow-[4px_4px_0px_#000000] shrink-0">
                <Bot className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-black">Gemini 2.0 AI Oracle</h3>
                <p className="text-xs font-bold text-slate-700 font-mono">Continuous Bull & Bear Agent Thesis Engine</p>
                <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm border-2 border-black bg-[#00FF66] text-black text-xs font-mono font-black shadow-[2px_2px_0px_#000000]">
                  <span>99.4% CONFIDENCE ACCURACY</span>
                </div>
              </div>
            </div>
            <Link href="/events">
              <Button size="lg" className="w-full md:w-auto border-3 border-black bg-[#F5FF00] text-black font-black">
                Explore Arena
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link href={isConnected ? '/events' : '#'} onClick={!isConnected ? (e) => { e.preventDefault(); } : undefined}>
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-lg font-black bg-[#8A2BE2] text-white border-3 border-black shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000]"
            >
              <Wallet className="h-5 w-5 mr-2" />
              {isConnected ? 'Enter Oracle Matrix' : 'Connect Wallet to Enter'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>

          <Link href="/events">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 text-lg font-black border-3 border-black bg-white text-black shadow-[6px_6px_0px_#000000]"
            >
              <Search className="h-5 w-5 mr-2 text-black" />
              Explore Live Predictions
            </Button>
          </Link>
        </motion.div>

        {/* Daily Quests Missions Widget */}
        <div className="mb-16">
          <DailyQuestsWidget />
        </div>

        {/* 3 Core Feature Cards Section */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest bg-[#00F0FF] text-black px-3 py-1 border-2 border-black inline-block shadow-[3px_3px_0px_#000000]">
              Protocol Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight pt-1">
              Engineered for Autonomous Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Feature 1: AI Research */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="h-full border-3 border-black bg-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] flex flex-col justify-between">
                <CardHeader>
                  <div className="h-12 w-12 rounded-sm bg-[#00F0FF] border-3 border-black flex items-center justify-center text-black mb-3 shadow-[3px_3px_0px_#000000]">
                    <Bot className="h-6 w-6" />
                  </div>
                  <Badge variant="cyan" className="w-fit mb-1 font-mono font-black">
                    Multi-Agent Synthesis
                  </Badge>
                  <CardTitle className="text-2xl font-black uppercase text-black">
                    AI Research & Debate
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed font-bold text-slate-800 pt-1">
                    Autonomous AI agents scrape live market feeds, debate bull vs. bear arguments, and synthesize quantitative confidence metrics before you stake.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-mono font-black text-black border-t-3 border-black pt-4 bg-[#FFFDF0]">
                  <div className="flex items-center justify-between">
                    <span>Evidence Extraction</span>
                    <strong className="text-black">Live Web & Data</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence Scoring</span>
                    <strong className="text-black">0.00 – 100%</strong>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2: On-Chain Predictions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="h-full border-3 border-black bg-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] flex flex-col justify-between">
                <CardHeader>
                  <div className="h-12 w-12 rounded-sm bg-[#F5FF00] border-3 border-black flex items-center justify-center text-black mb-3 shadow-[3px_3px_0px_#000000]">
                    <Zap className="h-6 w-6 text-black" />
                  </div>
                  <Badge variant="default" className="w-fit mb-1 font-mono font-black">
                    Sub-Second Execution
                  </Badge>
                  <CardTitle className="text-2xl font-black uppercase text-black">
                    On-Chain Predictions
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed font-bold text-slate-800 pt-1">
                    Stake your STT tokens in transparent smart contract pools with sub-second finality on Somnia Network. Verifiable oracle resolutions with zero counterparty risk.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-mono font-black text-black border-t-3 border-black pt-4 bg-[#FFFDF0]">
                  <div className="flex items-center justify-between">
                    <span>Finality Speed</span>
                    <strong className="text-black">&lt; 100ms</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Smart Contract</span>
                    <strong className="text-black">Audited / EVM</strong>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3: XP & Reputation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="h-full border-3 border-black bg-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] flex flex-col justify-between">
                <CardHeader>
                  <div className="h-12 w-12 rounded-sm bg-[#FF3EA5] border-3 border-black flex items-center justify-center text-white mb-3 shadow-[3px_3px_0px_#000000]">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="destructive" className="w-fit mb-1 font-mono font-black">
                    Proof of Accuracy
                  </Badge>
                  <CardTitle className="text-2xl font-black uppercase text-black">
                    XP & Neubrutal Ranks
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed font-bold text-slate-800 pt-1">
                    Level up from Novice Oracle to Grand Seer. Earn XP on winning predictions, unlock exclusive on-chain achievement badges, and climb global leaderboards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-mono font-black text-black border-t-3 border-black pt-4 bg-[#FFFDF0]">
                  <div className="flex items-center justify-between">
                    <span>Rank Hierarchy</span>
                    <strong className="text-black">Beginner &rarr; Oracle</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reward Multipliers</span>
                    <strong className="text-black">Tiered XP Boosts</strong>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST PROTOCOL — POWERED BY SOMNIA HIGH-TPS NETWORK</span>
          </div>
          <div className="flex gap-6 text-black font-black">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/events" className="hover:underline">Events</Link>
            <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
            <Link href="/history" className="hover:underline">History</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

