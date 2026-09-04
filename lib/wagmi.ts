import { http, createConfig } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// ─────────────────────────────────────────────────────────────────
// Somnia Shannon Testnet (Chain ID: 50312)
// ─────────────────────────────────────────────────────────────────
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Shannon Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
});

// ─────────────────────────────────────────────────────────────────
// Wagmi Config — MetaMask + Injected (Brave, etc.) connectors
// SSR enabled for Next.js App Router
// ─────────────────────────────────────────────────────────────────
export const config = createConfig({
  chains: [somniaTestnet, mainnet, sepolia],
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [somniaTestnet.id]: http('https://dream-rpc.somnia.network'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
