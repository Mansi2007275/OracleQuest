/**
 * Seed the deployed EventContract with prediction market events
 * so that placePrediction() calls don't revert.
 */
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xDd8046b60d5B66D0d6583bb42971fA5233f97C25';
const RPC_URL = process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ABI = [
  'function createEvent(string title, uint256 deadline) external returns (uint256)',
  'function eventCount() view returns (uint256)',
  'function events(uint256) view returns (uint256 id, string title, uint256 deadline, uint256 totalYesPool, uint256 totalNoPool, bool isResolved, bool outcome, address creator)',
];

// Events to seed — deadlines set 7 days from now
const SEED_EVENTS = [
  'Somnia Network mainnet launch achieves > 300k sustained TPS in public stress test',
  'Autonomous AI Hedge Agent manages over $10M TVL across EVM liquidity pools',
  'Champions League Quarter Final: Cyber Real Madrid to score in both halves',
  'Global ocean surface temp anomaly exceeds +1.8C in Q3 satellite readings',
  'US Federal Reserve implements emergency 50bp rate cut before next scheduled FOMC',
  'Bitcoin breaks $150k ATH before end of Q3 2025',
];

async function main() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not set in .env.local');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(
    PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`,
    provider
  );
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  console.log('========================================================');
  console.log('🌱 Seeding EventContract with prediction markets...');
  console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`👤 Admin: ${wallet.address}`);
  console.log('========================================================\n');

  // Check existing events
  const currentCount = await contract.eventCount();
  console.log(`Current event count: ${currentCount.toString()}\n`);

  if (Number(currentCount) >= SEED_EVENTS.length) {
    console.log('✅ Events already seeded! Listing existing events:\n');
    for (let i = 1; i <= Number(currentCount); i++) {
      const evt = await contract.events(i);
      console.log(`  Event #${i}: "${evt.title}"`);
      console.log(`    Deadline: ${new Date(Number(evt.deadline) * 1000).toISOString()}`);
    }
    return;
  }

  // Create events with deadline = 7 days from now
  const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  for (let i = Number(currentCount); i < SEED_EVENTS.length; i++) {
    const title = SEED_EVENTS[i];
    console.log(`Creating event #${i + 1}: "${title.slice(0, 60)}..."`);

    try {
      const tx = await contract.createEvent(title, deadline);
      console.log(`  ⏳ Tx: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`  ✅ Confirmed in block ${receipt.blockNumber}\n`);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}\n`);
    }
  }

  const finalCount = await contract.eventCount();
  console.log('========================================================');
  console.log(`🎉 Done! Total events on contract: ${finalCount.toString()}`);
  console.log('========================================================');
}

main().catch(console.error);
