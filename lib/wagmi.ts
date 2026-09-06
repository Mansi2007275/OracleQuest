import { http, createConfig } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

const somniaRpcUrl =
  process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
const somniaChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 50312);
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Log env configuration during initialization for developer verification
if (typeof window !== 'undefined') {
  console.log('[Wagmi Init] Somnia Chain ID:', somniaChainId);
  console.log('[Wagmi Init] Somnia RPC URL:', somniaRpcUrl);
  console.log('[Wagmi Init] Contract Address:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
}

// ─────────────────────────────────────────────────────────────────
// Somnia Shannon Testnet (Chain ID: 50312)
// ─────────────────────────────────────────────────────────────────
export const somniaTestnet = defineChain({
  id: somniaChainId,
  name: 'Somnia Shannon Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [somniaRpcUrl],
    },
    public: {
      http: [somniaRpcUrl],
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
// Connectors setup: Injected (MetaMask, Brave, Phantom, Rabby, etc.), WalletConnect (optional)
// ─────────────────────────────────────────────────────────────────
const connectors = [
  injected(),
];


if (walletConnectProjectId) {
  connectors.push(walletConnect({ projectId: walletConnectProjectId }));
}


// ─────────────────────────────────────────────────────────────────
// Wagmi Config — SSR enabled for Next.js App Router
// ─────────────────────────────────────────────────────────────────
export const config = createConfig({
  chains: [somniaTestnet, mainnet, sepolia],
  connectors,
  transports: {
    [somniaTestnet.id]: http(somniaRpcUrl),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

