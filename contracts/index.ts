/**
 * Somnia Network EventContract ABI & Address Configurations
 */

export const EVENT_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'createEvent',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'eventId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'placePrediction',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'choice', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'resolveEvent',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'outcome', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimReward',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getUserPosition',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [
      { name: 'yesStake', type: 'uint256' },
      { name: 'noStake', type: 'uint256' },
      { name: 'claimed', type: 'bool' },
      { name: 'claimableReward', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'events',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'deadline', type: 'uint256' },
      { name: 'totalYesPool', type: 'uint256' },
      { name: 'totalNoPool', type: 'uint256' },
      { name: 'isResolved', type: 'bool' },
      { name: 'outcome', type: 'bool' },
      { name: 'creator', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'admin',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'EventCreated',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'title', type: 'string', indexed: false },
      { name: 'deadline', type: 'uint256', indexed: false },
      { name: 'creator', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'PredictionPlaced',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'predictor', type: 'address', indexed: true },
      { name: 'choice', type: 'bool', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'EventResolved',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'outcome', type: 'bool', indexed: false },
      { name: 'totalYesPool', type: 'uint256', indexed: false },
      { name: 'totalNoPool', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'RewardClaimed',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'predictor', type: 'address', indexed: true },
      { name: 'rewardAmount', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const EVENT_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  '0xDd8046b60d5B66D0d6583bb42971fA5233f97C25';

