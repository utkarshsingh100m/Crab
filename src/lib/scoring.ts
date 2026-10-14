/**
 * CRAB AI Profile Score Engine
 * Version: 1.0.0
 *
 * Deterministic scoring algorithm. AI may recommend improvements but this
 * code computes the final score. Score is out of 100.
 *
 * Components:
 *   - Profile Completeness: 15 pts
 *   - Portfolio Strength:   25 pts
 *   - AI Workflow Transparency: 20 pts
 *   - Skill Evidence:       15 pts
 *   - Commercial Readiness: 10 pts
 *   - Trust/Evidence:       10 pts
 *   - Freshness/Responsiveness: 5 pts
 */

import {
  type CreatorProfile,
  type ScoreComponents,
  type CreatorScore,
  type ScoreRecommendation,
  SCORE_VERSION,
} from '../types';
import { differenceInDays } from 'date-fns';

// ─── Scoring Helpers ──────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Component Scorers ────────────────────────────────────────────────────────

/**
 * Profile Completeness — max 15
 * Checks required profile fields are populated.
 */
function scoreProfileCompleteness(creator: CreatorProfile): number {
  let score = 0;

  if (creator.displayName?.trim()) score += 1;
  if (creator.tagline?.trim()) score += 1;
  if (creator.bio && creator.bio.length >= 100) score += 2;
  else if (creator.bio?.trim()) score += 1;
  if (creator.avatarUrl?.trim()) score += 1;
  if (creator.location?.trim()) score += 1;
  if (creator.timezone?.trim()) score += 1;
  if (creator.website?.trim()) score += 1;
  if (creator.categories?.length > 0) score += 1;
  if (creator.outputFormats?.length > 0) score += 1;
  if (creator.aspectRatios?.length > 0) score += 1;
  if (creator.rateMin > 0 && creator.rateMax > 0) score += 2;
  if (creator.isOpenToCollaboration !== undefined) score += 1;

  return clamp(score, 0, 15);
}

/**
 * Portfolio Strength — max 25
 * Rewards breadth, quality, and variety of portfolio items.
 */
function scorePortfolioStrength(creator: CreatorProfile): number {
  const items = creator.portfolioItems ?? [];
  if (items.length === 0) return 0;

  let score = 0;

  // Number of items (up to 10 pts)
  const itemCountScore = Math.min(items.length * 2, 10);
  score += itemCountScore;

  // Featured items (up to 3 pts)
  const featuredCount = items.filter((i) => i.featured).length;
  score += Math.min(featuredCount * 1.5, 3);

  // Category diversity (up to 4 pts)
  const uniqueCategories = new Set(items.map((i) => i.category)).size;
  score += Math.min(uniqueCategories * 1, 4);

  // Has descriptions of adequate length (up to 4 pts)
  const wellDescribed = items.filter((i) => i.description?.length >= 80).length;
  score += Math.min(wellDescribed * 1, 4);

  // Portfolio view count indicates traction (up to 4 pts)
  const totalViews = items.reduce((sum, i) => sum + (i.viewCount ?? 0), 0);
  if (totalViews > 5000) score += 4;
  else if (totalViews > 1000) score += 3;
  else if (totalViews > 200) score += 2;
  else if (totalViews > 0) score += 1;

  return clamp(Math.round(score), 0, 25);
}

/**
 * AI Workflow Transparency — max 20
 * Rewards detailed workflow documentation.
 */
function scoreAIWorkflowTransparency(creator: CreatorProfile): number {
  const items = creator.portfolioItems ?? [];
  if (items.length === 0) return 0;

  let score = 0;

  // Has workflow steps in any portfolio item
  const withWorkflow = items.filter((i) => i.workflowSteps?.length > 0);
  if (withWorkflow.length === 0) return 0;

  // Percentage of items with workflow steps (up to 8 pts)
  const workflowCoverage = withWorkflow.length / items.length;
  score += Math.round(workflowCoverage * 8);

  // Average number of workflow steps (up to 6 pts)
  const avgSteps =
    withWorkflow.reduce((sum, i) => sum + i.workflowSteps.length, 0) /
    withWorkflow.length;
  score += Math.min(Math.round(avgSteps * 1.5), 6);

  // Tools are named (not generic) (up to 3 pts)
  const namedTools = creator.tools?.filter((t) => t.length > 3).length ?? 0;
  score += Math.min(namedTools * 0.5, 3);

  // Has disclosure statements (up to 3 pts)
  const withDisclosure = items.filter((i) => i.rights?.disclosureStatement?.trim()).length;
  score += Math.min(withDisclosure * 0.75, 3);

  return clamp(Math.round(score), 0, 20);
}

/**
 * Skill Evidence — max 15
 * Rewards documented and diverse skills.
 */
function scoreSkillEvidence(creator: CreatorProfile): number {
  let score = 0;

  // Number of listed skills (up to 6 pts)
  const skillCount = creator.skills?.length ?? 0;
  score += Math.min(skillCount * 0.75, 6);

  // Number of listed tools (up to 6 pts)
  const toolCount = creator.tools?.length ?? 0;
  score += Math.min(toolCount * 0.75, 6);

  // Skills appear in portfolio items (up to 3 pts)
  const portfolioSkills = new Set(
    (creator.portfolioItems ?? []).flatMap((i) => i.skills ?? [])
  );
  const matchedSkills = (creator.skills ?? []).filter((s) =>
    portfolioSkills.has(s)
  ).length;
  score += Math.min(matchedSkills * 0.5, 3);

  return clamp(Math.round(score), 0, 15);
}

/**
 * Commercial Readiness — max 10
 * Checks rights and commercial use documentation.
 */
function scoreCommercialReadiness(creator: CreatorProfile): number {
  const items = creator.portfolioItems ?? [];
  if (items.length === 0) return 0;

  let score = 0;

  // Has portfolio items with commercial use marked (up to 4 pts)
  const commercialItems = items.filter((i) => i.rights?.commercialUse).length;
  score += Math.min(commercialItems * 1, 4);

  // Has territory and license duration specified (up to 3 pts)
  const wellDocumented = items.filter(
    (i) => i.rights?.territory && i.rights?.licenseDuration
  ).length;
  score += Math.min(wellDocumented * 0.75, 3);

  // Third-party asset notes present where applicable (up to 2 pts)
  const tpaItems = items.filter((i) => i.rights?.thirdPartyAssets);
  if (tpaItems.length > 0) {
    const tpaWithNotes = tpaItems.filter((i) => i.rights?.thirdPartyAssetNotes).length;
    score += Math.min(tpaWithNotes * 1, 2);
  } else {
    score += 2; // No TPA issues is fine
  }

  // Has completed projects history (up to 1 pt)
  if (creator.completedProjects > 0) score += 1;

  return clamp(Math.round(score), 0, 10);
}

/**
 * Trust/Evidence — max 10
 * Rewards verified portfolio items and evidence submissions.
 */
function scoreTrustEvidence(creator: CreatorProfile): number {
  const items = creator.portfolioItems ?? [];
  if (items.length === 0) return 0;

  let score = 0;

  // Reviewed/verified items are worth more (up to 6 pts)
  const reviewed = items.filter((i) => i.evidenceStatus === 'reviewed').length;
  const evidenceSubmitted = items.filter(
    (i) => i.evidenceStatus === 'evidence_submitted'
  ).length;
  const selfReported = items.filter(
    (i) => i.evidenceStatus === 'self_reported'
  ).length;

  score += Math.min(reviewed * 2, 6);
  score += Math.min(evidenceSubmitted * 1, 3);
  score += Math.min(selfReported * 0.25, 1);

  // Has completed projects history (up to 4 pts)
  if (creator.completedProjects >= 20) score += 4;
  else if (creator.completedProjects >= 10) score += 3;
  else if (creator.completedProjects >= 5) score += 2;
  else if (creator.completedProjects > 0) score += 1;

  return clamp(Math.round(score), 0, 10);
}

/**
 * Freshness/Responsiveness — max 5
 * Rewards recent activity and fast response times.
 */
function scoreFreshnessResponsiveness(creator: CreatorProfile): number {
  let score = 0;

  const daysSinceActive = differenceInDays(
    new Date(),
    new Date(creator.lastActiveAt)
  );

  // Recency of activity (up to 3 pts)
  if (daysSinceActive <= 1) score += 3;
  else if (daysSinceActive <= 7) score += 2;
  else if (daysSinceActive <= 30) score += 1;

  // Response time (up to 2 pts)
  if (creator.responseTimeHours <= 4) score += 2;
  else if (creator.responseTimeHours <= 24) score += 1;

  return clamp(score, 0, 5);
}

// ─── Main Scorer ──────────────────────────────────────────────────────────────

export function calculateCreatorScore(creator: CreatorProfile): CreatorScore {
  const profileCompleteness = scoreProfileCompleteness(creator);
  const portfolioStrength = scorePortfolioStrength(creator);
  const aiWorkflowTransparency = scoreAIWorkflowTransparency(creator);
  const skillEvidence = scoreSkillEvidence(creator);
  const commercialReadiness = scoreCommercialReadiness(creator);
  const trustEvidence = scoreTrustEvidence(creator);
  const freshnessResponsiveness = scoreFreshnessResponsiveness(creator);

  const components: ScoreComponents = {
    profileCompleteness,
    portfolioStrength,
    aiWorkflowTransparency,
    skillEvidence,
    commercialReadiness,
    trustEvidence,
    freshnessResponsiveness,
  };

  const total = clamp(
    profileCompleteness +
      portfolioStrength +
      aiWorkflowTransparency +
      skillEvidence +
      commercialReadiness +
      trustEvidence +
      freshnessResponsiveness,
    0,
    100
  );

  return {
    id: `score-${creator.id}`,
    creatorId: creator.id,
    total,
    components,
    scoreVersion: SCORE_VERSION,
    calculatedAt: new Date().toISOString(),
  };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function generateScoreRecommendations(
  creator: CreatorProfile,
  score: CreatorScore
): ScoreRecommendation[] {
  const recs: ScoreRecommendation[] = [];
  const c = score.components;
  const maxes = {
    profileCompleteness: 15,
    portfolioStrength: 25,
    aiWorkflowTransparency: 20,
    skillEvidence: 15,
    commercialReadiness: 10,
    trustEvidence: 10,
    freshnessResponsiveness: 5,
  };

  // Profile Completeness
  if (c.profileCompleteness < maxes.profileCompleteness) {
    const gain = maxes.profileCompleteness - c.profileCompleteness;
    if (!creator.website) {
      recs.push({
        id: `rec-${creator.id}-website`,
        creatorId: creator.id,
        category: 'profileCompleteness',
        title: 'Add your website URL',
        description: 'A professional website builds trust with brands and links your full portfolio.',
        estimatedGain: Math.min(gain, 1),
        priority: 'low',
        actionLabel: 'Edit Profile',
        actionTarget: '/creator/profile/edit',
      });
    }
    if (!creator.bio || creator.bio.length < 100) {
      recs.push({
        id: `rec-${creator.id}-bio`,
        creatorId: creator.id,
        category: 'profileCompleteness',
        title: 'Write a longer bio (100+ characters)',
        description: 'A detailed bio helps brands understand your background, approach, and unique value.',
        estimatedGain: Math.min(gain, 2),
        priority: 'high',
        actionLabel: 'Edit Bio',
        actionTarget: '/creator/profile/edit',
      });
    }
  }

  // Portfolio Strength
  if (c.portfolioStrength < maxes.portfolioStrength) {
    const gain = maxes.portfolioStrength - c.portfolioStrength;
    if ((creator.portfolioItems?.length ?? 0) < 4) {
      recs.push({
        id: `rec-${creator.id}-portfolio-count`,
        creatorId: creator.id,
        category: 'portfolioStrength',
        title: 'Add more portfolio items',
        description: 'Creators with 4+ portfolio items get 2× more brief invitations. Each item adds up to 2 points.',
        estimatedGain: Math.min(gain, 8),
        priority: 'high',
        actionLabel: 'Add Portfolio Item',
        actionTarget: '/creator/portfolio/new',
      });
    }
    if ((creator.portfolioItems ?? []).filter((i) => i.featured).length === 0) {
      recs.push({
        id: `rec-${creator.id}-featured`,
        creatorId: creator.id,
        category: 'portfolioStrength',
        title: 'Feature your best work',
        description: 'Mark your strongest piece as featured to boost first impressions.',
        estimatedGain: Math.min(gain, 2),
        priority: 'medium',
        actionLabel: 'Edit Portfolio',
        actionTarget: '/creator/portfolio',
      });
    }
  }

  // AI Workflow Transparency
  if (c.aiWorkflowTransparency < maxes.aiWorkflowTransparency) {
    const gain = maxes.aiWorkflowTransparency - c.aiWorkflowTransparency;
    const noWorkflow = (creator.portfolioItems ?? []).filter(
      (i) => !i.workflowSteps || i.workflowSteps.length === 0
    ).length;
    if (noWorkflow > 0) {
      recs.push({
        id: `rec-${creator.id}-workflow`,
        creatorId: creator.id,
        category: 'aiWorkflowTransparency',
        title: `Add workflow steps to ${noWorkflow} portfolio item${noWorkflow > 1 ? 's' : ''}`,
        description: 'Brands value transparency. Documented AI workflows significantly increase brief invitations and build trust.',
        estimatedGain: Math.min(gain, 10),
        priority: 'high',
        actionLabel: 'Edit Portfolio',
        actionTarget: '/creator/portfolio',
      });
    }
  }

  // Trust/Evidence
  if (c.trustEvidence < maxes.trustEvidence) {
    const gain = maxes.trustEvidence - c.trustEvidence;
    const selfReported = (creator.portfolioItems ?? []).filter(
      (i) => i.evidenceStatus === 'self_reported'
    ).length;
    if (selfReported > 0) {
      recs.push({
        id: `rec-${creator.id}-evidence`,
        creatorId: creator.id,
        category: 'trustEvidence',
        title: 'Submit evidence for self-reported work',
        description: 'Upload client communications, contracts, or published links to verify your work. Verified items earn 2× more points.',
        estimatedGain: Math.min(gain, 6),
        priority: 'medium',
        actionLabel: 'Submit Evidence',
        actionTarget: '/creator/portfolio',
      });
    }
  }

  // Freshness
  if (c.freshnessResponsiveness < maxes.freshnessResponsiveness) {
    const daysSince = differenceInDays(
      new Date(),
      new Date(creator.lastActiveAt)
    );
    if (daysSince > 7) {
      recs.push({
        id: `rec-${creator.id}-freshness`,
        creatorId: creator.id,
        category: 'freshnessResponsiveness',
        title: 'Log in regularly to stay fresh',
        description: 'Creators active in the last 7 days appear higher in search results. Even a quick profile update helps.',
        estimatedGain: 2,
        priority: 'low',
        actionLabel: 'Update Profile',
        actionTarget: '/creator/dashboard',
      });
    }
  }

  // Sort by priority then estimated gain
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recs.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      b.estimatedGain - a.estimatedGain
  );
}

// ─── Freshness/Availability Signal ────────────────────────────────────────────

export function calculateFreshnessScore(creator: CreatorProfile): number {
  let score = 0;

  // Availability (up to 60 pts)
  if (creator.availability === 'available') score += 60;
  else if (creator.availability === 'limited') score += 30;
  else score += 0;

  // Recency (up to 40 pts)
  const daysSince = differenceInDays(new Date(), new Date(creator.lastActiveAt));
  if (daysSince <= 1) score += 40;
  else if (daysSince <= 7) score += 30;
  else if (daysSince <= 30) score += 20;
  else if (daysSince <= 90) score += 10;

  return clamp(score, 0, 100);
}
