import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getBullAnalysis, getBearAnalysis, getRiskAnalysis } from '@/lib/agents';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-oraclequest-id.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-service-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventId, eventTitle, eventDescription, forceRefresh } = body as {
      eventId?: string;
      eventTitle?: string;
      eventDescription?: string;
      forceRefresh?: boolean;
    };

    if (!eventId || !eventTitle) {
      return NextResponse.json(
        { success: false, error: 'eventId and eventTitle are required' },
        { status: 400 }
      );
    }

    const description = eventDescription || eventTitle;

    // 1. Check Supabase Cache in `ai_analyses` table unless forceRefresh is true
    if (!forceRefresh) {
      try {
        const { data: cachedData, error: cacheError } = await supabaseAdmin
          .from('ai_analyses')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cachedData && !cacheError) {
          // Parse out individual confidence scores if stored in JSON or default
          return NextResponse.json({
            success: true,
            cached: true,
            analysis: {
              bull: {
                text: cachedData.bull_analysis,
                confidenceScore: Math.round(Number(cachedData.confidence_score) || 78),
              },
              bear: {
                text: cachedData.bear_analysis,
                confidenceScore: Math.round((100 - Number(cachedData.confidence_score)) || 65),
              },
              risk: {
                text: cachedData.risk_analysis,
                confidenceScore: 58,
              },
              averageConfidence: Number(cachedData.confidence_score) || 75,
              created_at: cachedData.created_at,
            },
          });
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed, proceeding to live agent synthesis:', cacheErr);
      }
    }

    // 2. Run Bull, Bear, and Risk agents in parallel
    const [bullResult, bearResult, riskResult] = await Promise.all([
      getBullAnalysis(eventTitle, description),
      getBearAnalysis(eventTitle, description),
      getRiskAnalysis(eventTitle, description),
    ]);

    const avgConfidence = Math.round((bullResult.confidenceScore + bearResult.confidenceScore + riskResult.confidenceScore) / 3);

    // 3. Cache results to Supabase `ai_analyses` table
    try {
      await supabaseAdmin.from('ai_analyses').insert([
        {
          event_id: eventId,
          bull_analysis: bullResult.text,
          bear_analysis: bearResult.text,
          risk_analysis: riskResult.text,
          confidence_score: avgConfidence,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (insertErr) {
      console.warn('Failed to cache AI analysis to Supabase:', insertErr);
    }

    return NextResponse.json({
      success: true,
      cached: false,
      analysis: {
        bull: bullResult,
        bear: bearResult,
        risk: riskResult,
        averageConfidence: avgConfidence,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error generating AI research analysis' },
      { status: 500 }
    );
  }
}
