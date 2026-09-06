'use client';

import * as React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { somniaTestnet } from '@/lib/wagmi';
import {
  Wallet,
  ChevronDown,
  LogOut,
  Copy,
  CheckCheck,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Zap,
} from 'lucide-react';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function makeExplorerUrl(address: string) {
  return `https://shannon-explorer.somnia.network/address/${address}`;
}

export function ConnectWalletButton() {
  const [mounted, setMounted] = React.useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [connectError, setConnectError] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isWrongNetwork = isConnected && chainId !== somniaTestnet.id;
  const isLoading = isConnecting || isPending;

  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-2 h-10 px-5 rounded-sm font-mono text-xs font-black uppercase tracking-wider border-3 border-black bg-[#F5FF00] text-black opacity-80 cursor-wait"
      >
        <Wallet className="h-4 w-4 shrink-0" />
        <span>Connect Wallet</span>
      </button>
    );
  }


  async function handleCopy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSwitchNetwork() {
    try {
      switchChain({ chainId: somniaTestnet.id });
      setDropdownOpen(false);
    } catch (err: any) {
      console.error('[Network Switch Error]:', err);
      setConnectError('Failed to switch network. Please switch to Somnia in MetaMask.');
      setTimeout(() => setConnectError(null), 5000);
    }
  }

  async function handleConnect() {
    setConnectError(null);
    // Select first available injected/browser connector
    const connector = connectors[0];


    if (!connector) {
      const msg = 'No EVM wallet extension detected. Please install MetaMask.';
      console.error('[WalletConnect Error]', msg);
      setConnectError(msg);
      setTimeout(() => setConnectError(null), 5000);
      return;
    }

    try {
      console.log(`[WalletConnect] Attempting connection via ${connector.name} (${connector.id})...`);
      await connectAsync({ connector });
      console.log('[WalletConnect] Successfully connected!');
    } catch (err: any) {
      console.error('[WalletConnect Exception]:', err);
      const isUserRejected = err?.message?.toLowerCase().includes('reject') || err?.code === 4001;
      const msg = isUserRejected
        ? 'Connection request was rejected by user.'
        : err?.message || 'Wallet connection failed. Check extension status.';
      setConnectError(msg);
      setTimeout(() => setConnectError(null), 5000);
    }
  }

  // ── Not connected: show Connect button ─────────────────────────
  if (!isConnected) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`
            flex items-center gap-2 h-10 px-5 rounded-sm font-mono text-xs font-black uppercase tracking-wider
            border-3 border-black bg-[#F5FF00] text-black shadow-[4px_4px_0px_#000000]
            hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000]
            disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all
          `}
          id="connect-wallet-btn"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Wallet className="h-4 w-4 shrink-0" />
          )}
          <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>

        {connectError && (
          <div className="absolute right-0 top-12 z-50 w-72 p-2.5 rounded-sm border-2 border-black bg-[#FF3EA5] text-white text-[11px] font-mono font-bold shadow-[4px_4px_0px_#000000] animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="font-black uppercase">Wallet Error</span>
            </div>
            {connectError}
          </div>
        )}
      </div>
    );
  }

  // ── Wrong network: show Switch Network button ──────────────────
  if (isWrongNetwork) {
    return (
      <button
        onClick={handleSwitchNetwork}
        className="flex items-center gap-2 h-10 px-4 rounded-sm font-mono text-xs font-black uppercase tracking-wider
          border-3 border-black bg-[#FF3EA5] text-white shadow-[4px_4px_0px_#000000]
          hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5
          active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all"
        id="switch-network-btn"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Switch to Somnia</span>
      </button>
    );
  }

  // ── Connected + correct network: show address dropdown ─────────
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={`
          flex items-center gap-2 h-10 px-4 rounded-sm font-mono text-xs font-black
          border-3 border-black bg-[#00F0FF] text-black shadow-[4px_4px_0px_#000000]
          hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5
          active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all
        `}
        id="wallet-dropdown-trigger"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
        </span>

        <span>{address ? truncateAddress(address) : '...'}</span>

        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 top-12 z-[200] w-64
            rounded-sm border-3 border-black bg-white
            shadow-[6px_6px_0px_#000000] overflow-hidden text-black"
        >
          <div className="px-4 pt-4 pb-3 border-b-3 border-black bg-[#FAF8F5]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Network</span>
              <div className="flex items-center gap-1.5 bg-[#8A2BE2] text-white px-2 py-0.5 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000000]">
                <Zap className="h-2.5 w-2.5 text-[#F5FF00]" />
                <span className="text-[10px] font-black font-mono">Somnia Testnet</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b-3 border-black">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">Address</p>
            <p className="text-[11px] font-bold font-mono text-black break-all leading-relaxed">
              {address}
            </p>
          </div>

          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-sm
                text-xs font-mono font-bold text-black bg-white hover:bg-[#F5FF00] border-2 border-transparent hover:border-black transition-all text-left"
              id="copy-address-btn"
            >
              {copied ? (
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>

            <a
              href={address ? makeExplorerUrl(address) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-sm
                text-xs font-mono font-bold text-black bg-white hover:bg-[#00F0FF] border-2 border-transparent hover:border-black transition-all"
              id="view-explorer-btn"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span>View on Explorer</span>
            </a>

            <div className="my-1 border-t-2 border-black" />

            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-sm
                text-xs font-mono font-bold text-white bg-[#FF3EA5] border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-[#FF4D4D] transition-all text-left"
              id="disconnect-wallet-btn"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

