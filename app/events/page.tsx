'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Clock, 
  ArrowUpRight, 
  Radio,
  PlusCircle,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Event as EventType } from '@/types';
import { CreateEventModal } from '@/components/create-event-modal';
import { UserRankBadge } from '@/components/user-rank-badge';
import { ConnectWalletButton } from '@/components/connect-wallet-button';

interface EnrichedEvent extends Partial<EventType> {
  id: string;
  title: string;
  category: 'crypto' | 'sports' | 'weather' | 'politics' | string;
  description: string;
  deadline: string;
  status: 'active' | 'closed' | 'resolved' | 'cancelled';
  yesProbability: number;
  noProbability: number;
  totalPool: string;
  participantsCount: number;
}

const FALLBACK_EVENTS: EnrichedEvent[] = [
  {
    id: 'evt-101',
    title: 'Somnia Network mainnet launch achieves > 300k sustained TPS in public stress test',
    category: 'crypto',
    description: 'Verifies whether the official stress test metrics published on explorer show >300,000 TPS.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 18 + 1000 * 60 * 42).toISOString(),
    status: 'active',
    yesProbability: 74,
    noProbability: 26,
    totalPool: '84,500 STT',
    participantsCount: 342,
  },
  {
    id: 'evt-102',
    title: 'Autonomous AI Hedge Agent manages over $10M TVL across EVM liquidity pools',
    category: 'crypto',
    description: 'Tracks on-chain verified AI autonomous agent smart contracts and their cumulative TVL.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48 + 1000 * 60 * 15).toISOString(),
    status: 'active',
    yesProbability: 62,
    noProbability: 38,
    totalPool: '128,900 STT',
    participantsCount: 519,
  },
  {
    id: 'evt-103',
    title: 'Champions League Quarter Final: Cyber Real Madrid to score in both halves',
    category: 'sports',
    description: 'Settles YES if Real Madrid scores at least 1 goal in the 1st half and 1 goal in the 2nd half.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 8 + 1000 * 60 * 30).toISOString(),
    status: 'active',
    yesProbability: 53,
    noProbability: 47,
    totalPool: '41,200 STT',
    participantsCount: 198,
  },
  {
    id: 'evt-104',
    title: 'Global Supercomputer temperature anomaly in Arctic exceeds +2.5°C threshold',
    category: 'weather',
    description: 'NOAA and European satellite temperature anomalies recorded for the current meteorological cycle.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    status: 'active',
    yesProbability: 81,
    noProbability: 19,
    totalPool: '33,400 STT',
    participantsCount: 145,
  },
  {
    id: 'evt-105',
    title: 'US SEC to formally approve first Multi-Agent Autonomous Asset ETF standard',
    category: 'politics',
    description: 'Official filing register published in the federal regulatory ledger by the deadline.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    status: 'active',
    yesProbability: 39,
    noProbability: 61,
    totalPool: '97,600 STT',
    participantsCount: 420,
  },
  {
    id: 'evt-106',
    title: 'Ethereum Layer 2 gas fees drop below 0.00001 ETH average after Blob upgrade',
    category: 'crypto',
    description: 'Etherscan and L2Beat average fee indices across Arbitrum, Optimism, and Base.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 32).toISOString(),
    status: 'active',
    yesProbability: 68,
    noProbability: 32,
    totalPool: '56,100 STT',
    participantsCount: 267,
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Quests' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'sports', label: 'Sports' },
  { id: 'weather', label: 'Weather' },
  { id: 'politics', label: 'Politics' },
];

export default function EventsPage() {
  const [events, setEvents] = React.useState<EnrichedEvent[]>(FALLBACK_EVENTS);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
  const [now, setNow] = React.useState<number>(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEvents = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        const enriched: EnrichedEvent[] = data.map((evt, idx) => ({
          ...evt,
          yesProbability: (evt as any).yesProbability || Math.floor(40 + (idx * 17) % 50),
          noProbability: 100 - ((evt as any).yesProbability || Math.floor(40 + (idx * 17) % 50)),
          totalPool: `${(15000 + (idx * 12340)).toLocaleString()} STT`,
          participantsCount: 80 + idx * 45,
        }));
        setEvents(enriched);
      }
    } catch (err) {
      console.log('Using default mock events feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventCreated = (newEvent: any) => {
    const formatted: EnrichedEvent = {
      ...newEvent,
      yesProbability: 50,
      noProbability: 50,
      totalPool: '0 STT',
      participantsCount: 1,
    };
    setEvents((prev) => [formatted, ...prev]);
  };

  const formatCountdown = (deadlineIso: string) => {
    const diff = new Date(deadlineIso).getTime() - now;
    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const getCategoryBadge = (cat: string) => {
    const c = cat.toLowerCase();
    switch (c) {
      case 'crypto':
        return <Badge variant="cyan">CRYPTO</Badge>;
      case 'sports':
        return <Badge variant="green">SPORTS</Badge>;
      case 'weather':
        return <Badge variant="secondary">WEATHER</Badge>;
      case 'politics':
        return <Badge variant="purple">POLITICS</Badge>;
      default:
        return <Badge variant="outline">{cat.toUpperCase()}</Badge>;
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesCat = selectedCategory === 'all' || evt.category.toLowerCase() === selectedCategory;
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FFFDF0] text-black">
      {/* Top Neubrutalist Navigation */}
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-sm bg-[#8A2BE2] border-3 border-black flex items-center justify-center text-[#F5FF00] shadow-[3px_3px_0px_#000000]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black tracking-tight text-xl uppercase text-black">
                ORACLEQUEST
              </span>
              <span className="text-[10px] block font-mono font-extrabold text-slate-700 tracking-wider">
                MARKET DISCOVERY MATRIX
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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
            <Link href="/profile">
              <UserRankBadge level={4} size="sm" className="hidden sm:inline-flex" />
            </Link>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#F5FF00] text-black font-black font-mono text-xs border-3 border-black shadow-[3px_3px_0px_#000000]"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Event
            </Button>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b-4 border-black">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border-2 border-black bg-[#F5FF00] text-black text-xs font-mono font-black shadow-[2px_2px_0px_#000000]">
              <Radio className="h-4 w-4 text-black animate-pulse" />
              <span>LIVE ORACLE MARKETS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase text-black tracking-tight">
              Prediction Event Arena
            </h1>
            <p className="text-slate-800 font-bold text-sm max-w-xl">
              Explore active AI-debated prediction markets across crypto infrastructure, high-stakes sports, climate sensors, and macro policies.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-700" />
              <Input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-3 border-black text-black font-bold placeholder:text-slate-500 shadow-[3px_3px_0px_#000000]"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-wider font-mono border-3 border-black transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#F5FF00] text-black shadow-[4px_4px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-[#FAF8F5]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((evt, idx) => (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <Card className="h-full flex flex-col justify-between border-3 border-black bg-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {getCategoryBadge(evt.category)}
                      <div className="flex items-center gap-1.5 text-xs font-mono font-black text-black bg-[#FAF8F5] px-2.5 py-1 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000000]">
                        <Clock className="h-3.5 w-3.5 text-black" />
                        <span>{formatCountdown(evt.deadline)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-black font-black leading-snug line-clamp-2 uppercase">
                      {evt.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-700 line-clamp-2 pt-1">
                      {evt.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    {/* YES / NO Flat Probability Split Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono font-black">
                        <span className="text-black bg-[#00FF66] px-2 py-0.5 rounded-sm border-2 border-black shadow-[1px_1px_0px_#000]">
                          YES: {evt.yesProbability}%
                        </span>
                        <span className="text-white bg-[#FF3EA5] px-2 py-0.5 rounded-sm border-2 border-black shadow-[1px_1px_0px_#000]">
                          NO: {evt.noProbability}%
                        </span>
                      </div>

                      <div className="w-full h-4 bg-white rounded-sm border-3 border-black flex overflow-hidden shadow-[2px_2px_0px_#000000]">
                        <div
                          className="bg-[#00FF66] h-full border-r-2 border-black transition-all duration-300"
                          style={{ width: `${evt.yesProbability}%` }}
                        />
                        <div
                          className="bg-[#FF3EA5] h-full transition-all duration-300"
                          style={{ width: `${evt.noProbability}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono font-black text-slate-800 pt-2 border-t-2 border-black">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-black" /> {evt.totalPool}
                      </span>
                      <span>
                        {evt.participantsCount} PREDICTORS
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/events/${evt.id}`} className="w-full">
                      <Button 
                        variant="default"
                        className="w-full h-11 border-3 border-black bg-[#F5FF00] text-black font-black font-mono text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] flex items-center justify-center gap-2"
                      >
                        View Event
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Reusable Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST DECENTRALIZED DISCOVERY MATRIX</span>
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

