import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardXP } from '@/lib/xp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-service-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const DAILY_QUEST_DEFINITIONS = [
  {
    id: 'quest_predict_daily',
    title: 'Make 1 prediction today',
    description: 'Stake on any active prediction event in the arena.',
    xpReward: 20,
    icon: 'Zap',
  },
  {
    id: 'quest_use_ai_research',
    title: 'Use the AI research assistant',
    description: 'Inspect Bull/Bear multi-agent debate or ask a question.',
    xpReward: 15,
    icon: 'Bot',
  },
  {
    id: 'quest_new_category',
    title: 'Predict in a new category',
    description: 'Diversify into a category you have not staked in today.',
    xpReward: 25,
    icon: 'Compass',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '0x94f2...c120';
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch quests completed today from `quests_log`
    const { data: logs, error } = await supabaseAdmin
      .from('quests_log')
      .select('quest_id, completed_at, xp_awarded')
      .eq('user_id', userId)
      .eq('quest_date', dateStr);

    const completedQuestIds = new Set((logs || []).map((l: any) => l.quest_id));

    const questsWithStatus = DAILY_QUEST_DEFINITIONS.map((q) => ({
      ...q,
      isCompleted: completedQuestIds.has(q.id),
    }));

    return NextResponse.json({
      success: true,
      date: dateStr,
      quests: questsWithStatus,
      completedCount: completedQuestIds.size,
      totalCount: DAILY_QUEST_DEFINITIONS.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load daily quests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, questId } = body as { userId?: string; questId?: string };

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'questId is required' },
        { status: 400 }
      );
    }

    const effectiveUserId = userId || '0x94f2...c120';
    const dateStr = new Date().toISOString().split('T')[0];

    const questDef = DAILY_QUEST_DEFINITIONS.find((q) => q.id === questId);
    if (!questDef) {
      return NextResponse.json(
        { success: false, error: 'Invalid quest identifier' },
        { status: 404 }
      );
    }

    // Check if already claimed today
    const { data: existing } = await supabaseAdmin
      .from('quests_log')
      .select('id')
      .eq('user_id', effectiveUserId)
      .eq('quest_id', questId)
      .eq('quest_date', dateStr)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        message: 'Quest already claimed for today.',
        quest: questDef,
      });
    }

    // 1. Log to `quests_log` in Supabase
    try {
      await supabaseAdmin.from('quests_log').insert([
        {
          user_id: effectiveUserId,
          quest_id: questId,
          quest_date: dateStr,
          xp_awarded: questDef.xpReward,
          completed_at: new Date().toISOString(),
        },
      ]);
    } catch (insertErr) {
      console.warn('[DailyQuests] Notice inserting quests_log:', insertErr);
    }

    // 2. Award Bonus XP
    const xpResult = await awardXP(
      effectiveUserId,
      questDef.xpReward,
      `Daily Quest Completed: ${questDef.title}`
    );

    return NextResponse.json({
      success: true,
      completed: true,
      questId,
      xpAwarded: questDef.xpReward,
      totalXp: xpResult.newXp,
      newLevel: xpResult.newLevel,
      newRank: xpResult.newRank,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error claiming daily quest' },
      { status: 500 }
    );
  }
}
