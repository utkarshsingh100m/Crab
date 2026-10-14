import { describe, it, expect } from 'vitest';
import { rankCreators, checkHardConstraints, calculateBriefMatchScore } from './ranking';
import type { CreatorProfile, Brief } from '../types';

describe('CRAB Ranking Engine (Hard Constraints & Weighted Scoring)', () => {
  const baseCreator: CreatorProfile = {
    id: 'creator-alpha',
    userId: 'user-alpha',
    displayName: 'Creator Alpha',
    tagline: 'Top AI Filmmaker',
    bio: 'Extensive background in AI cinema production.',
    avatarUrl: 'https://example.com/alpha.png',
    location: 'London, UK',
    timezone: 'Europe/London',
    categories: ['ai_film', 'animation'],
    skills: ['Directing', 'Prompt Engineering'],
    tools: ['Sora', 'Runway Gen-3'],
    outputFormats: ['mp4'],
    aspectRatios: ['16:9', '9:16'],
    rateMin: 3000,
    rateMax: 8000,
    availability: 'available',
    isOpenToCollaboration: true,
    portfolioItems: [
      {
        id: 'item-1',
        creatorId: 'creator-alpha',
        title: 'Cyberpunk short',
        description: 'Test short',
        role: 'Director',
        category: 'ai_film',
        skills: ['Directing'],
        tools: ['Sora'],
        mediaUrl: 'https://example.com/v.mp4',
        mediaType: 'video',
        thumbnailUrl: 'https://example.com/t.jpg',
        outputFormats: ['mp4'],
        aspectRatios: ['16:9', '9:16'],
        workflowSteps: [],
        rights: {
          commercialUse: true,
          exclusivity: true,
          licenseDuration: 'Perpetual',
          territory: 'Worldwide',
          sourceFilesIncluded: true,
          thirdPartyAssets: false,
          disclosureStatement: 'Cleared',
        },
        evidenceStatus: 'reviewed',
        projectDate: '2026-09-01',
        featured: true,
        viewCount: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    score: {
      id: 'score-1',
      creatorId: 'creator-alpha',
      total: 88,
      components: {
        profileCompleteness: 14,
        portfolioStrength: 22,
        aiWorkflowTransparency: 18,
        skillEvidence: 13,
        commercialReadiness: 9,
        trustEvidence: 8,
        freshnessResponsiveness: 4,
      },
      scoreVersion: '1.0.0',
      calculatedAt: new Date().toISOString(),
    },
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    responseTimeHours: 1.5,
    completedProjects: 8,
    updatedAt: new Date().toISOString(),
  };

  const sampleBrief: Brief = {
    id: 'brief-101',
    brandId: 'brand-1',
    title: 'Brand Commercial Film',
    objective: 'Create stunning 60s brand spot',
    targetAudience: 'Tech enthusiasts',
    keyMessage: 'Future is now',
    contentType: 'ai_film',
    styleNotes: 'Cinematic and sleek',
    references: [],
    aspectRatios: ['16:9'],
    resolution: '4K',
    deliverables: ['60s Master'],
    channels: ['YouTube'],
    territory: 'Worldwide',
    licenseDuration: 'Perpetual',
    exclusivity: true,
    paidMedia: true,
    sourceFilesRequired: true,
    thirdPartyAssetConstraints: 'None',
    budget: 5000,
    deadline: '2026-12-01',
    revisionRounds: 2,
    status: 'published',
    requiredOutputFormats: ['mp4'],
    mandatoryAvailability: true,
    clarificationQuestions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('passes hard constraints when creator satisfies content type, aspect ratio, availability and commercial rights', () => {
    const check = checkHardConstraints(baseCreator, sampleBrief);
    expect(check.passed).toBe(true);
    expect(check.failed.length).toBe(0);
  });

  it('fails hard constraint if creator lacks mandatory content type', () => {
    const wrongCategoryCreator: CreatorProfile = {
      ...baseCreator,
      categories: ['concept_art'],
    };

    const check = checkHardConstraints(wrongCategoryCreator, sampleBrief);
    expect(check.passed).toBe(false);
    expect(check.failed.some((r) => r.toLowerCase().includes('category'))).toBe(true);
  });

  it('fails hard constraint if creator does not support required aspect ratio', () => {
    const wrongRatioCreator: CreatorProfile = {
      ...baseCreator,
      aspectRatios: ['1:1'],
    };

    const check = checkHardConstraints(wrongRatioCreator, sampleBrief);
    expect(check.passed).toBe(false);
    expect(check.failed.some((r) => r.toLowerCase().includes('aspect ratio'))).toBe(true);
  });

  it('fails hard constraint if creator is booked and brief requires mandatory availability', () => {
    const bookedCreator: CreatorProfile = {
      ...baseCreator,
      availability: 'booked',
    };

    const check = checkHardConstraints(bookedCreator, sampleBrief);
    expect(check.passed).toBe(false);
    expect(check.failed.some((r) => r.toLowerCase().includes('availability'))).toBe(true);
  });

  it('calculates brief match score based on budget, commercial use, and tools', () => {
    const match = calculateBriefMatchScore(baseCreator, sampleBrief);
    expect(match.score).toBeGreaterThan(0);
    expect(match.score).toBeLessThanOrEqual(100);
    expect(match.factors.length).toBeGreaterThan(0);
  });

  it('ranks creator who passes hard constraints ahead of creator failing hard constraints', () => {
    const failingCreator: CreatorProfile = {
      ...baseCreator,
      id: 'failing-creator',
      categories: ['concept_art'], // does not match 'ai_film'
      score: {
        ...baseCreator.score!,
        total: 99, // Even with higher profile score, hard constraint fail sends to bottom
      },
    };

    const emptyFilters = {
      query: '',
      categories: [],
      tools: [],
      skills: [],
      outputFormats: [],
      aspectRatios: [],
      availability: [],
    };

    const ranked = rankCreators(
      [failingCreator, baseCreator],
      emptyFilters,
      'best_match',
      sampleBrief
    );

    expect(ranked[0].creator.id).toBe('creator-alpha');
    expect(ranked[0].hardConstraintsPassed).toBe(true);
    expect(ranked[1].hardConstraintsPassed).toBe(false);
  });

  it('handles empty creator array gracefully', () => {
    const emptyFilters = {
      query: '',
      categories: [],
      tools: [],
      skills: [],
      outputFormats: [],
      aspectRatios: [],
      availability: [],
    };

    const ranked = rankCreators([], emptyFilters, 'best_match');

    expect(ranked).toEqual([]);
  });
});
