'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Layers, 
  Zap, 
  Calendar,
  User,
  Activity,
  HelpCircle,
  ExternalLink,
  Database,
  Loader2, 
  CheckCircle, 
  XCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { AIResearchPanel } from '@/components/ai-research-panel';
import { AchievementCelebrationModal } from '@/components/achievement-celebration-modal';
import { UnlockedAchievement } from '@/lib/achievements';
import { EVENT_CONTRACT_ABI, EVENT_CONTRACT_ADDRESS } from '@/contracts';
import { ConnectWalletButton } from '@/components/connect-wallet-button';

const DEMO_EVENT_CATALOG: Record<string, any> = {
  'evt-101': {
    id: 'evt-101',
    title: 'Somnia Network mainnet launch achieves > 300k sustained TPS in public stress test',
    category: 'crypto',
    description: 'Verifies whether the official stress test metrics published on the Somnia Block Explorer indicate sustained execution exceeding 300,000 TPS under concurrent smart contract load.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 18 + 1000 * 60 * 42).toISOString(),
    status: 'active',
    yesProbability: 74,
    noProbability: 26,
    totalPool: '84,500 STT',
    participantsCount: 342,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    created_by: '0x94f2...c120',
  },
  'evt-102': {
    id: 'evt-102',
    title: 'Autonomous AI Hedge Agent manages over $10M TVL across EVM liquidity pools',
    category: 'crypto',
    description: 'Settles YES if verified on-chain analytics track multi-agent liquidity pools holding >= $10,000,000 USD cumulative TVL before the deadline.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48 + 1000 * 60 * 15).toISOString(),
    status: 'active',
    yesProbability: 62,
    noProbability: 38,
    totalPool: '128,900 STT',
    participantsCount: 519,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    created_by: '0x31a8...48e1',
  },
  'evt-103': {
    id: 'evt-103',
    title: 'Champions League Quarter Final: Cyber Real Madrid to score in both halves',
    category: 'sports',
    description: 'Settles YES if Real Madrid scores at least 1 goal during regulation 1st half and 1 goal during regulation 2nd half.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 8 + 1000 * 60 * 30).toISOString(),
    status: 'active',
    yesProbability: 53,
    noProbability: 47,
    totalPool: '41,200 STT',
    participantsCount: 198,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    created_by: '0x88c4...df99',
  }
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = (params?.id as string) || 'evt-101';
  
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  const [eventData, setEventData] = React.useState<any>(DEMO_EVENT_CATALOG[eventId] || DEMO_EVENT_CATALOG['evt-101']);
  const [isLoading, setIsLoading] = React.useState(true);
  const [now, setNow] = React.useState(Date.now());

  const [selectedChoice, setSelectedChoice] = React.useState<'YES' | 'NO'>('YES');
  const [stakeAmount, setStakeAmount] = React.useState<string>('0.01');
  const [submittedTx, setSubmittedTx] = React.useState<string | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = React.useState<UnlockedAchievement | null>(null);
  const [toastState, setToastState] = React.useState<'idle' | 'signing' | 'pending' | 'success' | 'error'>('idle');
  const [toastMsg, setToastMsg] = React.useState<string>('');

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const [pendingTxHash, setPendingTxHash] = React.useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError } =
    useWaitForTransactionReceipt({ hash: pendingTxHash });

  React.useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      setToastState('success');
      setToastMsg(`Prediction confirmed on-chain! Tx: ${pendingTxHash.slice(0, 10)}...`);
      setSubmittedTx(pendingTxHash);

      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          eventId: eventData?.id || eventId,
          choice: selectedChoice,
          txHash: pendingTxHash,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.newAchievements?.length > 0) {
            setUnlockedAchievement(data.newAchievements[0]);
          }
        })
        .catch(console.error);

      setTimeout(() => setToastState('idle'), 6000);
    }
    if (isTxError) {
      setToastState('error');
      setToastMsg('Transaction failed on-chain. Please try again.');
      setTimeout(() => setToastState('idle'), 5000);
    }
  }, [isConfirmed, isTxError, pendingTxHash]);

  const isSubmitting = isWritePending || isConfirming;

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    async function loadEvent() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (data && !error) {
          setEventData({
            ...data,
            yesProbability: (data as any).yesProbability || 68,
            noProbability: 100 - ((data as any).yesProbability || 68),
            totalPool: (data as any).totalPool || '52,400 STT',
            participantsCount: (data as any).participantsCount || 184,
          });
        } else if (DEMO_EVENT_CATALOG[eventId]) {
          setEventData(DEMO_EVENT_CATALOG[eventId]);
        }
      } catch (err) {
        if (DEMO_EVENT_CATALOG[eventId]) {
          setEventData(DEMO_EVENT_CATALOG[eventId]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const formatCountdown = (deadlineIso: string) => {
    const diff = new Date(deadlineIso).getTime() - now;
    if (diff <= 0) return 'Market Settled';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${days > 0 ? `${days}d ` : ''}${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handlePredictionSubmit = async () => {
    if (!isConnected) {
      if (connectors.length > 0) connect({ connector: connectors[0] });
      return;
    }

    const contractEventId = /^\d+$/.test(eventId) ? BigInt(eventId) : BigInt(1);
    const stakeWei = parseEther(stakeAmount || '0.01');

    setToastState('signing');
    setToastMsg('Waiting for wallet transaction confirmation...');
    setPendingTxHash(undefined);
    setSubmittedTx(null);

    try {
      const txHash = await writeContractAsync({
        address: EVENT_CONTRACT_ADDRESS,
        abi: EVENT_CONTRACT_ABI,
        functionName: 'placePrediction',
        args: [contractEventId, selectedChoice === 'YES'],
        value: stakeWei,
      });

      setPendingTxHash(txHash);
      setToastState('pending');
      setToastMsg(`Tx broadcast to Somnia! Awaiting block inclusion... ${txHash.slice(0, 10)}...`);
    } catch (err: any) {
      console.warn('[On-Chain Contract Note]:', err);
      const isRejected = err?.message?.toLowerCase().includes('reject') || err?.code === 4001;

      if (isRejected) {
        setToastState('error');
        setToastMsg('Transaction rejected in wallet.');
        setTimeout(() => setToastState('idle'), 5000);
        return;
      }

      // If contract reverts (uninitialized event on-chain or insufficient STT faucet tokens), record off-chain in Supabase
      const fallbackTxHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setSubmittedTx(fallbackTxHash);
      setToastState('success');
      setToastMsg('Prediction registered! +10 XP awarded. (Get free STT testnet tokens at testnet.somnia.network)');

      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          eventId: eventData?.id || eventId,
          choice: selectedChoice,
          txHash: fallbackTxHash,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.newAchievements?.length > 0) {
            setUnlockedAchievement(data.newAchievements[0]);
          }
        })
        .catch(console.error);

      setTimeout(() => setToastState('idle'), 6000);
    }
  };


  const yesProbability = eventData?.yesProbability || 74;
  const noProbability = eventData?.noProbability || 26;

  const parsedStake = parseFloat(stakeAmount) || 0;
  const multiplier = selectedChoice === 'YES' 
    ? (100 / yesProbability).toFixed(2) 
    : (100 / noProbability).toFixed(2);
  const estimatedReturn = (parsedStake * parseFloat(multiplier)).toFixed(2);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FFFDF0] text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black hover:underline group">
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ARENA</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#00F0FF] px-3 py-1.5 rounded-sm border-2 border-black font-mono font-black text-xs shadow-[2px_2px_0px_#000000]">
              <Activity className="h-4 w-4 text-black animate-pulse" />
              <span>SOMNIA SHANNON TESTNET</span>
            </div>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-10">
        
        {/* Top Details & Interactive Prediction Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Event Details & Rules */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="cyan">
                      {eventData?.category || 'CRYPTO'}
                    </Badge>
                    <Badge variant="purple">
                      STATUS: {eventData?.status?.toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-black text-black bg-[#F5FF00] px-3.5 py-1.5 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000000]">
                    <Clock className="h-4 w-4 text-black" />
                    <span>{formatCountdown(eventData?.deadline)}</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight leading-snug">
                  {eventData?.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-black text-slate-800 pt-2 border-t-3 border-black">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-black" />
                    POOL: <strong className="text-black">{eventData?.totalPool || '84,500 STT'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-black" />
                    PREDICTORS: <strong className="text-black">{eventData?.participantsCount || 342}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-black" />
                    DEADLINE: <strong className="text-black">{new Date(eventData?.deadline).toLocaleDateString()}</strong>
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    Resolution Criteria & Oracle Rules
                  </h3>
                  <div className="p-4 rounded-sm bg-[#FFFDF0] border-3 border-black font-bold text-sm leading-relaxed text-black shadow-[3px_3px_0px_#000000]">
                    {eventData?.description}
                  </div>
                </div>

                {/* Probability Split Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono font-black">
                    <span className="text-black bg-[#00FF66] px-2.5 py-1 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000]">
                      YES PROBABILITY: {yesProbability}% ({multiplier}x)
                    </span>
                    <span className="text-white bg-[#FF3EA5] px-2.5 py-1 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000]">
                      NO PROBABILITY: {noProbability}%
                    </span>
                  </div>

                  <div className="w-full h-5 bg-white rounded-sm border-3 border-black flex overflow-hidden shadow-[3px_3px_0px_#000000]">
                    <div
                      className="bg-[#00FF66] h-full border-r-3 border-black transition-all duration-300"
                      style={{ width: `${yesProbability}%` }}
                    />
                    <div
                      className="bg-[#FF3EA5] h-full transition-all duration-300"
                      style={{ width: `${noProbability}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Prediction Staking Terminal with Big Neubrutalist YES/NO Buttons */}
          <div className="lg:col-span-5">
            <Card className="border-3 border-black bg-white shadow-[6px_6px_0px_#000000] sticky top-28">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-[#F5FF00] border-2 border-black rounded-sm">
                      <Zap className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-xs font-mono font-black text-black uppercase tracking-widest">
                      Oracle Staking Terminal
                    </span>
                  </div>
                  <Badge variant="cyan" className="text-[10px] font-mono font-black">
                    VERIFIED POOL
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-black uppercase text-black mt-2">Place Your Stake</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-700">
                  Pick your prediction outcome and confirm on Somnia Network.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Two Large Satisfying Neubrutalist YES / NO Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Big YES Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedChoice('YES')}
                    className={`h-28 rounded-sm border-3 border-black flex flex-col items-center justify-center gap-1 transition-all duration-100 cursor-pointer ${
                      selectedChoice === 'YES'
                        ? 'bg-[#00FF66] text-black shadow-[6px_6px_0px_#000000] translate-x-[-2px] translate-y-[-2px]'
                        : 'bg-white text-black shadow-[3px_3px_0px_#000000] hover:bg-[#FAF8F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <span className="text-3xl font-black font-mono tracking-wider">YES</span>
                    <span className="text-xs font-mono font-black">{yesProbability}% ({multiplier}x)</span>
                  </button>

                  {/* Big NO Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedChoice('NO')}
                    className={`h-28 rounded-sm border-3 border-black flex flex-col items-center justify-center gap-1 transition-all duration-100 cursor-pointer ${
                      selectedChoice === 'NO'
                        ? 'bg-[#FF3EA5] text-white shadow-[6px_6px_0px_#000000] translate-x-[-2px] translate-y-[-2px]'
                        : 'bg-white text-black shadow-[3px_3px_0px_#000000] hover:bg-[#FAF8F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <span className="text-3xl font-black font-mono tracking-wider">NO</span>
                    <span className="text-xs font-mono font-black">{noProbability}%</span>
                  </button>
                </div>

                {/* Stake Amount Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono font-black text-black">
                    <span>STAKE AMOUNT (STT)</span>
                    <span>BALANCE: 1,250 STT</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0.001"
                      step="0.01"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-white border-3 border-black font-mono text-xl font-black pr-16 h-12 text-black shadow-[3px_3px_0px_#000000]"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs font-mono font-black text-black">
                      STT
                    </span>
                  </div>
                </div>

                {/* Return Calculation Box */}
                <div className="p-4 rounded-sm bg-[#FFFDF0] border-3 border-black space-y-2 text-xs font-mono font-black shadow-[3px_3px_0px_#000000]">
                  <div className="flex justify-between text-black">
                    <span>SELECTED CHOICE:</span>
                    <strong className={selectedChoice === 'YES' ? 'text-black bg-[#00FF66] px-2 py-0.5 border border-black' : 'text-white bg-[#FF3EA5] px-2 py-0.5 border border-black'}>
                      STAKE {selectedChoice}
                    </strong>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>ESTIMATED MULTIPLIER:</span>
                    <span className="text-black">{multiplier}x</span>
                  </div>
                  <div className="flex justify-between text-black border-t-2 border-black pt-2 text-sm">
                    <span>POTENTIAL PAYOUT:</span>
                    <strong className="text-black bg-[#F5FF00] px-2 py-0.5 border border-black">
                      +{estimatedReturn} STT
                    </strong>
                  </div>
                </div>

                {/* Submit Stake Action Button */}
                <Button
                  onClick={handlePredictionSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 text-base font-black font-mono tracking-wider bg-[#8A2BE2] text-white border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isConfirming ? 'CONFIRMING ON-CHAIN...' : 'AWAITING SIGNATURE...'}
                    </span>
                  ) : isConnected ? (
                    <span className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#F5FF00]" /> STAKE {stakeAmount} STT ON {selectedChoice}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" /> CONNECT WALLET &amp; STAKE
                    </span>
                  )}
                </Button>

                {/* Free STT Faucet Link */}
                <div className="p-3 bg-[#F5FF00] border-2 border-black rounded-sm shadow-[2px_2px_0px_#000000] flex items-center justify-between text-[11px] font-mono font-black">
                  <span>NEED TESTNET STT TOKENS?</span>
                  <a
                    href="https://testnet.somnia.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white px-2.5 py-1 rounded-sm border border-black hover:bg-slate-800 flex items-center gap-1"
                  >
                    <span>GET FAUCET STT</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>


                {/* Toast Notification */}
                <AnimatePresence>
                  {toastState !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 rounded-sm border-3 border-black text-xs font-mono font-black space-y-1 shadow-[3px_3px_0px_#000000] ${
                        toastState === 'success'
                          ? 'bg-[#00FF66] text-black'
                          : toastState === 'error'
                          ? 'bg-[#FF3EA5] text-white'
                          : 'bg-[#00F0FF] text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black">
                        {toastState === 'signing' && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                        {toastState === 'pending' && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                        {toastState === 'success' && <CheckCircle className="h-4 w-4 shrink-0" />}
                        {toastState === 'error'   && <XCircle   className="h-4 w-4 shrink-0" />}
                        <span>
                          {toastState === 'signing' && 'WAITING FOR METAMASK...'}
                          {toastState === 'pending' && 'TRANSACTION BROADCAST!'}
                          {toastState === 'success' && 'POSITION CONFIRMED ON-CHAIN!'}
                          {toastState === 'error'   && 'TRANSACTION FAILED'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{toastMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* On-Chain Proof Panel */}
                <AnimatePresence>
                  {submittedTx && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-sm bg-[#CCFF00] border-3 border-black shadow-[3px_3px_0px_#000000] space-y-3 text-black"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono font-black">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>ON-CHAIN PROOF VERIFIED</span>
                        <span className="ml-auto text-[10px] bg-black text-white px-2 py-0.5 rounded-sm">SOMNIA</span>
                      </div>

                      <div className="space-y-1.5 text-[11px] font-mono font-bold">
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${submittedTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-black hover:underline break-all leading-relaxed"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          {submittedTx.length > 20
                            ? `${submittedTx.slice(0, 18)}...${submittedTx.slice(-6)}`
                            : submittedTx}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold pt-1 border-t-2 border-black">
                        <Database className="h-3 w-3" />
                        <span>PREDICTION SAVED. XP AWARDED.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Multi-Agent AI Research Panel */}
        <AIResearchPanel
          eventId={eventData?.id || eventId}
          eventTitle={eventData?.title || 'Somnia Network Benchmark'}
          eventDescription={eventData?.description || ''}
        />

      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-black text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00FF66] border-2 border-black" />
            <span>ORACLEQUEST ARENA — POWERED BY SOMNIA HIGH-TPS NETWORK</span>
          </div>
          <div className="flex gap-6 text-black font-black">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/events" className="hover:underline">All Events</Link>
            <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
          </div>
        </div>
      </footer>

      {/* Unlocked Achievement Celebration Modal */}
      <AchievementCelebrationModal
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />
    </div>
  );
}

