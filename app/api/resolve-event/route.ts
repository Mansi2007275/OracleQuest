import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateResolutionPostMortem, generatePersonalizedUserFeedback } from '@/lib/agents';
import { awardXP, XP_REWARDS, isEarlyResearchPrediction } from '@/lib/xp';
import { checkAndAwardAchievements } from '@/lib/achievements';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-service-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventId, forcedOutcome } = body as { eventId?: string; forcedOutcome?: 'YES' | 'NO' };

    const nowIso = new Date().toISOString();

    // 1. Fetch eligible events: past deadline and status in ('active', 'open')
    let query = supabaseAdmin
      .from('events')
      .select('*')
      .in('status', ['active', 'open']);

    if (eventId) {
      query = query.eq('id', eventId);
    } else {
      query = query.lte('deadline', nowIso);
    }

    const { data: eventsToResolveData, error: fetchError } = await query;
    let eventsToResolve: any[] = [];

    if (fetchError) {
      console.warn('[ResolveEvent] Notice fetching from Supabase (falling back to mock/event catalog):', fetchError.message);
      // Fallback for local demo/development
      eventsToResolve = [
        {
          id: eventId || 'evt-101',
          title: eventId === 'evt-103' ? 'Champions League Quarter Final' : 'Somnia Network TPS Milestone Benchmark',
          description: 'Automated settlement evaluation for Somnia blockchain metrics',
        },
      ];
    } else if (eventsToResolveData && eventsToResolveData.length > 0) {
      eventsToResolve = eventsToResolveData;
    }

    if (!eventsToResolve || eventsToResolve.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending past-deadline events found to resolve.',
        resolvedCount: 0,
        resolvedEvents: [],
      });
    }

    const resolvedResults = [];

    for (const evt of eventsToResolve) {
      // Determine final outcome: passed in outcome OR default random settlement
      const outcome: 'YES' | 'NO' = forcedOutcome || (Math.random() > 0.4 ? 'YES' : 'NO');

      // Generate AI event-wide post-mortem
      const postMortemExplanation = await generateResolutionPostMortem(
        evt.title,
        evt.description || '',
        outcome
      );

      // Update event status to 'resolved' and record resolution
      await supabaseAdmin
        .from('events')
        .update({
          status: 'resolved',
          resolution: outcome,
          updated_at: new Date().toISOString(),
        })
        .eq('id', evt.id);

      // Fetch all predictions on this event
      const { data: predictions } = await supabaseAdmin
        .from('predictions')
        .select('*')
        .eq('event_id', evt.id);

      let winnersCount = 0;
      let losersCount = 0;

      if (predictions && predictions.length > 0) {
        for (const pred of predictions) {
          const isWinner = pred.choice === outcome;
          if (isWinner) {
            winnersCount++;
            if (pred.user_id) {
              const isEarly = isEarlyResearchPrediction(pred.created_at || new Date(), evt.deadline);
              const xpGain = isEarly 
                ? XP_REWARDS.CORRECT_PREDICTION + XP_REWARDS.EARLY_RESEARCH_BONUS 
                : XP_REWARDS.CORRECT_PREDICTION;
              const reason = isEarly
                ? `Won prediction on "${evt.title.slice(0, 35)}..." (+50 XP + 5 XP Early Research Bonus)`
                : `Won prediction on "${evt.title.slice(0, 35)}..." (+50 XP)`;

              try {
                await awardXP(pred.user_id, xpGain, reason);
              } catch (_) {}
            }
          } else {
            losersCount++;
          }

          // Generate personalized explanation for this user compared to Bull/Bear/Risk theses
          const personalizedFeedback = await generatePersonalizedUserFeedback(
            evt.title,
            pred.choice,
            outcome,
            postMortemExplanation
          );

          try {
            await supabaseAdmin
              .from('predictions')
              .update({
                ai_summary: personalizedFeedback,
              })
              .eq('id', pred.id);
          } catch (_) {}

          // Check & award new achievement badges if earned
          if (pred.user_id) {
            try {
              await checkAndAwardAchievements(pred.user_id);
            } catch (_) {}
          }
        }
      }

      resolvedResults.push({
        eventId: evt.id,
        title: evt.title,
        resolution: outcome,
        explanation: postMortemExplanation,
        totalPredictions: predictions?.length || 0,
        winners: winnersCount,
        losers: losersCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully resolved ${resolvedResults.length} event(s).`,
      resolvedCount: resolvedResults.length,
      resolvedEvents: resolvedResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error while resolving events' },
      { status: 500 }
    );
  }
}
