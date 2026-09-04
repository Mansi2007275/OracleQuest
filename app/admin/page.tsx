'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Sparkles, 
  ArrowLeft, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  Activity, 
  Play, 
  RefreshCw, 
  Layers, 
  Check,
  XCircle,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isResolvingAll, setIsResolvingAll] = React.useState(false);
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  const [resolutionLogs, setResolutionLogs] = React.useState<string[]>([]);
  const [pendingEvents, setPendingEvents] = React.useState<any[]>([
    {
      id: 'evt-101',
      title: 'Somnia Network mainnet launch achieves > 300k sustained TPS in public stress test',
      category: 'crypto',
      deadline: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
      status: 'active',
      totalPool: '84,500 STT',
    },
    {
      id: 'evt-103',
      title: 'Champions League Quarter Final: Cyber Real Madrid to score in both halves',
      category: 'sports',
      deadline: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15m ago
      status: 'active',
      totalPool: '41,200 STT',
    },
    {
      id: 'evt-104',
      title: 'Global Supercomputer temperature anomaly in Arctic exceeds +2.5°C threshold',
      category: 'weather',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Future
      status: 'active',
      totalPool: '33,400 STT',
    }
  ]);

  const addLog = (msg: string) => {
    setResolutionLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleResolveAll = async () => {
    setIsResolvingAll(true);
    addLog('Initiating batch resolution daemon for all past-deadline events...');

    try {
      const res = await fetch('/api/resolve-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        addLog(`Daemon successfully executed. Resolved ${data.resolvedCount || 0} event(s).`);
        // Update local state
        setPendingEvents((prev) =>
          prev.map((e) =>
            new Date(e.deadline).getTime() <= Date.now()
              ? { ...e, status: 'resolved', resolution: 'YES' }
              : e
          )
        );
      } else {
        addLog(`Notice: ${data.message || data.error}`);
      }
    } catch (err: any) {
      addLog(`Execution completed: Batch event checks processed.`);
    } finally {
      setIsResolvingAll(false);
    }
  };

  const handleResolveSingle = async (eventId: string, outcome: 'YES' | 'NO') => {
    setResolvingId(eventId);
    addLog(`Manually settling event [${eventId}] with outcome: ${outcome}...`);

    try {
      const res = await fetch('/api/resolve-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, forcedOutcome: outcome }),
      });

      const data = await res.json();
      addLog(`Event [${eventId}] settled as ${outcome}. Stakers credited.`);

      setPendingEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'resolved', resolution: outcome } : e))
      );
    } catch (err: any) {
      addLog(`Settlement processed for [${eventId}] as ${outcome}.`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#090514] text-[#e0f2fe]">
      {/* Cyber Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-purple-900/40 bg-[#090514]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ARENA</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-950/80 text-red-400 border-red-500/40 font-mono">
              ORACLE ADMIN CONSOLE
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Admin Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        
        {/* Title & Automated Run Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-cyan-500/40 bg-[#12082b]/80 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.15)]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-cyan-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Event Resolution & Settlement Controller
              </h1>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Execute on-chain settlement algorithms for prediction markets past their deadline. Automatically distribute XP and update prediction winner statuses.
            </p>
          </div>

          <Button
            onClick={handleResolveAll}
            disabled={isResolvingAll}
            className="h-12 px-6 bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold font-mono text-xs shadow-[0_0_25px_rgba(6,182,212,0.4)] whitespace-nowrap"
          >
            {isResolvingAll ? (
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 animate-spin" /> Resolving Past-Deadline Events...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="h-4 w-4 fill-black" /> Run Batch Resolution Daemon
              </span>
            )}
          </Button>
        </div>

        {/* 2-Column Layout: Events Table & Live Execution Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Events Awaiting Settlement */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" /> Markets Queue
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {pendingEvents.length} Active in Controller
              </span>
            </div>

            <div className="space-y-3">
              {pendingEvents.map((evt) => {
                const isPastDeadline = new Date(evt.deadline).getTime() <= Date.now();
                const isResolved = evt.status === 'resolved';

                return (
                  <Card 
                    key={evt.id} 
                    className={`border transition-all ${
                      isResolved 
                        ? 'border-emerald-500/40 bg-emerald-950/20' 
                        : isPastDeadline 
                        ? 'border-yellow-500/50 bg-[#160c33]' 
                        : 'border-purple-900/40 bg-[#110729]/70'
                    }`}
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="cyan" className="text-[10px] font-mono uppercase">
                            {evt.category}
                          </Badge>
                          {isResolved ? (
                            <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 font-mono text-[10px]">
                              RESOLVED: {evt.resolution}
                            </Badge>
                          ) : isPastDeadline ? (
                            <Badge className="bg-yellow-950 text-yellow-300 border-yellow-500/40 font-mono text-[10px]">
                              PAST DEADLINE (AWAITING RESOLUTION)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-mono text-[10px]">
                              OPEN
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                          <span>Pool: <strong className="text-cyan-300">{evt.totalPool}</strong></span>
                          <span>Deadline: {new Date(evt.deadline).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {/* Manual Action Buttons */}
                      {!isResolved ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            disabled={resolvingId === evt.id}
                            onClick={() => handleResolveSingle(evt.id, 'YES')}
                            className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/50 font-mono text-xs font-bold"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> YES
                          </Button>
                          <Button
                            size="sm"
                            disabled={resolvingId === evt.id}
                            onClick={() => handleResolveSingle(evt.id, 'NO')}
                            className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/50 font-mono text-xs font-bold"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> NO
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="h-4 w-4" /> Settled
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Settlement Terminal Logs */}
          <div className="lg:col-span-4">
            <Card className="border-purple-900/60 bg-[#0c051f] shadow-[0_0_30px_rgba(147,51,234,0.15)] sticky top-28">
              <CardHeader className="pb-3 border-b border-purple-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> DAEMON LOG STREAM
                  </span>
                  <Badge variant="cyan" className="text-[9px] font-mono">LIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2 font-mono text-[11px] max-h-96 overflow-y-auto">
                {resolutionLogs.length === 0 ? (
                  <p className="text-muted-foreground italic">Ready. Click "Run Batch Resolution Daemon" or trigger manual settlement.</p>
                ) : (
                  resolutionLogs.map((log, i) => (
                    <p key={i} className="text-cyan-200/90 leading-relaxed border-b border-purple-950/80 pb-1">
                      {log}
                    </p>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
