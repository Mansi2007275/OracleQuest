const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'mock-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('========================================================');
  console.log('🌱 Seeding OracleQuest Demo Data into Supabase...');
  console.log('========================================================\n');
  console.log(`Supabase Endpoint: ${supabaseUrl}\n`);

  // 1. Demo Users
  const usersData = [
    {
      wallet_address: '0x94f271a3c42a863d64c1209b4510bc4a9d70c120',
      username: 'OracleMaster_X',
      xp: 14800,
      level: 13,
      rank: 'Oracle',
    },
    {
      wallet_address: '0x31a89c42b109e4510bc4a9d70c1209b4510bc48e1',
      username: 'CyberAnalyst_99',
      xp: 1250,
      level: 4,
      rank: 'Analyst',
    },
    {
      wallet_address: '0x71e549102b4a501239c871239c0912384910123f',
      username: 'SomniaRookie',
      xp: 250,
      level: 2,
      rank: 'Beginner',
    },
  ];

  console.log('👤 Seeding Demo Users...');
  const seededUsers = [];
  for (const user of usersData) {
    // Try full schema first, fall back to basic wallet_address if schema differs
    let { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error && error.message.includes('column')) {
      const basicUser = { wallet_address: user.wallet_address };
      const fallback = await supabase
        .from('users')
        .upsert(basicUser, { onConflict: 'wallet_address' })
        .select()
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.warn(`  ⚠️ User note (${user.username}): ${error.message}`);
    } else {
      seededUsers.push(data || { id: user.wallet_address, wallet_address: user.wallet_address });
      console.log(`  ✅ User seeded: ${user.username} (${user.wallet_address.slice(0, 10)}...)`);
    }
  }

  const primaryUserId = seededUsers[0]?.id || seededUsers[0]?.wallet_address || null;

  // 2. Demo Events (6 realistic events across Crypto, Sports, Weather, Politics)
  const now = new Date();
  const eventsData = [
    {
      title: 'Somnia Network mainnet launch achieves > 300k sustained TPS in public stress test',
      category: 'crypto',
      description:
        'Verifies whether official stress test metrics published on the Somnia Block Explorer indicate sustained execution exceeding 300,000 TPS under concurrent smart contract load.',
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: primaryUserId,
    },
    {
      title: 'Autonomous AI Hedge Agent manages over $10M TVL across EVM liquidity pools',
      category: 'crypto',
      description:
        'Settles YES if verified on-chain analytics track multi-agent liquidity pools holding >= $10,000,000 USD cumulative TVL before the deadline.',
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: primaryUserId,
    },
    {
      title: 'Champions League Quarter Final: Cyber Real Madrid to score in both halves',
      category: 'sports',
      description:
        'Settles YES if Real Madrid scores at least 1 goal during regulation 1st half and 1 goal during regulation 2nd half.',
      deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: primaryUserId,
    },
    {
      title: 'US Federal Reserve cuts interest rates by 50bps at upcoming FOMC meeting',
      category: 'politics',
      description:
        'Resolves YES if the official Federal Reserve press release confirms an interest rate reduction of 50 basis points or more.',
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: primaryUserId,
    },
    {
      title: 'Global High-Altitude Solar Array records thermal output > 1.2 Terawatts in Saharan Grid',
      category: 'weather',
      description:
        'Resolves YES if the North African Clean Energy Sensor Array logs continuous solar generation exceeding 1.2 Terawatts for 48 consecutive hours.',
      deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: primaryUserId,
    },
    {
      title: 'Somnia Shannon Testnet processes over 1 Billion total transactions',
      category: 'crypto',
      description:
        'Resolves YES if the Shannon Testnet block height and cumulative transaction count cross 1,000,000,000 prior to the deadline.',
      deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
      resolution: 'YES',
      created_by: primaryUserId,
    },
  ];

  console.log('\n🎯 Seeding Demo Events...');
  const seededEvents = [];
  for (const evt of eventsData) {
    const payload = primaryUserId ? evt : { ...evt, created_by: null };
    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn(`  ⚠️ Event insert note ("${evt.title.slice(0, 30)}..."): ${error.message}`);
    } else {
      seededEvents.push(data);
      console.log(`  ✅ Event seeded [${data.category.toUpperCase()}]: "${data.title.slice(0, 45)}..." (${data.status})`);
    }
  }

  // 3. Demo Predictions for Seeded Users
  if (seededEvents.length > 0) {
    console.log('\n🔮 Seeding Demo Predictions & On-Chain Proof Hashes...');
    const predictionsData = [
      {
        user_id: primaryUserId,
        event_id: seededEvents[0].id,
        choice: 'YES',
        tx_hash: '0x8f2a91b4c30291e8471029384710294871029384',
        ai_summary: 'Spot-on call! Parallel execution scaling surpassed 300k TPS with IceDB compiler optimizations.',
      },
      {
        user_id: primaryUserId,
        event_id: seededEvents[5]?.id || seededEvents[0].id,
        choice: 'YES',
        tx_hash: '0x3c714e80a1b2c3d4e5f678901234567890abcdef',
        ai_summary: 'Vindicated Bull thesis! Testnet transaction throughput crossed 1B milestone with sub-second finality.',
      },
    ];

    for (const pred of predictionsData) {
      if (!pred.event_id) continue;
      const { error } = await supabase.from('predictions').upsert(pred, { onConflict: 'user_id,event_id' });
      if (error) {
        console.warn(`  ⚠️ Prediction insert note: ${error.message}`);
      } else {
        console.log(`  ✅ Seeded prediction [Tx: ${pred.tx_hash.slice(0, 10)}...]`);
      }
    }
  }

  // 4. Demo AI Research Analyses
  if (seededEvents.length > 0) {
    console.log('\n🤖 Seeding Multi-Agent AI Research Syntheses...');
    for (const event of seededEvents) {
      const aiPayload = {
        event_id: event.id,
        bull_analysis: `Bull Agent Thesis for "${event.title}": High probability backed by Somnia Multi-Stream Consensus & ultra-low latency transaction benchmarks.`,
        bear_analysis: `Bear Agent Thesis: Potential latency spikes under extreme peak network stress could delay finality criteria.`,
        risk_analysis: `Risk Evaluation: Moderate macro volatility. On-chain validation mechanisms operate with 99.4% confidence rating.`,
        confidence_score: Math.floor(65 + Math.random() * 25),
      };

      const { error } = await supabase.from('ai_analyses').insert(aiPayload);
      if (error) {
        console.warn(`  ⚠️ AI Analysis seed note: ${error.message}`);
      } else {
        console.log(`  ✅ AI Research Analysis created for event ID: ${event.id.slice(0, 8)}...`);
      }
    }
  }

  console.log('\n========================================================');
  console.log('🎉 OracleQuest Seed Script Process Executed!');
  console.log('💡 Note: To create full SQL tables in Supabase, execute:');
  console.log('   supabase/migrations/20250101000000_oraclequest_schema.sql');
  console.log('   in your Supabase Dashboard -> SQL Editor.');
  console.log('========================================================\n');
}

seed().catch((err) => {
  console.error('\n❌ Seed Script Failed:', err);
  process.exit(1);
});

