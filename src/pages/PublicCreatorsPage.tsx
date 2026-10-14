import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ScoreRing } from '../components/ui/ScoreRing';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  Film,
  ExternalLink,
  ShieldCheck,
  Star,
  Layers,
  ArrowRight,
  Eye,
  Heart,
  X,
  Play,
  CheckCircle2,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import type { CreatorProfile, PortfolioItem, ContentCategory } from '../types';
import { categoryLabel, cn } from '../lib/utils';

const CATEGORIES: { id: ContentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Fields' },
  { id: 'ai_film', label: 'AI Films' },
  { id: 'animation', label: 'Animation' },
  { id: 'generative_art', label: 'Generative Art' },
  { id: 'product_visuals', label: 'Product Visuals' },
  { id: 'social_ads', label: 'Social Ads' },
  { id: 'concept_art', label: 'Concept Art' },
  { id: 'motion_graphics', label: '3D Motion' },
];

export function PublicCreatorsPage() {
  const navigate = useNavigate();
  const { creators, currentUser, isCreatorSaved, saveCreator, unsaveCreator } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all');
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'creators' | 'works'>('creators');
  const [selectedWork, setSelectedWork] = useState<{
    work: PortfolioItem;
    creator: CreatorProfile;
  } | null>(null);

  // Identify logged in creator (if any) so we can exclude "ours"
  const myCreator = currentUser
    ? creators.find((c) => c.userId === currentUser.id)
    : null;

  // STRICT RULE: Show other public creators and their works, NOT OURS
  const otherCreators = useMemo(() => {
    return creators.filter((c) => {
      // Exclude if it's the current user's profile
      if (currentUser?.id && c.userId === currentUser.id) return false;
      if (myCreator && c.id === myCreator.id) return false;
      return true;
    });
  }, [creators, currentUser, myCreator]);

  // Extract all tools from other creators
  const allTools = useMemo(() => {
    const set = new Set<string>();
    otherCreators.forEach((c) => c.tools.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [otherCreators]);

  // Filtered other creators
  const filteredCreators = useMemo(() => {
    return otherCreators.filter((c) => {
      // Category filter
      if (selectedCategory !== 'all' && !c.categories.includes(selectedCategory)) {
        return false;
      }
      // Tool filter
      if (selectedTool !== 'all' && !c.tools.includes(selectedTool)) {
        return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.displayName.toLowerCase().includes(q);
        const matchesTagline = c.tagline.toLowerCase().includes(q);
        const matchesBio = c.bio.toLowerCase().includes(q);
        const matchesTools = c.tools.some((t) => t.toLowerCase().includes(q));
        const matchesWorks = c.portfolioItems.some(
          (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesTagline && !matchesBio && !matchesTools && !matchesWorks) {
          return false;
        }
      }
      return true;
    });
  }, [otherCreators, selectedCategory, selectedTool, searchQuery]);

  // Flattened works from other creators
  const filteredWorks = useMemo(() => {
    const list: { work: PortfolioItem; creator: CreatorProfile }[] = [];
    filteredCreators.forEach((c) => {
      c.portfolioItems.forEach((w) => {
        if (selectedCategory !== 'all' && w.category !== selectedCategory) return;
        if (selectedTool !== 'all' && !w.tools.includes(selectedTool)) return;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = w.title.toLowerCase().includes(q);
          const matchesDesc = w.description.toLowerCase().includes(q);
          const matchesCreator = c.displayName.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCreator) return;
        }
        list.push({ work: w, creator: c });
      });
    });
    return list;
  }, [filteredCreators, selectedCategory, selectedTool, searchQuery]);

  function handleSaveToggle(creatorId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!currentUser) return;
    if (isCreatorSaved(currentUser.id, creatorId)) {
      unsaveCreator(currentUser.id, creatorId);
    } else {
      saveCreator(currentUser.id, creatorId);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-sand-900 font-sans antialiased pb-24">
      {/* ── Top Header Banner ── */}
      <div className="bg-white border-b border-sand-200/80 pt-8 pb-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 mb-2">
                <Users size={13} className="text-amber-800" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Public Network Directory
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded-full font-semibold">
                  {otherCreators.length} Other Creators
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-sand-900">
                Public Creators & Verified Works
              </h1>
              <p className="text-xs sm:text-sm text-sand-800/70 mt-1 max-w-2xl">
                Explore profiles, portfolio showcases, and toolchains from other vetted AI creators across the network.
                <span className="font-semibold text-brand-accent ml-1">
                  (Showing other creators only · your own profile is excluded)
                </span>
              </p>
            </div>

            {/* Quick action for own preview */}
            {myCreator && (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/creator/${myCreator.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-sand-300 text-xs font-semibold text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition shadow-2xs"
                >
                  <Eye size={14} className="text-sand-500" />
                  <span>Preview My Own Profile</span>
                  <ArrowUpRight size={13} />
                </Link>
                <Link
                  to="/creator/profile/edit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-semibold hover:bg-brand-accent-hover transition shadow-sm"
                >
                  <Sparkles size={13} />
                  <span>Edit My Portfolio</span>
                </Link>
              </div>
            )}
          </div>

          {/* Search & View Switcher Bar */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-sand-200/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search other creators, styles, Sora, Runway, tools…"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-sand-200 bg-sand-50/60 focus:bg-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-sand-100 p-1 rounded-xl self-start sm:self-auto border border-sand-200/60">
              <button
                onClick={() => setViewMode('creators')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
                  viewMode === 'creators'
                    ? 'bg-white text-sand-900 shadow-xs'
                    : 'text-sand-600 hover:text-sand-900'
                )}
              >
                <Users size={14} />
                <span>Creators ({filteredCreators.length})</span>
              </button>
              <button
                onClick={() => setViewMode('works')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
                  viewMode === 'works'
                    ? 'bg-white text-sand-900 shadow-xs'
                    : 'text-sand-600 hover:text-sand-900'
                )}
              >
                <Film size={14} />
                <span>Works & Portfolios ({filteredWorks.length})</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer text-xs',
                  selectedCategory === cat.id
                    ? 'bg-sand-900 text-white shadow-xs'
                    : 'bg-sand-100/90 text-sand-700 hover:bg-sand-200/70 border border-sand-200/50'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* VIEW 1: Other Creators Directory */}
        {viewMode === 'creators' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-bold text-sand-500 uppercase tracking-wider">
                Showing {filteredCreators.length} Other Public Creators
              </div>
              {selectedTool !== 'all' && (
                <button
                  onClick={() => setSelectedTool('all')}
                  className="text-xs text-brand-accent hover:underline flex items-center gap-1"
                >
                  Clear Tool Filter ({selectedTool})
                </button>
              )}
            </div>

            {filteredCreators.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-200/80 shadow-xs max-w-lg mx-auto my-12">
                <Users size={36} className="mx-auto text-sand-300 mb-3" />
                <h3 className="text-base font-bold text-sand-900">No other creators match your filter</h3>
                <p className="text-xs text-sand-500 mt-1 mb-4">
                  Try clearing your search term or selecting "All Fields" to see more creators.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedTool('all');
                  }}
                  className="px-4 py-2 bg-sand-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator) => {
                  const isSaved = currentUser ? isCreatorSaved(currentUser.id, creator.id) : false;
                  const totalWorks = creator.portfolioItems.length;

                  return (
                    <div
                      key={creator.id}
                      onClick={() => navigate(`/creator/${creator.id}`)}
                      className="bg-white rounded-3xl border border-sand-200/90 shadow-sm hover:shadow-md transition duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        {/* Creator Banner Thumbnail */}
                        <div className="h-28 w-full relative overflow-hidden bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100">
                          {creator.bannerUrl ? (
                            <img
                              src={creator.bannerUrl}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-stone-200 to-amber-100" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-sand-900 border border-sand-200/60 shadow-2xs">
                              {creator.score?.total || 85} Score
                            </span>

                            <button
                              type="button"
                              onClick={(e) => handleSaveToggle(creator.id, e)}
                              className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-2xs cursor-pointer',
                                isSaved
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : 'bg-white/80 text-sand-700 hover:bg-white hover:text-sand-900'
                              )}
                              title={isSaved ? 'Saved to bookmarks' : 'Save creator'}
                            >
                              <Heart size={14} className={isSaved ? 'fill-rose-600 text-rose-600' : ''} />
                            </button>
                          </div>
                        </div>

                        {/* Avatar & Header Meta */}
                        <div className="px-6 pt-0 pb-4 relative">
                          <div className="-mt-10 mb-3 flex items-end justify-between">
                            <div className="relative">
                              <img
                                src={creator.avatarUrl}
                                alt={creator.displayName}
                                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-white" />
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-sand-400 tracking-wider block">
                                Rate
                              </span>
                              <span className="text-xs font-bold text-sand-900">
                                ${creator.rateMin.toLocaleString()} - ${creator.rateMax.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-base text-sand-900 group-hover:text-brand-accent transition-colors leading-snug">
                              {creator.displayName}
                            </h3>
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          </div>

                          <p className="text-xs text-sand-600 line-clamp-1 mb-2 font-medium">
                            {creator.tagline}
                          </p>

                          <p className="text-xs text-sand-500 line-clamp-2 leading-relaxed mb-4">
                            {creator.bio}
                          </p>

                          {/* Tools Strip */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {creator.tools.slice(0, 3).map((tool) => (
                              <span
                                key={tool}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sand-100 text-sand-700 border border-sand-200/60"
                              >
                                {tool}
                              </span>
                            ))}
                            {creator.tools.length > 3 && (
                              <span className="text-[10px] text-sand-400 font-medium px-1.5 py-0.5">
                                +{creator.tools.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Mini Works Gallery Preview */}
                          <div className="pt-3 border-t border-sand-100">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-sand-500 mb-2">
                              <span>Public Works ({totalWorks})</span>
                              <span className="text-[10px] text-brand-accent group-hover:underline">
                                View Portfolio →
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {creator.portfolioItems.slice(0, 3).map((item) => (
                                <div
                                  key={item.id}
                                  className="aspect-square rounded-xl overflow-hidden bg-sand-100 relative group/thumb border border-sand-200/60"
                                >
                                  <img
                                    src={item.thumbnailUrl || item.mediaUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="px-6 py-3.5 bg-sand-50/70 border-t border-sand-100 flex items-center justify-between">
                        <span className="text-xs text-sand-500 font-medium">
                          {creator.location || 'Global Artist'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-sand-900 group-hover:text-brand-accent transition-colors">
                          <span>View Profile & Works</span>
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Public Works & Portfolios Gallery */}
        {viewMode === 'works' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-bold text-sand-500 uppercase tracking-wider">
                Showing {filteredWorks.length} Verified Commercial Works from Other Creators
              </div>
            </div>

            {filteredWorks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-200/80 shadow-xs max-w-lg mx-auto my-12">
                <Film size={36} className="mx-auto text-sand-300 mb-3" />
                <h3 className="text-base font-bold text-sand-900">No portfolio works match your filter</h3>
                <p className="text-xs text-sand-500 mt-1 mb-4">
                  Try clearing your search term or selecting another category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-sand-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorks.map(({ work, creator }) => (
                  <div
                    key={work.id}
                    onClick={() => setSelectedWork({ work, creator })}
                    className="bg-white rounded-3xl border border-sand-200/90 shadow-sm hover:shadow-md transition duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Media Thumbnail */}
                      <div className="aspect-video w-full relative overflow-hidden bg-sand-100">
                        <img
                          src={work.thumbnailUrl || work.mediaUrl}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-sand-900 flex items-center justify-center shadow-md">
                            <Play size={16} className="fill-sand-900 ml-0.5" />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-sand-900 border border-sand-200/60 uppercase tracking-wider shadow-2xs">
                            {categoryLabel(work.category)}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-base text-sand-900 group-hover:text-brand-accent transition-colors leading-snug mb-1">
                          {work.title}
                        </h3>
                        <p className="text-xs text-sand-500 line-clamp-2 leading-relaxed mb-4">
                          {work.description}
                        </p>

                        {/* Toolchain tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {work.tools.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sand-100 text-sand-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Creator attribution line */}
                        <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={creator.avatarUrl}
                              alt={creator.displayName}
                              className="w-6 h-6 rounded-full object-cover border border-sand-200"
                            />
                            <div>
                              <span className="text-xs font-semibold text-sand-800 block leading-tight">
                                {creator.displayName}
                              </span>
                              <span className="text-[10px] text-sand-400 block">
                                {creator.score?.total || 85} Score
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-brand-accent group-hover:underline flex items-center gap-0.5">
                            Details <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Work Detail Modal ── */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedWork(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-sand-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-sand-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                  {categoryLabel(selectedWork.work.category)}
                </span>
                <h2 className="text-xl font-bold text-sand-900 mt-0.5">
                  {selectedWork.work.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-sand-600 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Media Preview */}
              <div className="rounded-2xl overflow-hidden bg-sand-950 aspect-video relative flex items-center justify-center">
                <img
                  src={selectedWork.work.mediaUrl}
                  alt={selectedWork.work.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sand-500 mb-1">
                  Creative Overview
                </h4>
                <p className="text-sm text-sand-700 leading-relaxed">
                  {selectedWork.work.description}
                </p>
              </div>

              {/* Toolchain Used */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sand-500 mb-2">
                  Verified Tools & Pipeline
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWork.work.tools.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-lg bg-sand-100 border border-sand-200/80 text-xs font-semibold text-sand-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Workflow Breakdown */}
              {selectedWork.work.workflowSteps && selectedWork.work.workflowSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sand-500 mb-2">
                    Transparent Workflow Steps
                  </h4>
                  <div className="space-y-2 bg-sand-50 p-3.5 rounded-2xl border border-sand-200/70">
                    {selectedWork.work.workflowSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {step.step || idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-sand-900">{step.tool}: </span>
                          <span className="text-sand-600">{step.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creator Attribution Card */}
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedWork.creator.avatarUrl}
                    alt={selectedWork.creator.displayName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-sand-900 flex items-center gap-1.5">
                      <span>{selectedWork.creator.displayName}</span>
                      <ShieldCheck size={14} className="text-emerald-600" />
                    </h4>
                    <p className="text-xs text-sand-500 line-clamp-1">{selectedWork.creator.tagline}</p>
                    <span className="text-[11px] font-semibold text-brand-accent mt-0.5 block">
                      {selectedWork.creator.score?.total || 85} Score · Verified Creator
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate(`/creator/${selectedWork.creator.id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-sand-900 text-white text-xs font-semibold hover:bg-black transition flex items-center gap-1.5 shrink-0"
                >
                  <span>View Full Profile</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sand-50 border-t border-sand-200/80 flex items-center justify-end">
              <button
                onClick={() => setSelectedWork(null)}
                className="px-5 py-2 rounded-xl bg-white border border-sand-300 text-xs font-semibold text-sand-700 hover:bg-sand-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
