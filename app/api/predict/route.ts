import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardXP, XP_REWARDS } from '@/lib/xp';
import { checkAndAwardAchievements } from '@/lib/achievements';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-service-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, eventId, choice, txHash } = body as {
      userId?: string;
      eventId?: string;
      choice?: 'YES' | 'NO';
      txHash?: string;
    };

    if (!eventId || !choice) {
      return NextResponse.json(
        { success: false, error: 'eventId and choice (YES/NO) are required' },
        { status: 400 }
      );
    }

    const effectiveUserId = userId || '0x94f2...c120';
    const nowIso = new Date().toISOString();

    // 1. Insert prediction into Supabase
    const { data: prediction, error: insertError } = await supabaseAdmin
      .from('predictions')
      .insert([
        {
          user_id: effectiveUserId,
          event_id: eventId,
          choice,
          tx_hash: txHash || `0x${Date.now()}`,
          ai_summary: 'Active prediction recorded on-chain. Post-mortem analysis will generate upon settlement.',
          created_at: nowIso,
        },
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn('Prediction insert warning:', insertError.message);
    }

    // 2. Award +10 XP for participating/making a prediction
    const xpResult = await awardXP(
      effectiveUserId,
      XP_REWARDS.PLACE_PREDICTION,
      `Placed prediction on quest #${eventId}`
    );

    // 3. Check and award achievements (e.g. "First Prediction")
    const newAchievements = await checkAndAwardAchievements(effectiveUserId);

    return NextResponse.json({
      success: true,
      prediction: prediction || { id: `pred-${Date.now()}`, event_id: eventId, choice },
      xpAwarded: XP_REWARDS.PLACE_PREDICTION,
      userLevel: xpResult.newLevel,
      userRank: xpResult.newRank,
      totalXp: xpResult.newXp,
      newAchievements,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error processing prediction' },
      { status: 500 }
    );
  }
}
