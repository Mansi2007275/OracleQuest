/**
 * OracleQuest Achievements & Credentials Engine
 * Evaluates player milestone conditions and awards on-chain/Supabase credential badges.
 */

import { createClient } from '@supabase/supabase-js';
import { calculateLevelFromXP } from './xp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-service-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'streak' | 'mastery' | 'rank';
  xpBonus: number;
  checkEligibility: (stats: UserAchievementStats) => boolean;
}

export interface UserAchievementStats {
  totalPredictions: number;
  totalWins: number;
  currentWinStreak: number;
  cryptoWins: number;
  sportsWins: number;
  weatherWins: number;
  politicsWins: number;
  userLevel: number;
  userXp: number;
}

export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  {
    id: 'first_prediction',
    name: 'First Prediction',
    description: 'Placed your initial prediction quest on Somnia Network.',
    icon: 'Sparkles',
    category: 'onboarding',
    xpBonus: 25,
    checkEligibility: (stats) => stats.totalPredictions >= 1,
  },
  {
    id: 'win_streak_5',
    name: '5 Win Streak',
    description: 'Predicted 5 consecutive market resolutions without a single loss.',
    icon: 'Flame',
    category: 'streak',
    xpBonus: 100,
    checkEligibility: (stats) => stats.currentWinStreak >= 5,
  },
  {
    id: 'category_master_crypto',
    name: 'Category Master: Crypto',
    description: 'Achieved 5 or more correct predictions in the Crypto & Web3 sector.',
    icon: 'Cpu',
    category: 'mastery',
    xpBonus: 75,
    checkEligibility: (stats) => stats.cryptoWins >= 5,
  },
  {
    id: 'oracle_rank_reached',
    name: 'Oracle Rank Reached',
    description: 'Attained Level 13+ and ascended to the supreme Oracle tier.',
    icon: 'Trophy',
    category: 'rank',
    xpBonus: 250,
    checkEligibility: (stats) => stats.userLevel >= 13,
  },
  {
    id: 'strategist_rank_reached',
    name: 'Strategist Rank Reached',
    description: 'Attained Level 8+ and unlocked the Strategist rank.',
    icon: 'Zap',
    category: 'rank',
    xpBonus: 150,
    checkEligibility: (stats) => stats.userLevel >= 8,
  },
  {
    id: 'century_predictor',
    name: 'Century Predictor',
    description: 'Participated in over 100 on-chain prediction markets.',
    icon: 'Award',
    category: 'mastery',
    xpBonus: 200,
    checkEligibility: (stats) => stats.totalPredictions >= 100,
  }
];

export interface UnlockedAchievement {
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
  earnedAt: string;
}

/**
 * Checks condition eligibility for all achievement badges and awards newly unlocked ones to the user.
 *
 * @param userId - Unique user ID (UUID) or wallet address
 * @returns Array of newly unlocked achievements
 */
export async function checkAndAwardAchievements(userId: string): Promise<UnlockedAchievement[]> {
  if (!userId) return [];

  try {
    // 1. Fetch user data (XP, level)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, xp, level')
      .or(`id.eq.${userId},wallet_address.ilike.${userId}`)
      .limit(1)
      .maybeSingle();

    const targetUserId = user?.id || userId;
    const userXp = user?.xp || 0;
    const userLevel = user?.level || calculateLevelFromXP(userXp);

    // 2. Fetch already unlocked achievements to avoid re-awarding
    const { data: existingAchievements } = await supabaseAdmin
      .from('achievements')
      .select('badge_name')
      .eq('user_id', targetUserId);

    const earnedBadgeNames = new Set((existingAchievements || []).map((a: any) => a.badge_name));

    // 3. Fetch user's prediction history & resolution statuses
    const { data: predictions } = await supabaseAdmin
      .from('predictions')
      .select(`
        id,
        choice,
        created_at,
        events:event_id (
          id,
          category,
          status,
          resolution
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: true });

    // 4. Compute performance metrics
    const totalPredictions = predictions?.length || 0;
    let totalWins = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let cryptoWins = 0;
    let sportsWins = 0;
    let weatherWins = 0;
    let politicsWins = 0;

    for (const pred of predictions || []) {
      const evt = (pred as any).events;
      if (evt?.status === 'resolved' && evt?.resolution) {
        const isWin = pred.choice === evt.resolution;
        if (isWin) {
          totalWins++;
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;

          const cat = (evt.category || '').toLowerCase();
          if (cat === 'crypto') cryptoWins++;
          else if (cat === 'sports') sportsWins++;
          else if (cat === 'weather') weatherWins++;
          else if (cat === 'politics') politicsWins++;
        } else {
          currentStreak = 0;
        }
      }
    }

    const stats: UserAchievementStats = {
      totalPredictions,
      totalWins,
      currentWinStreak: maxStreak,
      cryptoWins,
      sportsWins,
      weatherWins,
      politicsWins,
      userLevel,
      userXp,
    };

    const newlyUnlocked: UnlockedAchievement[] = [];
    const nowIso = new Date().toISOString();

    // 5. Evaluate against all catalog definitions
    for (const achievement of ACHIEVEMENTS_CATALOG) {
      if (!earnedBadgeNames.has(achievement.name)) {
        const isEligible = achievement.checkEligibility(stats);
        if (isEligible) {
          // Insert into Supabase `achievements` table
          try {
            await supabaseAdmin.from('achievements').insert([
              {
                user_id: targetUserId,
                badge_name: achievement.name,
                earned_at: nowIso,
              },
            ]);

            newlyUnlocked.push({
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              xpBonus: achievement.xpBonus,
              earnedAt: nowIso,
            });
          } catch (insertErr) {
            console.warn('[Achievements] Notice inserting achievement:', insertErr);
          }
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('[checkAndAwardAchievements Error]:', error);
    return [];
  }
}
