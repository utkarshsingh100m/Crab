/**
 * CRAB Search & Ranking Engine
 *
 * Ranking formula:
 *   final_rank = 0.60 * brief_match_score + 0.30 * profile_score + 0.10 * freshness_score
 *
 * Hard constraints are checked first — a failed constraint excludes the creator
 * from results (a high score cannot override hard constraints).
 */

import type {
  CreatorProfile,
  CreatorFilters,
  Brief,
  RankedCreator,
  SortOption,
  ContentCategory,
  AspectRatio,
  OutputFormat,
  AvailabilityStatus,
} from '../types';
import { calculateFreshnessScore } from './scoring';

// ─── Hard Constraint Checker ──────────────────────────────────────────────────

function checkHardConstraints(
  creator: CreatorProfile,
  brief?: Brief
): { passed: boolean; failed: string[] } {
  const failed: string[] = [];

  if (!brief) return { passed: true, failed: [] };

  // 1. Content type constraint
  if (brief.contentType && !creator.categories.includes(brief.contentType)) {
    failed.push(`Creator does not work in category: ${brief.contentType}`);
  }

  // 2. Aspect ratio constraint
  if (brief.aspectRatios?.length > 0) {
    const supported = brief.aspectRatios.every((ar) =>
      creator.aspectRatios.includes(ar as AspectRatio)
    );
    if (!supported) {
      const unsupported = brief.aspectRatios.filter(
        (ar) => !creator.aspectRatios.includes(ar as AspectRatio)
      );
      failed.push(`Creator does not support aspect ratios: ${unsupported.join(', ')}`);
    }
  }

  // 3. Output format constraint
  if (brief.requiredOutputFormats?.length > 0) {
    const supported = brief.requiredOutputFormats.every((fmt) =>
      creator.outputFormats.includes(fmt as OutputFormat)
    );
    if (!supported) {
      const unsupported = brief.requiredOutputFormats.filter(
        (fmt) => !creator.outputFormats.includes(fmt as OutputFormat)
      );
      failed.push(`Creator does not produce formats: ${unsupported.join(', ')}`);
    }
  }

  // 4. Mandatory availability constraint
  if (brief.mandatoryAvailability && creator.availability === 'booked') {
    failed.push('Creator is not available (brief requires availability)');
  }

  // 5. Commercial use: if paidMedia required, check rights
  if (brief.paidMedia) {
    const hasCommercialPortfolio = creator.portfolioItems.some(
      (i) => i.rights.commercialUse
    );
    if (!hasCommercialPortfolio && creator.portfolioItems.length > 0) {
      failed.push('No commercial-use portfolio items found');
    }
  }

  return { passed: failed.length === 0, failed };
}

// ─── Brief Match Score ────────────────────────────────────────────────────────

function calculateBriefMatchScore(
  creator: CreatorProfile,
  brief?: Brief
): { score: number; factors: string[] } {
  if (!brief) return { score: 50, factors: ['No active brief — using neutral default'] };

  let score = 0;
  const factors: string[] = [];

  // Category match (up to 30 pts)
  if (creator.categories.includes(brief.contentType)) {
    score += 30;
    factors.push(`Category match: ${brief.contentType}`);
  }

  // Aspect ratio match (up to 20 pts)
  const arMatch = brief.aspectRatios?.filter((ar) =>
    creator.aspectRatios.includes(ar as AspectRatio)
  ).length ?? 0;
  const arScore = Math.round(
    (arMatch / Math.max(brief.aspectRatios?.length ?? 1, 1)) * 20
  );
  score += arScore;
  if (arScore > 0) factors.push(`Aspect ratio coverage: ${arMatch}/${brief.aspectRatios?.length ?? 0}`);

  // Output format match (up to 15 pts)
  const fmtMatch = brief.requiredOutputFormats?.filter((f) =>
    creator.outputFormats.includes(f as OutputFormat)
  ).length ?? 0;
  const fmtScore = Math.round(
    (fmtMatch / Math.max(brief.requiredOutputFormats?.length ?? 1, 1)) * 15
  );
  score += fmtScore;
  if (fmtScore > 0) factors.push(`Format coverage: ${fmtMatch}/${brief.requiredOutputFormats?.length ?? 0}`);

  // Budget fit (up to 15 pts)
  if (creator.rateMin <= brief.budget && brief.budget <= creator.rateMax) {
    score += 15;
    factors.push('Budget within range');
  } else if (creator.rateMin <= brief.budget) {
    score += 8;
    factors.push('Budget at or above minimum rate');
  }

  // Commercial use capability (up to 10 pts)
  if (brief.paidMedia) {
    const commercialReady = creator.portfolioItems.some(
      (i) => i.rights.commercialUse
    );
    if (commercialReady) {
      score += 10;
      factors.push('Commercial use capability confirmed');
    }
  } else {
    score += 10;
    factors.push('No paid media requirement');
  }

  // Availability (up to 10 pts)
  if (creator.availability === 'available') {
    score += 10;
    factors.push('Creator is fully available');
  } else if (creator.availability === 'limited') {
    score += 5;
    factors.push('Creator has limited availability');
  }

  return { score: Math.min(score, 100), factors };
}

// ─── Text Search ──────────────────────────────────────────────────────────────

function matchesTextQuery(creator: CreatorProfile, query: string): boolean {
  if (!query.trim()) return true;

  const needle = query.toLowerCase();
  const haystack = [
    creator.displayName,
    creator.tagline,
    creator.bio,
    creator.location,
    ...(creator.skills ?? []),
    ...(creator.tools ?? []),
    ...(creator.categories ?? []),
    ...(creator.portfolioItems ?? []).map((p) => p.title),
    ...(creator.portfolioItems ?? []).flatMap((p) => p.skills ?? []),
    ...(creator.portfolioItems ?? []).flatMap((p) => p.tools ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}

// ─── Filter Checker ───────────────────────────────────────────────────────────

function matchesFilters(
  creator: CreatorProfile,
  filters: CreatorFilters
): boolean {
  // Text search
  if (!matchesTextQuery(creator, filters.query)) return false;

  // Category filter
  if (filters.categories.length > 0) {
    const hasCategory = filters.categories.some((c) =>
      creator.categories.includes(c as ContentCategory)
    );
    if (!hasCategory) return false;
  }

  // Tools filter
  if (filters.tools.length > 0) {
    const hasTool = filters.tools.some((t) =>
      creator.tools.some((ct) => ct.toLowerCase().includes(t.toLowerCase()))
    );
    if (!hasTool) return false;
  }

  // Skills filter
  if (filters.skills.length > 0) {
    const hasSkill = filters.skills.some((s) =>
      creator.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase()))
    );
    if (!hasSkill) return false;
  }

  // Output formats
  if (filters.outputFormats.length > 0) {
    const hasFormat = filters.outputFormats.some((f) =>
      creator.outputFormats.includes(f as OutputFormat)
    );
    if (!hasFormat) return false;
  }

  // Aspect ratios
  if (filters.aspectRatios.length > 0) {
    const hasRatio = filters.aspectRatios.some((ar) =>
      creator.aspectRatios.includes(ar as AspectRatio)
    );
    if (!hasRatio) return false;
  }

  // Availability
  if (filters.availability.length > 0) {
    if (!filters.availability.includes(creator.availability as AvailabilityStatus)) {
      return false;
    }
  }

  // Rate range
  if (filters.rateMin !== undefined && creator.rateMax < filters.rateMin) return false;
  if (filters.rateMax !== undefined && creator.rateMin > filters.rateMax) return false;

  // Min score
  if (filters.minScore !== undefined) {
    const creatorScore = creator.score?.total ?? 0;
    if (creatorScore < filters.minScore) return false;
  }

  return true;
}

// ─── Main Ranker ──────────────────────────────────────────────────────────────

export function rankCreators(
  creators: CreatorProfile[],
  filters: CreatorFilters,
  sort: SortOption,
  brief?: Brief
): RankedCreator[] {
  const ranked: RankedCreator[] = [];

  for (const creator of creators) {
    // Apply filters first
    if (!matchesFilters(creator, filters)) continue;

    // Check hard constraints
    const { passed, failed } = checkHardConstraints(creator, brief);

    // Get profile score
    const profileScore = creator.score?.total ?? 0;

    // Get brief match score
    const { score: briefMatchScore, factors: briefFactors } =
      calculateBriefMatchScore(creator, brief);

    // Get freshness score
    const freshnessScore = calculateFreshnessScore(creator);

    // Compute final rank
    let finalRank: number;
    let rankingFactors: string[];

    if (brief) {
      finalRank =
        0.6 * briefMatchScore + 0.3 * profileScore + 0.1 * freshnessScore;
      rankingFactors = [
        `Brief match: ${briefMatchScore.toFixed(0)}/100 (60% weight)`,
        `Profile score: ${profileScore}/100 (30% weight)`,
        `Freshness: ${freshnessScore}/100 (10% weight)`,
        ...briefFactors,
      ];
    } else {
      // No active brief: rank by profile score + freshness
      finalRank = 0.85 * profileScore + 0.15 * freshnessScore;
      rankingFactors = [
        `Profile score: ${profileScore}/100 (85% weight)`,
        `Freshness: ${freshnessScore}/100 (15% weight)`,
      ];
    }

    // New creators get a neutral default for response history
    if (creator.completedProjects === 0) {
      rankingFactors.push('New creator — neutral response history default applied');
    }

    ranked.push({
      creator,
      briefMatchScore,
      profileScore,
      freshnessScore,
      finalRank,
      rankingFactors,
      hardConstraintsPassed: passed,
      failedConstraints: failed,
    });
  }

  // Sort — hard constraint failures go to end but are still shown
  return sortRankedCreators(ranked, sort);
}

function sortRankedCreators(
  ranked: RankedCreator[],
  sort: SortOption
): RankedCreator[] {
  const passing = ranked.filter((r) => r.hardConstraintsPassed);
  const failing = ranked.filter((r) => !r.hardConstraintsPassed);

  const sortFn = (a: RankedCreator, b: RankedCreator): number => {
    switch (sort) {
      case 'best_match':
        return b.finalRank - a.finalRank;
      case 'highest_score':
        return b.profileScore - a.profileScore;
      case 'recently_updated': {
        const aDate = new Date(a.creator.updatedAt).getTime();
        const bDate = new Date(b.creator.updatedAt).getTime();
        return bDate - aDate;
      }
      case 'newest': {
        const aDate = new Date(a.creator.joinedAt).getTime();
        const bDate = new Date(b.creator.joinedAt).getTime();
        return bDate - aDate;
      }
      default:
        return b.finalRank - a.finalRank;
    }
  };

  return [...passing.sort(sortFn), ...failing.sort(sortFn)];
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { checkHardConstraints, calculateBriefMatchScore, matchesFilters };
