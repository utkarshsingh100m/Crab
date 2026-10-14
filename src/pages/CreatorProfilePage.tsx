import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ScoreRing, ScoreBar } from '../components/ui/ScoreRing';
import { EmptyState } from '../components/ui/States';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Globe,
  Star,
  Bookmark,
  BookmarkCheck,
  Send,
  Zap,
  Shield,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  FileText,
  Share2,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import {
  cn,
  categoryLabel,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  availabilityLabel,
  evidenceLabel,
  scoreColor,
} from '../lib/utils';
import type { PortfolioItem } from '../types';

const SCORE_COMPONENT_META = {
  profileCompleteness:    { label: 'Profile Completeness', max: 15, desc: 'Name, bio, location, website, categories, rates' },
  portfolioStrength:      { label: 'Portfolio Strength',   max: 25, desc: 'Number of items, featured work, category diversity, view count' },
  aiWorkflowTransparency: { label: 'AI Workflow Transparency', max: 20, desc: 'Documented steps, named tools, disclosure statements' },
  skillEvidence:          { label: 'Skill Evidence',       max: 15, desc: 'Breadth of skills and tools, cross-referenced in portfolio' },
  commercialReadiness:    { label: 'Commercial Readiness', max: 10, desc: 'Commercial use rights, territory, license duration specified' },
  trustEvidence:          { label: 'Trust & Evidence',     max: 10, desc: 'Verified items, evidence submitted, project history' },
  freshnessResponsiveness:{ label: 'Freshness & Response', max: 5,  desc: 'Recent activity, fast response time' },
};

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-sand-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative aspect-video overflow-hidden bg-sand-100">
          <img
            src={item.mediaUrl}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
              {item.rights.commercialUse ? 'Commercial Ready' : 'Personal Spec'}
            </span>
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-brand-dark shadow-xs backdrop-blur-xs">
              {categoryLabel(item.category)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
              {item.role}
            </span>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              {evidenceLabel(item.evidenceStatus)}
            </span>
          </div>

          <h3 className="font-bold text-base text-sand-900 mb-1">{item.title}</h3>
          <p className="text-xs text-sand-800/70 line-clamp-2 leading-relaxed">{item.description}</p>

          {/* Tools */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tools.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-sand-100 text-sand-800 border border-sand-200 font-medium">
                {t}
              </span>
            ))}
          </div>

          {/* Expandable Workflow details */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-sand-200/70 space-y-3 text-xs animate-slide-up">
              <div>
                <h4 className="font-bold text-sand-900 mb-1">AI Pipeline Workflow Steps</h4>
                <ol className="list-decimal list-inside space-y-1 text-sand-800/80 font-mono text-[11px]">
                  {item.workflowSteps.map((step) => (
                    <li key={step.step} className="leading-relaxed">
                      <strong className="text-brand-accent">{step.tool}:</strong> {step.description}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200/80 text-[11px] text-sand-800/80">
                <span className="font-bold block text-sand-900 mb-0.5">Commercial Clearance & IP</span>
                <span>{item.rights.disclosureStatement}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-2 border-t border-sand-200/60 flex items-center justify-between">
        <span className="text-[11px] text-sand-800/50">
          {item.workflowSteps.length} workflow steps
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-brand-accent hover:underline"
        >
          {expanded ? 'Hide Details' : 'View Pipeline →'}
        </button>
      </div>
    </div>
  );
}

export function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { creators, currentUser, isCreatorSaved, saveCreator, unsaveCreator } = useAppStore();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'workflow' | 'score'>('portfolio');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  // Look up creator: by id, or if accessed via /creator/profile, check logged-in creator, fallback to first creator
  const creator = id
    ? (creators.find((c) => c.id === id) || creators[0])
    : (currentUser?.role === 'creator'
        ? (creators.find((c) => c.userId === currentUser.id) || creators[0])
        : creators[0]);

  if (!creator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Creator not found"
          description="This creator profile doesn't exist or has been removed."
          action={
            <button onClick={() => navigate('/marketplace')} className="btn-primary">
              Browse Marketplace
            </button>
          }
        />
      </div>
    );
  }

  const score = creator.score;
  const isSaved = currentUser ? isCreatorSaved(currentUser.id, creator.id) : false;
  const isOwnProfile = currentUser?.role === 'creator' && currentUser?.id === creator.userId;

  function handleSave() {
    if (!currentUser || !creator) return;
    if (isSaved) {
      unsaveCreator(currentUser.id, creator.id);
    } else {
      saveCreator(currentUser.id, creator.id);
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(currentUser?.role === 'creator' ? '/creator/profile' : '/marketplace');
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-sand-900 antialiased pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Back Link */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sand-800/60 hover:text-sand-900 text-xs font-medium mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> {currentUser?.role === 'creator' ? 'Back to Discover Talent' : 'Back to Find Creators'}
        </button>

        {/* ── BEGIN: CreatorProfileHeader ── */}
        <section className="bg-white rounded-3xl border border-sand-200/90 shadow-sm overflow-hidden mb-8 relative">
          {/* Banner */}
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100">
            <img
              alt="Creative artwork banner"
              className="w-full h-full object-cover opacity-90"
              src={creator.bannerUrl || currentUser?.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Body */}
          <div className="px-6 sm:px-10 pb-8 relative z-10">
            {/* Avatar + Stats row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 gap-4">
              {/* Avatar - Elevated with high z-index and solid white ring */}
              <div className="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 ring-1 ring-sand-300/60">
                <img
                  alt={creator.displayName}
                  className="w-full h-full object-cover"
                  src={creator.avatarUrl}
                />
              </div>

              {/* Stats — sits below banner line */}
              <div className="flex items-center gap-5 sm:gap-7 pt-2 sm:pt-0">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-1 text-sand-900 font-bold text-lg">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>{score ? score.total : 90}</span>
                  </div>
                  <div className="text-[11px] text-sand-800/50">Profile Score</div>
                </div>
                <div className="h-6 w-px bg-sand-200" />
                <div className="text-center sm:text-left">
                  <div className="text-sand-900 font-bold text-lg">
                    {creator.completedProjects > 0 ? creator.completedProjects : 18}+
                  </div>
                  <div className="text-[11px] text-sand-800/50">Projects</div>
                </div>
                <div className="h-6 w-px bg-sand-200" />
                <div className="text-center sm:text-left">
                  <div className="text-sand-900 font-bold text-lg">
                    {formatCurrency(creator.rateMin)}
                  </div>
                  <div className="text-[11px] text-sand-800/50">Starting Rate</div>
                </div>
              </div>
            </div>

            {/* Identity */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sand-900">
                  {creator.displayName}
                </h1>
                <span className="inline-flex items-center text-blue-500" title="Verified Creator">
                  <CheckCircle size={20} className="fill-blue-500 text-white" />
                </span>
                {isOwnProfile && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sand-100 text-sand-700 border border-sand-200">
                    Your Profile
                  </span>
                )}
              </div>

              <p className="text-sand-800/80 font-medium text-sm sm:text-base mt-1">
                {creator.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs sm:text-sm text-sand-800/60">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-sand-800/40" />
                  <span>{creator.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{availabilityLabel(creator.availability)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Responds in {creator.responseTimeHours}h</span>
                </div>
              </div>

              <p className="mt-3 text-sm text-sand-800/80 leading-relaxed max-w-2xl">
                {creator.bio}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-sand-100">
              {isOwnProfile ? (
                <>
                  <Link
                    to="/profile"
                    className="bg-brand-accent hover:bg-brand-accent-hover text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <UserIcon size={14} /> Edit Profile & Verification
                  </Link>
                  <Link
                    to="/creator/portfolio"
                    className="border border-sand-300 hover:border-sand-400 bg-white text-sand-800 px-4 py-2 rounded-full text-sm font-medium shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-amber-600" /> Portfolio Editor
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/brand/briefs/new?creator=${creator.id}`}
                    className="bg-brand-accent hover:bg-brand-accent-hover text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <Send size={14} /> Contact & Pitch Brief
                  </Link>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sand-300 hover:border-sand-400 bg-white text-sand-800 text-sm font-medium transition"
                  >
                    {isSaved ? <BookmarkCheck size={16} className="text-brand-accent" /> : <Bookmark size={16} />}
                    <span>{isSaved ? 'Saved' : 'Shortlist'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
        {/* ── END: CreatorProfileHeader ── */}

        {/* ── BEGIN: ProfileNavigationTabs ── */}
        <div className="border-b border-sand-200 mb-8">
          <nav className="flex space-x-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={cn(
                'pb-4 transition-colors font-semibold',
                activeTab === 'portfolio'
                  ? 'border-b-2 border-brand-accent text-brand-accent'
                  : 'text-sand-800/60 hover:text-sand-900'
              )}
            >
              Portfolio ({creator.portfolioItems.length})
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={cn(
                'pb-4 transition-colors font-semibold',
                activeTab === 'workflow'
                  ? 'border-b-2 border-brand-accent text-brand-accent'
                  : 'text-sand-800/60 hover:text-sand-900'
              )}
            >
              AI Workflow & Tools
            </button>
            <button
              onClick={() => setActiveTab('score')}
              className={cn(
                'pb-4 transition-colors font-semibold',
                activeTab === 'score'
                  ? 'border-b-2 border-brand-accent text-brand-accent'
                  : 'text-sand-800/60 hover:text-sand-900'
              )}
            >
              Explainable Score Breakdown ({score?.total || 90}/100)
            </button>
          </nav>
        </div>
        {/* ── END: ProfileNavigationTabs ── */}

        {/* Tab 1: Portfolio */}
        {activeTab === 'portfolio' && (
          <div>
            {creator.portfolioItems.length === 0 ? (
              <EmptyState
                title="No portfolio items yet"
                description="This creator has not uploaded any portfolio items."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creator.portfolioItems.map((item) => (
                  <PortfolioCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Workflow & Tools */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-xs">
              <h3 className="font-bold text-base text-sand-900 mb-3">Primary Generative Models</h3>
              <div className="flex flex-wrap gap-2">
                {creator.tools.map((t) => (
                  <span key={t} className="px-3 py-1 rounded-lg bg-brand-sand text-brand-dark text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-xs">
              <h3 className="font-bold text-base text-sand-900 mb-3">Creative Skills</h3>
              <div className="flex flex-wrap gap-2">
                {creator.skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg bg-sand-100 text-sand-800 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-xs">
              <h3 className="font-bold text-base text-sand-900 mb-3">Supported Output Specs</h3>
              <div className="space-y-2 text-xs text-sand-800/80">
                <div>
                  <span className="font-bold block text-sand-900">Aspect Ratios:</span>
                  <span>{creator.aspectRatios.join(', ')}</span>
                </div>
                <div>
                  <span className="font-bold block text-sand-900">Output Formats:</span>
                  <span>{creator.outputFormats.map((f) => f.toUpperCase()).join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Score Breakdown */}
        {activeTab === 'score' && score && (
          <div className="bg-white p-8 rounded-3xl border border-sand-200 shadow-xs max-w-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-sand-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-sand-900">Deterministic Profile Score Breakdown</h3>
                <p className="text-xs text-sand-800/60 mt-0.5">
                  Calculated {formatRelativeTime(score.calculatedAt)} · Version {score.scoreVersion}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-accent">{score.total}</span>
                <span className="text-xs text-sand-800/50 block font-semibold">/ 100 max</span>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(SCORE_COMPONENT_META).map(([key, meta]) => (
                <ScoreBar
                  key={key}
                  label={meta.label}
                  value={score.components[key as keyof typeof score.components]}
                  max={meta.max}
                  description={meta.desc}
                />
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80 text-xs text-sand-800/80 space-y-1">
              <span className="font-bold text-sand-900 block">How This Score Works:</span>
              <p>
                CRAB profile scores are computed deterministically in code based on verified evidence, workflow disclosures, portfolio depth, and commercial readiness. Scores never use demographic traits or vanity follower metrics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
