require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const SOMNIA_RPC_URL =
  process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
const SOMNIA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 50312);
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const accounts =
  PRIVATE_KEY && PRIVATE_KEY.length >= 64
    ? [PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`]
    : [];

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    somnia: {
      url: SOMNIA_RPC_URL,
      chainId: SOMNIA_CHAIN_ID,
      accounts: accounts.length > 0 ? accounts : undefined,
      gasPrice: 'auto',
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  etherscan: {
    customChains: [
      {
        network: 'somnia',
        chainId: SOMNIA_CHAIN_ID,
        urls: {
          apiURL: 'https://shannon-explorer.somnia.network/api',
          browserURL: 'https://shannon-explorer.somnia.network',
        },
      },
    ],
  },
};

module.exports = config;
