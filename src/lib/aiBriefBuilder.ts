/**
 * AI Brief Builder
 *
 * Converts rough ideas into structured Brief JSON.
 * All AI calls go through server-side abstraction.
 * Falls back to deterministic mock output if no key is configured.
 * Never auto-publishes the result.
 */

import type { Brief, AIBriefResult, ContentCategory, AspectRatio, OutputFormat } from '../types';

const DEMO_MODE = !import.meta.env.VITE_AI_ENDPOINT;

// ─── Deterministic Mock ───────────────────────────────────────────────────────

function buildMockBrief(input: string): AIBriefResult {
  const lower = input.toLowerCase();

  // Detect content type from keywords
  let contentType: ContentCategory = 'ai_film';
  if (lower.includes('animat')) contentType = 'animation';
  else if (lower.includes('product') || lower.includes('shoot')) contentType = 'product_visuals';
  else if (lower.includes('social') || lower.includes('ad') || lower.includes('tiktok')) contentType = 'social_ads';
  else if (lower.includes('motion') || lower.includes('graphic')) contentType = 'motion_graphics';
  else if (lower.includes('concept') || lower.includes('art')) contentType = 'concept_art';

  // Detect aspect ratios
  const aspectRatios: AspectRatio[] = [];
  if (lower.includes('tiktok') || lower.includes('reel') || lower.includes('vertical') || lower.includes('9:16')) aspectRatios.push('9:16');
  if (lower.includes('youtube') || lower.includes('16:9') || lower.includes('landscape')) aspectRatios.push('16:9');
  if (lower.includes('instagram') || lower.includes('square') || lower.includes('1:1')) aspectRatios.push('1:1');
  if (aspectRatios.length === 0) aspectRatios.push('16:9');

  // Detect budget
  const budgetMatch = input.match(/\$?([\d,]+)k?/i);
  const budget = budgetMatch
    ? parseInt(budgetMatch[1].replace(',', '')) * (budgetMatch[0].includes('k') ? 1000 : 1)
    : 5000;

  // Detect duration
  const durMatch = input.match(/(\d+)\s*(?:second|sec|s)\b/i);
  const durationSeconds = durMatch ? parseInt(durMatch[1]) : 60;

  // Output formats
  const requiredOutputFormats: OutputFormat[] = contentType === 'product_visuals'
    ? ['jpg', 'png']
    : ['mp4'];

  const clarificationQuestions: string[] = [];
  const missingFields: string[] = [];

  if (!lower.includes('brand') && !lower.includes('compan') && !lower.includes('product')) {
    missingFields.push('brand/product name');
    clarificationQuestions.push('What is the brand or product name this content is for?');
  }
  if (!lower.includes('audience') && !lower.includes('target') && !lower.includes('age')) {
    missingFields.push('target audience');
    clarificationQuestions.push('Who is the target audience? (age range, interests, geography)');
  }
  if (!lower.includes('deadline') && !lower.includes('by ') && !lower.includes('deliver')) {
    missingFields.push('deadline');
    clarificationQuestions.push('What is the delivery deadline?');
  }

  const brief: Partial<Brief> = {
    contentType,
    aspectRatios,
    durationSeconds,
    budget,
    requiredOutputFormats,
    deliverables: contentType === 'product_visuals'
      ? ['Hero images (10 variations)', 'Lifestyle composites (5)', 'Transparent PNGs']
      : ['Hero film', 'Short social cuts (30s, 15s)'],
    channels: lower.includes('tiktok') ? ['tiktok', 'instagram']
      : lower.includes('youtube') ? ['youtube', 'instagram']
      : ['instagram', 'youtube'],
    territory: 'worldwide',
    licenseDuration: 'perpetual',
    exclusivity: false,
    paidMedia: lower.includes('paid') || lower.includes('ad') || lower.includes('boost'),
    sourceFilesRequired: false,
    thirdPartyAssetConstraints: 'All AI-generated content must be disclosed.',
    revisionRounds: 3,
    resolution: '4K',
    clarificationQuestions,
  };

  return {
    brief,
    missingFields,
    clarificationQuestions,
    isDemoMode: DEMO_MODE,
    confidence: clarificationQuestions.length === 0 ? 0.85 : 0.65,
  };
}

// ─── Server-side AI Call ──────────────────────────────────────────────────────

async function callAIEndpoint(input: string): Promise<AIBriefResult> {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT;
  if (!endpoint) {
    return buildMockBrief(input);
  }
  const timeout = 15000; // 15s timeout

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`AI endpoint returned ${response.status}`);
    }

    const data = await response.json();

    // Validate the response shape
    if (!data.brief || typeof data.brief !== 'object') {
      throw new Error('Malformed AI response: missing brief object');
    }

    return {
      brief: data.brief,
      missingFields: data.missingFields ?? [],
      clarificationQuestions: data.clarificationQuestions ?? [],
      isDemoMode: false,
      confidence: data.confidence ?? 0.8,
    };
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') {
      throw new Error('AI request timed out. Using mock fallback.');
    }
    throw err;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function buildBriefFromInput(input: string): Promise<AIBriefResult> {
  if (DEMO_MODE) {
    // Simulate a small delay for realism
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    return buildMockBrief(input);
  }

  try {
    return await callAIEndpoint(input);
  } catch (err) {
    console.warn('[AI Brief Builder] Falling back to mock:', err);
    return { ...buildMockBrief(input), isDemoMode: true };
  }
}
