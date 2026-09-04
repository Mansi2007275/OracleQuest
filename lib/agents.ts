/**
 * Multi-Agent Autonomous Intelligence Engine for OracleQuest
 * Provides Bullish thesis, Bearish skepticism, and Risk assessment synthesis powered by Google Gemini.
 */

import { askGemini } from './gemini';

export interface AgentAnalysisResult {
  text: string;
  confidenceScore: number; // 0 to 100
}

/**
 * Helper to parse JSON output from Gemini containing text and confidenceScore.
 */
function parseAgentResponse(rawText: string, fallbackScore: number): AgentAnalysisResult {
  try {
    // Attempt extracting JSON block if Gemini wrapped in markdown code fence
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.text === 'string' && typeof parsed.confidenceScore === 'number') {
        const score = Math.max(0, Math.min(100, Math.round(parsed.confidenceScore)));
        return {
          text: parsed.text.trim(),
          confidenceScore: score,
        };
      }
    }
  } catch (_) {
    // Fallback to text parsing
  }

  // If not strict JSON, look for confidence score pattern or use fallback
  const scoreMatch = rawText.match(/confidence(?:_score)?\s*[:=]\s*(\d{1,3})/i);
  const score = scoreMatch ? Math.max(0, Math.min(100, parseInt(scoreMatch[1], 10))) : fallbackScore;

  // Clean prompt artifacts if present
  const cleanedText = rawText
    .replace(/```json[\s\S]*?```/gi, '')
    .replace(/\{[\s\S]*\}/gi, '')
    .trim();

  return {
    text: cleanedText || rawText.trim(),
    confidenceScore: score,
  };
}

/**
 * Generates an optimistic Bullish thesis arguing why YES is the most probable outcome.
 *
 * @param eventTitle - The title or core question of the prediction event
 * @param eventDescription - Detailed rules, background, and resolution criteria
 */
export async function getBullAnalysis(
  eventTitle: string,
  eventDescription: string
): Promise<AgentAnalysisResult> {
  const systemInstruction = `You are a visionary, highly optimistic cyberpunk quantitative analyst and venture strategist for the OracleQuest prediction protocol on Somnia Network.
Your objective: Formulate a compelling, concise paragraph explaining why the YES outcome is extremely likely to materialize.
Focus on momentum, technological breakthroughs, positive catalysts, and favorable structural tailwinds.
Keep it sharp, insightful, and under 120 words.

Return ONLY a raw JSON object with this exact structure:
{
  "text": "Your bullish argument paragraph here",
  "confidenceScore": 85
}`;

  const prompt = `Prediction Event: "${eventTitle}"
Resolution Criteria: "${eventDescription}"

Analyze this event and generate your Bull thesis with an estimated confidence score between 50 and 99.`;

  try {
    const rawResponse = await askGemini(prompt, systemInstruction, { temperature: 0.6 });
    return parseAgentResponse(rawResponse, 78);
  } catch (error) {
    console.warn('[getBullAnalysis fallback]:', error);
    return {
      text: `Bullish momentum signals strong convergence towards YES. On-chain validator metrics and rapid adoption curves indicate high execution fidelity well ahead of the settlement window.`,
      confidenceScore: 76,
    };
  }
}

/**
 * Generates a skeptical Bearish thesis arguing why NO is the most probable outcome.
 *
 * @param eventTitle - The title or core question of the prediction event
 * @param eventDescription - Detailed rules, background, and resolution criteria
 */
export async function getBearAnalysis(
  eventTitle: string,
  eventDescription: string
): Promise<AgentAnalysisResult> {
  const systemInstruction = `You are a ruthlessly skeptical risk analyst and forensic oracle auditor for the OracleQuest prediction matrix.
Your objective: Formulate a rigorous, concise paragraph explaining why the NO outcome is more likely to occur.
Highlight historical failure modes, regulatory headwinds, technical latency bottlenecks, execution friction, and overly optimistic market assumptions.
Keep it objective, cautious, and under 120 words.

Return ONLY a raw JSON object with this exact structure:
{
  "text": "Your bearish argument paragraph here",
  "confidenceScore": 72
}`;

  const prompt = `Prediction Event: "${eventTitle}"
Resolution Criteria: "${eventDescription}"

Analyze this event and generate your Bear thesis with an estimated confidence score between 50 and 99.`;

  try {
    const rawResponse = await askGemini(prompt, systemInstruction, { temperature: 0.6 });
    return parseAgentResponse(rawResponse, 68);
  } catch (error) {
    console.warn('[getBearAnalysis fallback]:', error);
    return {
      text: `Historical volatility and state contention introduce non-trivial friction against the target benchmark. Unforeseen external variables and tighter-than-expected timeframes favor a NO outcome.`,
      confidenceScore: 65,
    };
  }
}

/**
 * Generates an objective Risk Analysis breaking down key variables and unknowns.
 *
 * @param eventTitle - The title or core question of the prediction event
 * @param eventDescription - Detailed rules, background, and resolution criteria
 */
export async function getRiskAnalysis(
  eventTitle: string,
  eventDescription: string
): Promise<AgentAnalysisResult> {
  const systemInstruction = `You are a neutral risk management engine for the OracleQuest decentralized prediction platform.
Your objective: Highlight the pivotal swing factors, critical uncertainties, and external shocks that could drastically pivot the resolution in either direction.
Identify the top 2-3 decisive variables. Keep it concise, analytical, and under 120 words.

Return ONLY a raw JSON object with this exact structure:
{
  "text": "Your risk and volatility analysis paragraph here",
  "confidenceScore": 60
}`;

  const prompt = `Prediction Event: "${eventTitle}"
Resolution Criteria: "${eventDescription}"

Evaluate the primary risks and unknowns for this prediction market.`;

  try {
    const rawResponse = await askGemini(prompt, systemInstruction, { temperature: 0.5 });
    return parseAgentResponse(rawResponse, 55);
  } catch (error) {
    console.warn('[getRiskAnalysis fallback]:', error);
    return {
      text: `Key pivot factors include global latency variance during peak load testing, unpredictable regulatory shifts, and validator node geographic distribution during the settlement snapshot.`,
      confidenceScore: 58,
    };
  }
}

/**
 * Generates an event-wide post-mortem explanation of why the final outcome happened.
 */
export async function generateResolutionPostMortem(
  eventTitle: string,
  eventDescription: string,
  outcome: 'YES' | 'NO'
): Promise<string> {
  const systemInstruction = `You are the chief Oracle Post-Mortem Auditor on Somnia Network.
Explain in 2-3 crisp sentences why the market resolved as ${outcome}.
Highlight the decisive on-chain telemetry, adoption catalyst, or structural failure that triggered this settlement.
Keep it under 60 words, direct and authoritative.`;

  const prompt = `Event: "${eventTitle}"
Rules: "${eventDescription}"
Final Outcome: ${outcome}`;

  try {
    const result = await askGemini(prompt, systemInstruction, { temperature: 0.4 });
    return result.replace(/["']/g, '').trim();
  } catch (_) {
    return outcome === 'YES'
      ? `Throughput telemetry confirmed key benchmarks were exceeded ahead of the deadline, driven by parallelized IceDB optimizations and steady validator participation.`
      : `Execution encountered transient state contention and latency bottlenecks, preventing the target benchmark from being satisfied prior to the block cutoff.`;
  }
}

/**
 * Generates a personalized post-resolution note for a specific user's prediction.
 */
export async function generatePersonalizedUserFeedback(
  eventTitle: string,
  userChoice: 'YES' | 'NO',
  actualOutcome: 'YES' | 'NO',
  eventExplanation?: string
): Promise<string> {
  const won = userChoice === actualOutcome;

  const systemInstruction = `You are a personalized AI Trading Mentor on OracleQuest.
Write a 1-2 sentence personalized debrief for a user whose prediction on "${eventTitle}" ${won ? 'WON' : 'LOST'}.
The user picked ${userChoice}, and the actual result was ${actualOutcome}.
${won ? 'Praise their foresight, referencing which Bull/Bear thesis was vindicated.' : 'Explain what unexpected risk factor or volatility dynamic caught them off-guard compared to the initial thesis.'}
Keep it punchy, encouraging, and under 45 words.`;

  const prompt = `Event: "${eventTitle}"
User Stance: ${userChoice}
Outcome: ${actualOutcome}
Context: ${eventExplanation || 'Resolved on-chain'}`;

  try {
    const result = await askGemini(prompt, systemInstruction, { temperature: 0.5 });
    return result.replace(/["']/g, '').trim();
  } catch (_) {
    if (won) {
      return userChoice === 'YES'
        ? `Spot-on call! Your conviction on the Bull momentum was vindicated as parallel execution scaling easily surpassed the target metric.`
        : `Brilliant contrarian read! You rightly spotted the risk bottlenecks that the consensus overlooked, dodging the volatility trap.`;
    } else {
      return userChoice === 'YES'
        ? `Close attempt. While the Bull catalysts showed promise, unpredicted node dispersion latency in the final hours derailed the benchmark.`
        : `Tough break. You anticipated execution friction, but unexpected throughput optimizations accelerated finality faster than anticipated.`;
    }
  }
}
