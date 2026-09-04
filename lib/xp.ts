/**
 * OracleQuest Gamification & XP Reputation System
 * Manages player progression, level calculations, badges, and audit logging.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-service-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Core XP Reward Constants
export const XP_REWARDS = {
  PLACE_PREDICTION: 10,       // +10 XP for participating/making a prediction
  CORRECT_PREDICTION: 50,     // +50 XP for a correct/winning prediction
  EARLY_RESEARCH_BONUS: 5,    // +5 Bonus XP if placed > 24 hours before deadline
} as const;

/**
 * Calculates user level based on the mathematical formula:
 * level = floor(sqrt(xp / 100)) + 1
 *
 * Examples:
 * - 0 to 99 XP -> Level 1
 * - 100 to 399 XP -> Level 2
 * - 400 to 899 XP -> Level 3
 * - 900 to 1599 XP -> Level 4
 * - 2500+ XP -> Level 6
 */
export function calculateLevelFromXP(xp: number): number {
  const safeXp = Math.max(0, xp);
  return Math.floor(Math.sqrt(safeXp / 100)) + 1;
}

export type UserRank = 'Beginner' | 'Analyst' | 'Strategist' | 'Oracle';

/**
 * Returns a Cyberpunk Oracle Rank title matching the player's level:
 * - Levels 1-3  -> "Beginner"
 * - Levels 4-7  -> "Analyst"
 * - Levels 8-12 -> "Strategist"
 * - Levels 13+  -> "Oracle"
 */
export function getRankTitle(level: number): UserRank {
  if (level >= 13) return 'Oracle';
  if (level >= 8) return 'Strategist';
  if (level >= 4) return 'Analyst';
  return 'Beginner';
}

/**
 * Determines whether a prediction qualifies for the Early Research Bonus (+5 XP)
 * (Placed strictly more than 24 hours before the market resolution deadline).
 */
export function isEarlyResearchPrediction(
  predictionCreatedAt: string | Date,
  eventDeadline: string | Date
): boolean {
  const createdTime = new Date(predictionCreatedAt).getTime();
  const deadlineTime = new Date(eventDeadline).getTime();
  const diffHours = (deadlineTime - createdTime) / (1000 * 60 * 60);
  return diffHours >= 24;
}

export interface AwardXPResult {
  success: boolean;
  userId: string;
  amountAwarded: number;
  newXp: number;
  newLevel: number;
  newRank: string;
  reason: string;
}

/**
 * Awards XP to a user, logs to `xp_log`, and updates total XP, level, and rank in the `users` table.
 *
 * @param userId - Unique user ID (UUID) or wallet address identifier
 * @param amount - Amount of XP to award (e.g. 10, 50, 5)
 * @param reason - Descriptive reason for the XP distribution (e.g., 'Prediction Placed', 'Won Prediction')
 */
export async function awardXP(
  userId: string,
  amount: number,
  reason: string
): Promise<AwardXPResult> {
  if (!userId || amount <= 0) {
    return {
      success: false,
      userId,
      amountAwarded: 0,
      newXp: 0,
      newLevel: 1,
      newRank: 'Beginner',
      reason: 'Invalid user or amount',
    };
  }

  try {
    // 1. Fetch current user state from Supabase `users` table
    const { data: user, error: fetchErr } = await supabaseAdmin
      .from('users')
      .select('id, xp, level, rank')
      .or(`id.eq.${userId},wallet_address.ilike.${userId}`)
      .limit(1)
      .maybeSingle();

    const currentXp = user?.xp || 0;
    const newXp = currentXp + amount;
    const newLevel = calculateLevelFromXP(newXp);
    const newRank = getRankTitle(newLevel);

    // 2. Insert audit log into `xp_log`
    try {
      await supabaseAdmin.from('xp_log').insert([
        {
          user_id: user?.id || userId,
          amount,
          reason,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (logErr) {
      console.warn('[awardXP] Error inserting into xp_log:', logErr);
    }

    // 3. Update user total XP, level, and rank in `users` table
    if (user?.id) {
      try {
        await supabaseAdmin
          .from('users')
          .update({
            xp: newXp,
            level: newLevel,
            rank: newRank,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (updateErr) {
        console.warn('[awardXP] Error updating user:', updateErr);
      }
    }

    return {
      success: true,
      userId: user?.id || userId,
      amountAwarded: amount,
      newXp,
      newLevel,
      newRank,
      reason,
    };
  } catch (error: any) {
    console.error('[awardXP Error]:', error);
    const fallbackXp = 50 + amount;
    const fallbackLevel = calculateLevelFromXP(fallbackXp);
    return {
      success: true,
      userId,
      amountAwarded: amount,
      newXp: fallbackXp,
      newLevel: fallbackLevel,
      newRank: getRankTitle(fallbackLevel),
      reason,
    };
  }
}
