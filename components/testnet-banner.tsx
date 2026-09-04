'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';

export function TestnetBanner() {
  return (
    <aside
      aria-label="Somnia Testnet Banner"
      className="w-full bg-[#F5FF00] border-b-3 border-black text-black text-xs font-mono font-black py-2 px-4 relative z-[100] uppercase select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
          </span>

          <span className="font-black text-black shrink-0">SOMNIA SHANNON TESTNET:</span>

          <span className="text-black font-extrabold truncate">
            Active on Somnia Testnet (STT Test Tokens & Contracts)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-black font-black">
          <span className="bg-[#8A2BE2] text-white px-2 py-0.5 rounded-sm border-2 border-black font-black">
            CHAIN ID: 50312
          </span>
          <a
            href="https://shannon-explorer.somnia.network"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline font-black"
          >
            <span>Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}

