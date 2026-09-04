/**
 * Google Gemini AI API Client Helper for OracleQuest
 * Provides robust prompt execution, system instructions, timeout handling, and error recovery.
 */

export interface GeminiOptions {
  model?: string;
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
}

const DEFAULT_MODEL = 'gemini-3.7-flash';
const DEFAULT_TIMEOUT_MS = 20000; // 20 seconds timeout

/**
 * Executes a prompt against Google Gemini API with system instructions and timeout protection.
 *
 * @param prompt - The user prompt or analysis query to send to Gemini
 * @param systemInstruction - Optional persona, constraints, or cyber oracle directives
 * @param options - Configurable model name, timeout, and temperature parameters
 * @returns The generated text string response from Gemini
 */
export async function askGemini(
  prompt: string,
  systemInstruction?: string,
  options: GeminiOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    console.warn('[Gemini] GEMINI_API_KEY is not configured in .env.local. Falling back to synthetic oracle response.');
    return generateFallbackAnalysis(prompt, systemInstruction);
  }

  const model = options.model || DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const temperature = options.temperature ?? 0.7;
  const maxOutputTokens = options.maxOutputTokens ?? 2048;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody: Record<string, any> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (systemInstruction) {
    requestBody.system_instruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Gemini API Error: ${errorMsg}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];

    if (!candidate) {
      throw new Error('Gemini API returned no candidates');
    }

    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Response was flagged by Gemini safety filters');
    }

    const textPart = candidate?.content?.parts?.[0]?.text;
    if (typeof textPart !== 'string') {
      throw new Error('Invalid or empty content returned by Gemini');
    }

    return textPart.trim();
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Gemini API request timed out after ${timeoutMs}ms`);
    }

    console.error('[Gemini API Error]:', error.message || error);
    throw error;
  }
}

/**
 * Fallback synthetic synthesis when API key is unconfigured or in offline demo mode.
 */
function generateFallbackAnalysis(prompt: string, systemInstruction?: string): string {
  return `[ORACLE SYNTHESIS PROTOCOL]
Based on simulated quantum telemetry and multi-agent debate matrices:
- Data Signals Evaluated: High confidence index (>88.5%).
- Primary Correlation: Positive linear scalability on Somnia Network.
- Query Processed: "${prompt.slice(0, 100)}..."`;
}
