import { describe, it, expect } from 'vitest';
import { calculateCreatorScore, generateScoreRecommendations, calculateFreshnessScore } from './scoring';
import type { CreatorProfile } from '../types';

describe('CRAB Scoring Engine (Deterministic 100pt Model)', () => {
  const minimalCreator: CreatorProfile = {
    id: 'test-newbie',
    userId: 'user-newbie',
    displayName: 'New Creator',
    tagline: 'Generative Artist',
    bio: 'Just joined the platform.',
    avatarUrl: 'https://example.com/avatar.png',
    location: 'Remote',
    timezone: 'UTC',
    categories: ['ai_film'],
    skills: ['Prompt Engineering'],
    tools: ['Midjourney'],
    outputFormats: ['mp4'],
    aspectRatios: ['16:9'],
    rateMin: 500,
    rateMax: 2000,
    availability: 'available',
    isOpenToCollaboration: true,
    portfolioItems: [],
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    responseTimeHours: 2,
    completedProjects: 0,
    updatedAt: new Date().toISOString(),
  };

  it('calculates scores within strict 0 to 100 bounds for minimal creator with 0 portfolio items', () => {
    const score = calculateCreatorScore(minimalCreator);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.components.portfolioStrength).toBe(0);
    expect(score.components.profileCompleteness).toBeGreaterThan(0);
    expect(score.components.profileCompleteness).toBeLessThanOrEqual(15);
  });

  it('calculates max component caps correctly', () => {
    const richCreator: CreatorProfile = {
      ...minimalCreator,
      bio: 'A very comprehensive bio with well over 100 characters to ensure maximum completeness score is attained by the creator profile scoring rules.',
      website: 'https://creatorsite.com',
      portfolioItems: [
        {
          id: 'item-1',
          creatorId: 'test-newbie',
          title: 'Masterpiece 1',
          description: 'Detailed description with prompts and workflow breakdown',
          role: 'Lead AI Artist',
          category: 'ai_film',
          skills: ['Prompt Engineering', 'LoRA Training', 'Upscaling'],
          tools: ['Runway Gen-3', 'Midjourney', 'Topaz'],
          mediaUrl: 'https://example.com/video.mp4',
          mediaType: 'video',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          outputFormats: ['mp4', 'mov'],
          aspectRatios: ['16:9', '9:16'],
          workflowSteps: [
            { step: 1, tool: 'Midjourney', description: 'Concept frames', outputType: 'PNG' },
            { step: 2, tool: 'Runway', description: 'Video synthesis', outputType: 'MP4' },
          ],
          rights: {
            commercialUse: true,
            exclusivity: true,
            licenseDuration: 'Perpetual',
            territory: 'Worldwide',
            sourceFilesIncluded: true,
            thirdPartyAssets: false,
            disclosureStatement: 'Fully generated with commercial licenses.',
          },
          evidenceStatus: 'reviewed',
          projectDate: '2026-09-01',
          featured: true,
          viewCount: 250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'item-2',
          creatorId: 'test-newbie',
          title: 'Masterpiece 2',
          description: 'Second portfolio piece',
          role: 'Creative Technologist',
          category: 'motion_graphics',
          skills: ['Compositing', 'Sound Design'],
          tools: ['Sora', 'DaVinci'],
          mediaUrl: 'https://example.com/video2.mp4',
          mediaType: 'video',
          thumbnailUrl: 'https://example.com/thumb2.jpg',
          outputFormats: ['mp4'],
          aspectRatios: ['16:9'],
          workflowSteps: [
            { step: 1, tool: 'Sora', description: 'Worldbuilding', outputType: 'MP4' },
          ],
          rights: {
            commercialUse: true,
            exclusivity: false,
            licenseDuration: '1 Year',
            territory: 'Worldwide',
            sourceFilesIncluded: false,
            thirdPartyAssets: false,
            disclosureStatement: 'Original prompts and seeds stored.',
          },
          evidenceStatus: 'evidence_submitted',
          projectDate: '2026-09-15',
          featured: true,
          viewCount: 120,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      completedProjects: 5,
    };

    const score = calculateCreatorScore(richCreator);

    expect(score.components.profileCompleteness).toBeLessThanOrEqual(15);
    expect(score.components.portfolioStrength).toBeLessThanOrEqual(25);
    expect(score.components.aiWorkflowTransparency).toBeLessThanOrEqual(20);
    expect(score.components.skillEvidence).toBeLessThanOrEqual(15);
    expect(score.components.commercialReadiness).toBeLessThanOrEqual(10);
    expect(score.components.trustEvidence).toBeLessThanOrEqual(10);
    expect(score.components.freshnessResponsiveness).toBeLessThanOrEqual(5);

    expect(score.total).toBe(
      score.components.profileCompleteness +
      score.components.portfolioStrength +
      score.components.aiWorkflowTransparency +
      score.components.skillEvidence +
      score.components.commercialReadiness +
      score.components.trustEvidence +
      score.components.freshnessResponsiveness
    );
  });

  it('generates actionable score recommendations when scores have potential gain', () => {
    const score = calculateCreatorScore(minimalCreator);
    const recs = generateScoreRecommendations(minimalCreator, score);

    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);
    recs.forEach((rec) => {
      expect(rec.estimatedGain).toBeGreaterThan(0);
      expect(rec.title).toBeDefined();
      expect(rec.actionLabel).toBeDefined();
    });
  });

  it('calculates freshness score correctly for active users', () => {
    const fresh = calculateFreshnessScore(minimalCreator);
    expect(fresh).toBeGreaterThanOrEqual(0);
    expect(fresh).toBeLessThanOrEqual(100);
  });
});
