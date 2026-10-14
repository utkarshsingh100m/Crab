// ─── Core Entity Types ────────────────────────────────────────────────────────

export type UserRole = 'brand' | 'creator' | 'admin';

export interface VerificationDocument {
  id: string;
  name: string;
  documentType: 'id_proof' | 'business_reg' | 'ip_declaration' | 'workflow_source' | 'other';
  fileSize: string;
  uploadedAt: string;
  status: 'verified' | 'under_review' | 'pending';
  fileData?: string; // Data URL for preview
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  companyName?: string;
  website?: string;
  location?: string;
  bio?: string;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  verificationDocuments?: VerificationDocument[];
  createdAt: string;
  updatedAt: string;
}

// ─── Creator Profile ──────────────────────────────────────────────────────────

export type AvailabilityStatus = 'available' | 'limited' | 'booked' | 'on_leave';
export type ContentCategory =
  | 'ai_film'
  | 'animation'
  | 'product_visuals'
  | 'social_ads'
  | 'motion_graphics'
  | 'concept_art'
  | 'vfx'
  | 'generative_art';

export type OutputFormat = 'mp4' | 'webm' | 'gif' | 'mov' | 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:1' | '21:9';

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  location: string;
  timezone: string;
  website?: string;
  categories: ContentCategory[];
  skills: string[];
  tools: string[]; // AI tools/models used
  outputFormats: OutputFormat[];
  aspectRatios: AspectRatio[];
  rateMin: number; // USD per project
  rateMax: number;
  availability: AvailabilityStatus;
  isOpenToCollaboration: boolean;
  portfolioItems: PortfolioItem[];
  score?: CreatorScore;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  verificationDocuments?: VerificationDocument[];
  joinedAt: string;
  lastActiveAt: string;
  responseTimeHours: number; // avg response time
  completedProjects: number;
  updatedAt: string;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export type EvidenceStatus = 'self_reported' | 'evidence_submitted' | 'reviewed' | 'rejected';
export type MediaType = 'image' | 'video' | 'gif' | 'embed';

export interface WorkflowStep {
  step: number;
  tool: string;
  description: string;
  outputType: string;
}

export interface PortfolioRights {
  commercialUse: boolean;
  exclusivity: boolean;
  licenseDuration: string; // e.g., "perpetual", "1 year"
  territory: string; // e.g., "worldwide", "US only"
  sourceFilesIncluded: boolean;
  thirdPartyAssets: boolean;
  thirdPartyAssetNotes?: string;
  disclosureStatement: string;
}

export interface PortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  role: string;
  category: ContentCategory;
  skills: string[];
  tools: string[];
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl: string;
  outputFormats: OutputFormat[];
  aspectRatios: AspectRatio[];
  workflowSteps: WorkflowStep[];
  rights: PortfolioRights;
  evidenceStatus: EvidenceStatus;
  clientName?: string;
  projectDate: string;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export const SCORE_VERSION = '1.0.0';

export interface ScoreComponents {
  profileCompleteness: number;    // max 15
  portfolioStrength: number;      // max 25
  aiWorkflowTransparency: number; // max 20
  skillEvidence: number;          // max 15
  commercialReadiness: number;    // max 10
  trustEvidence: number;          // max 10
  freshnessResponsiveness: number;// max 5
}

export interface CreatorScore {
  id: string;
  creatorId: string;
  total: number; // 0–100
  components: ScoreComponents;
  scoreVersion: string;
  calculatedAt: string;
}

export interface ScoreRecommendation {
  id: string;
  creatorId: string;
  category: keyof ScoreComponents;
  title: string;
  description: string;
  estimatedGain: number; // points
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  actionTarget?: string; // route to navigate to
}

// ─── Brief ────────────────────────────────────────────────────────────────────

export type BriefStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface BriefReference {
  id: string;
  briefId: string;
  url?: string;
  description: string;
  type: 'url' | 'note' | 'style_reference';
}

export interface Brief {
  id: string;
  brandId: string;
  title: string;
  objective: string;
  targetAudience: string;
  keyMessage: string;
  contentType: ContentCategory;
  styleNotes: string;
  references: BriefReference[];
  aspectRatios: AspectRatio[];
  resolution: string; // e.g., "4K", "1080p"
  durationSeconds?: number;
  deliverables: string[];
  channels: string[]; // e.g., ["instagram", "youtube"]
  territory: string;
  licenseDuration: string;
  exclusivity: boolean;
  paidMedia: boolean;
  sourceFilesRequired: boolean;
  thirdPartyAssetConstraints: string;
  budget: number; // USD
  deadline: string; // ISO date
  revisionRounds: number;
  status: BriefStatus;
  requiredOutputFormats: OutputFormat[];
  mandatoryAvailability: boolean;
  clarificationQuestions: string[]; // unknown fields become questions
  createdAt: string;
  updatedAt: string;
}

// ─── Campaign & Proposals ─────────────────────────────────────────────────────

export type ProposalStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested';
export type CampaignStatus = 'active' | 'completed' | 'cancelled' | 'on_hold';

export interface Proposal {
  id: string;
  briefId: string;
  creatorId: string;
  coverLetter: string;
  proposedBudget: number;
  proposedDeadline: string;
  deliverables: string[];
  workflowDescription: string;
  status: ProposalStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  deliverableUrl?: string;
  revisionNotes?: string;
  completedAt?: string;
  order: number;
}

export interface Campaign {
  id: string;
  briefId: string;
  proposalId: string;
  brandId: string;
  creatorId: string;
  title: string;
  status: CampaignStatus;
  agreedBudget: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  campaignId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
}

// ─── Saved Creators ───────────────────────────────────────────────────────────

export interface SavedCreator {
  id: string;
  brandId: string;
  creatorId: string;
  notes?: string;
  savedAt: string;
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

export type SortOption = 'best_match' | 'highest_score' | 'recently_updated' | 'newest';

export interface CreatorFilters {
  query: string;
  categories: ContentCategory[];
  tools: string[];
  skills: string[];
  outputFormats: OutputFormat[];
  aspectRatios: AspectRatio[];
  availability: AvailabilityStatus[];
  rateMin?: number;
  rateMax?: number;
  minScore?: number;
}

export interface RankedCreator {
  creator: CreatorProfile;
  briefMatchScore: number;       // 0–100
  profileScore: number;          // 0–100
  freshnessScore: number;        // 0–100
  finalRank: number;             // weighted composite
  rankingFactors: string[];      // human-readable explanations
  hardConstraintsPassed: boolean;
  failedConstraints: string[];
}

// ─── AI Brief Builder ─────────────────────────────────────────────────────────

export interface AIBriefResult {
  brief: Partial<Brief>;
  missingFields: string[];
  clarificationQuestions: string[];
  isDemoMode: boolean;
  confidence: number; // 0-1
}

// ─── ToolEvidence ─────────────────────────────────────────────────────────────

export interface ToolEvidence {
  id: string;
  creatorId: string;
  tool: string;
  evidenceUrl?: string;
  description: string;
  status: EvidenceStatus;
  submittedAt: string;
}
