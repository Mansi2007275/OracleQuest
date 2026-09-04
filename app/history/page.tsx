'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Bot, 
  ArrowUpRight,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';

interface UserPredictionHistoryItem {
  id: string;
  eventId: string;
  eventTitle: string;
  category: string;
  choice: 'YES' | 'NO';
  stakeAmount: string;
  status: 'won' | 'lost' | 'pending';
  resolutionOutcome: 'YES' | 'NO' | null;
  aiSummary: string;
  createdAt: string;
  txHash: string;
}

const DEMO_PREDICTIONS: UserPredictionHistoryItem[] = [
  {
    id: 'pred-1',
    eventId: 'evt-101',
    eventTitle: 'Somnia Network mainnet launch achieves > 300k sustained TPS in public stress test',
    category: 'crypto',
    choice: 'YES',
    stakeAmount: '100 STT',
    status: 'won',
    resolutionOutcome: 'YES',
    aiSummary: 'Spot-on call! Your conviction on the Bull momentum was vindicated as parallel execution scaling easily surpassed the 300k target metric with IceDB compiler optimizations.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    txHash: '0x8f2a...91b4',
  },
  {
    id: 'pred-2',
    eventId: 'evt-105',
    eventTitle: 'US SEC to formally approve first Multi-Agent Autonomous Asset ETF standard',
    category: 'politics',
    choice: 'NO',
    stakeAmount: '75 STT',
    status: 'won',
    resolutionOutcome: 'NO',
    aiSummary: 'Brilliant contrarian read! You rightly anticipated regulatory skepticism and administrative review delays highlighted in the Bear thesis, dodging the consensus trap.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    txHash: '0x3c71...4e80',
  },
  {
    id: 'pred-3',
    eventId: 'evt-103',
    eventTitle: 'Champions League Quarter Final: Cyber Real Madrid to score in both halves',
    category: 'sports',
    choice: 'YES',
    stakeAmount: '50 STT',
    status: 'lost',
    resolutionOutcome: 'NO',
    aiSummary: 'Close attempt. While the attacking metrics aligned with the Bull thesis, unexpected defensive tactical adjustments in the second half prevented the clean sweep.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    txHash: '0x6e19...2a11',
  },
  {
    id: 'pred-4',
    eventId: 'evt-102',
    eventTitle: 'Autonomous AI Hedge Agent manages over $10M TVL across EVM liquidity pools',
    category: 'crypto',
    choice: 'YES',
    stakeAmount: '120 STT',
    status: 'pending',
    resolutionOutcome: null,
    aiSummary: 'Market active. Position tracking: AI multi-agent TVL velocity currently at $8.4M (62% Bull probability).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    txHash: '0x99dd...01cc',
  }
];

export default function PredictionHistoryPage() {
  const { address } = useAccount();

  const [predictions, setPredictions] = React.useState<UserPredictionHistoryItem[]>(DEMO_PREDICTIONS);
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'won' | 'lost' | 'pending'>('all');

  React.useEffect(() => {
    async function loadUserPredictions() {
      if (!address) return;
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select(`
            id,
            choice,
            tx_hash,
            ai_summary,
            created_at,
            events:event_id (
              id,
              title,
              category,
              status,
              resolution
            )
          `)
          .order('created_at', { ascending: false });

        if (data && data.length > 0 && !error) {
          const formatted: UserPredictionHistoryItem[] = data.map((p: any) => {
            const evt = p.events;
            const isResolved = evt?.status === 'resolved';
            const won = isResolved && evt?.resolution === p.choice;
            const lost = isResolved && evt?.resolution && evt?.resolution !== p.choice;

            return {
              id: p.id,
              eventId: evt?.id || 'evt-1',
              eventTitle: evt?.title || 'Prediction Quest',
              category: evt?.category || 'crypto',
              choice: p.choice,
              stakeAmount: '50 STT',
              status: won ? 'won' : lost ? 'lost' : 'pending',
              resolutionOutcome: evt?.resolution || null,
              aiSummary: p.ai_summary || 'Analysis pending event settlement.',
              createdAt: p.created_at,
              txHash: p.tx_hash || '0x...mock',
            };
          });
          setPredictions(formatted);
        }
      } catch (err) {
        console.log('Using default prediction history records');
      }
    }

    loadUserPredictions();
  }, [address]);

  const totalCount = predictions.length;
  const wonCount = predictions.filter((p) => p.status === 'won').length;
  const lostCount = predictions.filter((p) => p.status === 'lost').length;
  const winRate = totalCount > 0 ? Math.round((wonCount / (wonCount + lostCount || 1)) * 100) : 0;
  const totalXp = wonCount * 150;

  const filteredPredictions = predictions.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FFFDF0] text-black">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black hover:underline group">
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ARENA</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/events">
              <Button variant="default" size="sm" className="bg-[#F5FF00] text-black font-black font-mono text-xs border-3 border-black shadow-[3px_3px_0px_#000000]">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        
        {/* User Summary Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-sm border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F5FF00] border-2 border-black rounded-sm shadow-[2px_2px_0px_#000000]">
                <Trophy className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight">
                Prediction History & AI Mentor Debrief
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Review your historical prediction performance, earned XP, and personalized post-settlement AI analyses.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-sm bg-[#FFFDF0] border-2 border-black text-center shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-mono font-black text-slate-700 block">QUESTS</span>
              <strong className="text-lg font-black text-black font-mono">{totalCount}</strong>
            </div>
            <div className="p-3 rounded-sm bg-[#00FF66] border-2 border-black text-center shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-mono font-black text-black block">WIN RATE</span>
              <strong className="text-lg font-black text-black font-mono">{winRate}%</strong>
            </div>
            <div className="p-3 rounded-sm bg-[#00F0FF] border-2 border-black text-center shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-mono font-black text-black block">XP GAINED</span>
              <strong className="text-lg font-black text-black font-mono">+{totalXp}</strong>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {(['all', 'won', 'lost', 'pending'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-black border-3 border-black uppercase transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#F5FF00] text-black shadow-[3px_3px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-[#FAF8F5]'
              }`}
            >
              {st} ({predictions.filter((p) => (st === 'all' ? true : p.status === st)).length})
            </button>
          ))}
        </div>

        {/* Prediction Cards Feed */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPredictions.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <Card className="border-3 border-black bg-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="cyan" className="text-[10px]">
                          {item.category.toUpperCase()}
                        </Badge>
                        {item.status === 'won' ? (
                          <Badge variant="green" className="text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> WON (+150 XP)
                          </Badge>
                        ) : item.status === 'lost' ? (
                          <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> LOST
                          </Badge>
                        ) : (
                          <Badge variant="cyan" className="text-[10px] flex items-center gap-1">
                            <Clock className="h-3 w-3" /> ACTIVE STAKE
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs font-mono font-black text-slate-700">
                        Placed on {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <CardTitle className="text-lg text-black font-black uppercase mt-1">
                      {item.eventTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-black p-3 rounded-sm bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0px_#000000]">
                      <span>
                        STANCE:{' '}
                        <strong className={item.choice === 'YES' ? 'bg-[#00FF66] text-black px-2 py-0.5 border border-black' : 'bg-[#FF3EA5] text-white px-2 py-0.5 border border-black'}>
                          STAKE {item.choice}
                        </strong>
                      </span>
                      <span>
                        STAKE SIZE: <strong className="text-black">{item.stakeAmount}</strong>
                      </span>
                      {item.resolutionOutcome && (
                        <span>
                          FINAL OUTCOME:{' '}
                          <strong className="text-black bg-[#F5FF00] px-2 py-0.5 border border-black">
                            {item.resolutionOutcome}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-sm bg-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-start gap-3 text-black font-mono font-black text-xs">
                      <CheckCircle className="h-4 w-4 text-black shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-black">
                          On-Chain Proof · Somnia Shannon Testnet
                        </p>
                        {item.txHash && item.txHash !== '0x...mock' ? (
                          <a
                            href={`https://shannon-explorer.somnia.network/tx/${item.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-black hover:underline break-all"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {item.txHash.length > 24
                              ? `${item.txHash.slice(0, 20)}...${item.txHash.slice(-6)}`
                              : item.txHash}
                          </a>
                        ) : (
                          <span className="text-xs italic text-black">Tx pending or not recorded</span>
                        )}
                      </div>
                    </div>

                    {/* AI Mentor Debrief Box */}
                    <div className="p-4 rounded-sm bg-[#F5FF00] border-3 border-black shadow-[3px_3px_0px_#000000] flex items-start gap-3 text-black">
                      <div className="p-1.5 rounded-sm bg-white border-2 border-black shrink-0 shadow-[1px_1px_0px_#000000]">
                        <Bot className="h-5 w-5 text-black" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <strong className="block font-mono font-black uppercase tracking-wider text-black">
                          AI Mentor Debrief:
                        </strong>
                        <p className="font-bold text-sm leading-relaxed text-black">
                          {item.aiSummary}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex justify-between items-center text-xs font-mono font-black text-slate-800 border-t-2 border-black py-3">
                    <span>Somnia Shannon Verified</span>
                    <Link href={`/events/${item.eventId}`} className="text-black hover:underline flex items-center gap-1">
                      View Event Arena <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST PREDICTION JOURNAL & REPUTATION LEDGER</span>
          </div>
          <div className="flex gap-6 text-black font-black">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/events" className="hover:underline">Events</Link>
            <Link href="/history" className="hover:underline">My Predictions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

