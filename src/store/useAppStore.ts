import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  CreatorProfile,
  Brief,
  Campaign,
  SavedCreator,
  CreatorScore,
  ScoreRecommendation,
  Proposal,
  CreatorFilters,
  SortOption,
} from '../types';
import {
  SEED_CREATORS,
  SEED_BRIEFS,
  SEED_CAMPAIGNS,
  SEED_SAVED_CREATORS,
  SEED_USERS,
} from '../data/seed';
import { calculateCreatorScore, generateScoreRecommendations } from '../lib/scoring';

// ─── Initialize Scores ────────────────────────────────────────────────────────

function initializeCreators(creators: CreatorProfile[]): CreatorProfile[] {
  return creators.map((c) => {
    const score = calculateCreatorScore(c);
    return { ...c, score };
  });
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;

  // Data
  creators: CreatorProfile[];
  briefs: Brief[];
  campaigns: Campaign[];
  savedCreators: SavedCreator[];
  proposals: Proposal[];

  // Search UI state
  searchFilters: CreatorFilters;
  searchSort: SortOption;
  activeBriefId: string | null;

  // Actions — Auth & User Profile
  login: (user: User) => void;
  logout: () => void;
  updateCurrentUser: (data: Partial<User>) => void;

  // Actions — Creators
  updateCreatorProfile: (id: string, data: Partial<CreatorProfile>) => void;
  recalculateScore: (creatorId: string) => CreatorScore;
  getScoreRecommendations: (creatorId: string) => ScoreRecommendation[];

  // Actions — Briefs
  saveBrief: (brief: Brief) => void;
  updateBrief: (id: string, data: Partial<Brief>) => void;
  publishBrief: (id: string) => void;

  // Actions — Saved Creators
  saveCreator: (brandId: string, creatorId: string, notes?: string) => void;
  unsaveCreator: (brandId: string, creatorId: string) => void;
  isCreatorSaved: (brandId: string, creatorId: string) => boolean;

  // Actions — Proposals & Campaigns
  submitProposal: (proposal: Proposal) => void;
  updateProposalStatus: (proposalId: string, status: Proposal['status']) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  updateMilestone: (campaignId: string, milestoneId: string, status: import('../types').MilestoneStatus) => void;
  sendMessage: (campaignId: string, message: import('../types').Message) => void;

  // Search filters
  setSearchFilters: (filters: Partial<CreatorFilters>) => void;
  setSearchSort: (sort: SortOption) => void;
  setActiveBriefId: (id: string | null) => void;
  resetSearchFilters: () => void;

  // Demo reset
  resetToSeedData: () => void;
}

const DEFAULT_FILTERS: CreatorFilters = {
  query: '',
  categories: [],
  tools: [],
  skills: [],
  outputFormats: [],
  aspectRatios: [],
  availability: [],
  rateMin: undefined,
  rateMax: undefined,
  minScore: undefined,
};

const seededCreators = initializeCreators(SEED_CREATORS);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────────────────────
      currentUser: SEED_USERS[0], // Default to brand user for demo
      isAuthenticated: true,

      creators: seededCreators,
      briefs: SEED_BRIEFS,
      campaigns: SEED_CAMPAIGNS,
      savedCreators: SEED_SAVED_CREATORS,
      proposals: [
        {
          id: 'proposal-1',
          briefId: 'brief-1',
          creatorId: 'creator-1',
          coverLetter: 'I would love to work on this project. My experience with Sora and Runway Gen-3 makes me perfectly suited for your cinematic brief.',
          proposedBudget: 7500,
          proposedDeadline: '2026-11-30',
          deliverables: ['60s hero film', '30s cut', '15s cut', '9:16 vertical'],
          workflowDescription: 'Using Sora for scene generation, Runway for motion continuity, and DaVinci for finishing.',
          status: 'accepted',
          submittedAt: '2026-10-05T10:00:00Z',
          updatedAt: '2026-10-14T10:00:00Z',
        },
      ],

      searchFilters: DEFAULT_FILTERS,
      searchSort: 'best_match',
      activeBriefId: null,

      // ─── Auth Actions ───────────────────────────────────────────────────────
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      updateCurrentUser: (data) => {
        set((state) => {
          if (!state.currentUser) return state;
          const updatedUser = {
            ...state.currentUser,
            ...data,
            updatedAt: new Date().toISOString(),
          };

          let updatedCreators = state.creators;
          if (updatedUser.role === 'creator') {
            updatedCreators = state.creators.map((c) => {
              if (c.userId === updatedUser.id) {
                const updatedCreator: CreatorProfile = {
                  ...c,
                  displayName: updatedUser.displayName ?? c.displayName,
                  avatarUrl: updatedUser.avatarUrl ?? c.avatarUrl,
                  bannerUrl: updatedUser.bannerUrl ?? c.bannerUrl,
                  location: updatedUser.location ?? c.location,
                  website: updatedUser.website ?? c.website,
                  bio: updatedUser.bio ?? c.bio,
                  verificationStatus: updatedUser.verificationStatus ?? c.verificationStatus,
                  verificationDocuments: updatedUser.verificationDocuments ?? c.verificationDocuments,
                  updatedAt: new Date().toISOString(),
                };
                const score = calculateCreatorScore(updatedCreator);
                return { ...updatedCreator, score };
              }
              return c;
            });
          }

          return {
            currentUser: updatedUser,
            creators: updatedCreators,
          };
        });
      },

      // ─── Creator Actions ────────────────────────────────────────────────────
      updateCreatorProfile: (id, data) => {
        set((state) => ({
          creators: state.creators.map((c) => {
            if (c.id !== id) return c;
            const updated = { ...c, ...data, updatedAt: new Date().toISOString() };
            const score = calculateCreatorScore(updated);
            return { ...updated, score };
          }),
        }));
      },

      recalculateScore: (creatorId) => {
        const creator = get().creators.find((c) => c.id === creatorId);
        if (!creator) throw new Error(`Creator ${creatorId} not found`);
        const score = calculateCreatorScore(creator);
        set((state) => ({
          creators: state.creators.map((c) =>
            c.id === creatorId ? { ...c, score } : c
          ),
        }));
        return score;
      },

      getScoreRecommendations: (creatorId) => {
        const creator = get().creators.find((c) => c.id === creatorId);
        if (!creator || !creator.score) return [];
        return generateScoreRecommendations(creator, creator.score);
      },

      // ─── Brief Actions ──────────────────────────────────────────────────────
      saveBrief: (brief) => {
        set((state) => ({
          briefs: [...state.briefs.filter((b) => b.id !== brief.id), brief],
        }));
      },

      updateBrief: (id, data) => {
        set((state) => ({
          briefs: state.briefs.map((b) =>
            b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      publishBrief: (id) => {
        set((state) => ({
          briefs: state.briefs.map((b) =>
            b.id === id
              ? { ...b, status: 'published', updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      // ─── Saved Creator Actions ──────────────────────────────────────────────
      saveCreator: (brandId, creatorId, notes) => {
        const existing = get().savedCreators.find(
          (s) => s.brandId === brandId && s.creatorId === creatorId
        );
        if (existing) return;
        set((state) => ({
          savedCreators: [
            ...state.savedCreators,
            {
              id: `saved-${Date.now()}`,
              brandId,
              creatorId,
              notes,
              savedAt: new Date().toISOString(),
            },
          ],
        }));
      },

      unsaveCreator: (brandId, creatorId) => {
        set((state) => ({
          savedCreators: state.savedCreators.filter(
            (s) => !(s.brandId === brandId && s.creatorId === creatorId)
          ),
        }));
      },

      isCreatorSaved: (brandId, creatorId) => {
        return get().savedCreators.some(
          (s) => s.brandId === brandId && s.creatorId === creatorId
        );
      },

      // ─── Proposal & Campaign Actions ────────────────────────────────────────
      submitProposal: (proposal) => {
        set((state) => ({
          proposals: [...state.proposals.filter((p) => p.id !== proposal.id), proposal],
        }));
      },

      updateProposalStatus: (proposalId, status) => {
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? { ...p, status, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      createCampaign: (campaign) => {
        set((state) => ({
          campaigns: [...state.campaigns, campaign],
        }));
      },

      updateCampaign: (id, data) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      updateMilestone: (campaignId, milestoneId, status) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            return {
              ...c,
              milestones: c.milestones.map((m) =>
                m.id === milestoneId
                  ? {
                      ...m,
                      status,
                      completedAt:
                        status === 'approved' ? new Date().toISOString() : m.completedAt,
                    }
                  : m
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      sendMessage: (campaignId, message) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            return {
              ...c,
              messages: [...c.messages, message],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // ─── Search Filter Actions ──────────────────────────────────────────────
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        }));
      },

      setSearchSort: (sort) => set({ searchSort: sort }),
      setActiveBriefId: (id) => set({ activeBriefId: id }),

      resetSearchFilters: () =>
        set({ searchFilters: DEFAULT_FILTERS, activeBriefId: null }),

      // ─── Demo Reset ─────────────────────────────────────────────────────────
      resetToSeedData: () => {
        set({
          creators: initializeCreators(SEED_CREATORS),
          briefs: SEED_BRIEFS,
          campaigns: SEED_CAMPAIGNS,
          savedCreators: SEED_SAVED_CREATORS,
          searchFilters: DEFAULT_FILTERS,
          searchSort: 'best_match',
          activeBriefId: null,
        });
      },
    }),
    {
      name: 'crab-app-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        creators: state.creators,
        briefs: state.briefs,
        campaigns: state.campaigns,
        savedCreators: state.savedCreators,
        proposals: state.proposals,
        searchFilters: state.searchFilters,
        searchSort: state.searchSort,
      }),
    }
  )
);
