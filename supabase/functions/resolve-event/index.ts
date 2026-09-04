// @ts-nocheck
// Supabase Edge Function: resolve-event
// Serves as an automated settlement daemon for OracleQuest on Somnia Network

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { eventId, forcedOutcome } = await req.json().catch(() => ({}));
    const nowIso = new Date().toISOString();

    // 1. Fetch eligible open/active events past deadline
    let query = supabaseClient
      .from('events')
      .select('*')
      .in('status', ['active', 'open']);

    if (eventId) {
      query = query.eq('id', eventId);
    } else {
      query = query.lte('deadline', nowIso);
    }

    const { data: events, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const resolved = [];

    for (const evt of events || []) {
      const outcome = forcedOutcome || (Math.random() > 0.5 ? 'YES' : 'NO');

      // Update event
      await supabaseClient
        .from('events')
        .update({
          status: 'resolved',
          resolution: outcome,
          updated_at: new Date().toISOString(),
        })
        .eq('id', evt.id);

      // Settle predictions & update winners
      const { data: predictions } = await supabaseClient
        .from('predictions')
        .select('*')
        .eq('event_id', evt.id);

      for (const pred of predictions || []) {
        const won = pred.choice === outcome;
        if (won && pred.user_id) {
          // Log XP reward
          await supabaseClient.from('xp_log').insert({
            user_id: pred.user_id,
            amount: 150,
            reason: `Won prediction on "${evt.title.slice(0, 40)}"`,
          });
        }

        await supabaseClient
          .from('predictions')
          .update({
            ai_summary: won ? 'WINNER: Staking payout executed' : 'LOST',
          })
          .eq('id', pred.id);
      }

      resolved.push({ id: evt.id, title: evt.title, outcome });
    }

    return new Response(
      JSON.stringify({ success: true, count: resolved.length, resolved }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
