import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { rankCreators } from '../lib/ranking';
import { CreatorCard } from '../components/ui/CreatorCard';
import { EmptyState } from '../components/ui/States';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Info,
  Users,
  Sparkles,
} from 'lucide-react';
import type { ContentCategory, OutputFormat, AspectRatio, AvailabilityStatus, SortOption } from '../types';
import { categoryLabel, cn } from '../lib/utils';

const SORT_OPTIONS: { value: SortOption; label: string; desc: string }[] = [
  { value: 'best_match', label: 'Best Match', desc: 'Weighted score: 60% brief match + 30% profile + 10% freshness' },
  { value: 'highest_score', label: 'Highest Profile Score', desc: 'Ranked by deterministic CRAB profile score' },
  { value: 'recently_updated', label: 'Recently Updated', desc: 'Creators who updated profiles or portfolio most recently' },
  { value: 'newest', label: 'New Creators', desc: 'Most recently joined the platform' },
];

const CATEGORIES: ContentCategory[] = [
  'ai_film', 'animation', 'product_visuals', 'social_ads',
  'motion_graphics', 'concept_art', 'vfx', 'generative_art',
];

const TOOLS = [
  'Sora', 'Runway Gen-3', 'DALL·E 3', 'Midjourney v6',
  'ComfyUI', 'Stable Diffusion XL', 'Kling', 'ElevenLabs',
];

const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3', '2:1'];
const AVAILABILITY: AvailabilityStatus[] = ['available', 'limited'];

export function MarketplacePage() {
  const {
    creators,
    briefs,
    searchFilters,
    searchSort,
    activeBriefId,
    setSearchFilters,
    setSearchSort,
    setActiveBriefId,
    resetSearchFilters,
  } = useAppStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const activeBrief = briefs.find((b) => b.id === activeBriefId);

  // Ranked creators based on current filters + active brief
  const rankedCreators = useMemo(() => {
    return rankCreators(creators, searchFilters, searchSort, activeBrief);
  }, [creators, searchFilters, searchSort, activeBrief]);

  const activeFilterCount =
    (searchFilters.query ? 1 : 0) +
    searchFilters.categories.length +
    searchFilters.tools.length +
    searchFilters.aspectRatios.length +
    searchFilters.availability.length;

  function toggleCategory(cat: ContentCategory) {
    const next = searchFilters.categories.includes(cat)
      ? searchFilters.categories.filter((c) => c !== cat)
      : [...searchFilters.categories, cat];
    setSearchFilters({ categories: next });
  }

  function toggleTool(tool: string) {
    const next = searchFilters.tools.includes(tool)
      ? searchFilters.tools.filter((t) => t !== tool)
      : [...searchFilters.tools, tool];
    setSearchFilters({ tools: next });
  }

  function toggleAspectRatio(ar: AspectRatio) {
    const next = searchFilters.aspectRatios.includes(ar)
      ? searchFilters.aspectRatios.filter((a) => a !== ar)
      : [...searchFilters.aspectRatios, ar];
    setSearchFilters({ aspectRatios: next });
  }

  function toggleAvailability(av: AvailabilityStatus) {
    const next = searchFilters.availability.includes(av)
      ? searchFilters.availability.filter((a) => a !== av)
      : [...searchFilters.availability, av];
    setSearchFilters({ availability: next });
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-sand-900 font-sans antialiased flex flex-col">
      {/* ── BEGIN: SearchHeroBar ── */}
      <section className="py-8 border-b border-sand-200/80 bg-[#FAF8F5]" data-purpose="search-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark mb-2">
              Explore AI Creators & Directors
            </h1>
            <p className="text-sm text-brand-muted max-w-lg mx-auto">
              Vetted generative filmmakers, animators, and prompt craft masters with verified commercial pipelines.
            </p>
          </div>

          {/* Centered Search Box */}
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sand-800/40">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchFilters.query}
                onChange={(e) => setSearchFilters({ query: e.target.value })}
                placeholder="Search by creator name, tool (Sora, Runway), bio or skills…"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-sand-200 bg-white/90 focus:bg-white text-sm text-sand-900 placeholder-sand-800/50 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent shadow-xs transition-all"
              />
              {searchFilters.query && (
                <button
                  onClick={() => setSearchFilters({ query: '' })}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-sand-800/40 hover:text-sand-900"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-3 rounded-full border border-sand-200 bg-white hover:bg-sand-50 text-sand-800 transition-colors shadow-xs"
              aria-label="Filter Preferences"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Active Brief Indicator */}
          {activeBrief && (
            <div className="mt-4 max-w-2xl mx-auto p-3 rounded-2xl bg-brand-accent-soft/70 border border-brand-accent/20 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-brand-dark">
                <Sparkles size={14} className="text-brand-accent" />
                <span>Matching against brief: <strong>{activeBrief.title}</strong></span>
              </div>
              <button
                onClick={() => setActiveBriefId(null)}
                className="text-brand-accent hover:underline font-semibold text-[11px]"
              >
                Clear Brief Match
              </button>
            </div>
          )}
        </div>
      </section>
      {/* ── END: SearchHeroBar ── */}

      {/* ── BEGIN: MainContentArea ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left Sidebar Filters ── */}
          <aside
            className={cn(
              'w-full lg:w-64 shrink-0 bg-transparent space-y-6',
              mobileFilterOpen ? 'block' : 'hidden lg:block'
            )}
          >
            {/* Filters Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold tracking-wider text-sand-900 uppercase">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-accent text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetSearchFilters}
                  className="text-xs text-brand-accent hover:text-brand-accent-hover font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filter Group: Specialization / Category */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wider">Specialization</h3>
              <div className="space-y-2 text-xs text-sand-800/80">
                {CATEGORIES.map((cat) => {
                  const checked = searchFilters.categories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center justify-between cursor-pointer group">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(cat)}
                          className="rounded border-sand-300 text-brand-accent focus:ring-brand-accent w-4 h-4"
                        />
                        <span className={cn('group-hover:text-sand-900', checked && 'font-bold text-sand-900')}>
                          {categoryLabel(cat)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Tools */}
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wider">AI Tools & Models</h3>
              <div className="space-y-2 text-xs text-sand-800/80">
                {TOOLS.map((tool) => {
                  const checked = searchFilters.tools.includes(tool);
                  return (
                    <label key={tool} className="flex items-center justify-between cursor-pointer group">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTool(tool)}
                          className="rounded border-sand-300 text-brand-accent focus:ring-brand-accent w-4 h-4"
                        />
                        <span className={cn('group-hover:text-sand-900', checked && 'font-bold text-sand-900')}>
                          {tool}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Aspect Ratios */}
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wider">Aspect Ratio</h3>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map((ar) => {
                  const checked = searchFilters.aspectRatios.includes(ar);
                  return (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => toggleAspectRatio(ar)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-md border font-medium transition-colors',
                        checked
                          ? 'bg-brand-accent text-white border-brand-accent'
                          : 'bg-white text-sand-800 border-sand-200 hover:bg-sand-50'
                      )}
                    >
                      {ar}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Availability */}
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wider">Availability</h3>
              <div className="space-y-2 text-xs text-sand-800/80">
                {AVAILABILITY.map((av) => {
                  const checked = searchFilters.availability.includes(av);
                  return (
                    <label key={av} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAvailability(av)}
                        className="rounded border-sand-300 text-brand-accent focus:ring-brand-accent w-4 h-4"
                      />
                      <span className={cn('group-hover:text-sand-900 capitalize', checked && 'font-bold text-sand-900')}>
                        {av}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Right Results Main Area ── */}
          <section className="flex-1 w-full" data-purpose="creator-grid-results">
            {/* Results Top Meta Bar */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-sand-200/60">
              <p className="text-sm font-semibold text-sand-900">
                {rankedCreators.length} {rankedCreators.length === 1 ? 'creator' : 'creators'} found
              </p>

              <div className="flex items-center gap-2 text-xs text-sand-800">
                <span className="text-sand-800/60 font-medium">Sort by:</span>
                <select
                  value={searchSort}
                  onChange={(e) => setSearchSort(e.target.value as SortOption)}
                  className="text-xs font-semibold border-sand-200 bg-white rounded-lg py-1.5 px-3 focus:border-brand-accent focus:ring-brand-accent text-sand-900 shadow-xs cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ranking Formula Explanation Card */}
            {activeBrief && (
              <div className="mb-6 p-4 rounded-2xl bg-white border border-sand-200 shadow-xs text-xs text-sand-800">
                <div className="flex items-center gap-2 font-bold text-sand-900 mb-1">
                  <Info size={14} className="text-brand-accent" />
                  <span>Explainable Brief Ranking Active</span>
                </div>
                <p className="text-sand-800/70 leading-relaxed">
                  Ranking applies hard constraints first (content type, aspect ratio, rights, availability). Normalized signals are weighted as: <code className="bg-sand-100 px-1 py-0.5 rounded text-sand-900 font-mono">0.60 * brief_match + 0.30 * profile_score + 0.10 * freshness</code>.
                </p>
              </div>
            )}

            {/* Creators Grid */}
            {rankedCreators.length === 0 ? (
              <div className="card p-12 text-center bg-white border border-sand-200">
                <Users size={32} className="mx-auto text-sand-800/30 mb-3" />
                <h3 className="text-base font-bold text-sand-900">No creators match your filters</h3>
                <p className="text-xs text-sand-800/60 mt-1 max-w-md mx-auto">
                  Try clearing some tool or specialization filters to see more available artists.
                </p>
                <button
                  onClick={resetSearchFilters}
                  className="mt-4 px-5 py-2 rounded-full bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent-hover transition shadow-xs"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rankedCreators.map((item) => (
                  <CreatorCard
                    key={item.creator.id}
                    creator={item.creator}
                    ranked={item}
                    showRankingFactors={Boolean(activeBrief)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
