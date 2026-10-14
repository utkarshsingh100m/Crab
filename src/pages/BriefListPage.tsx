import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { FileText, Plus, Calendar, DollarSign, Users, ArrowRight, Search, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';

const CATEGORIES = ['All Briefs', 'AI Film', 'AI Fashion', 'Product Visuals', '3D & Environments', 'AI Animation'];

export function BriefListPage() {
  const { briefs, currentUser, setActiveBriefId } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('All Briefs');
  const [searchQuery, setSearchQuery] = useState('');

  const brandId = currentUser?.id || 'brand-1';
  const brandBriefs = briefs.filter((b) => b.brandId === brandId);

  const filteredBriefs = brandBriefs.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Search & Action Bar */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, brands..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE4DC] rounded-full text-sm text-[#1C1613] placeholder-stone-400 focus:outline-none focus:border-[#E65D2E] focus:ring-1 focus:ring-[#E65D2E] shadow-sm transition-all"
            />
          </div>
          <Link
            to="/brand/briefs/new"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E65D2E] hover:bg-[#C94B27] text-white text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Post a Brief
          </Link>
        </div>
      </section>

      {/* Category Pills & Sort */}
      <section className="border-b border-[#EAE4DC] pb-2 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-sm" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors',
                  activeCategory === cat
                    ? 'bg-[#E65D2E] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-stone-500 whitespace-nowrap">
            <span>Sort by:</span>
            <button className="flex items-center gap-1 font-semibold text-stone-800 hover:text-stone-950 focus:outline-none">
              <span>Newest</span>
              <ChevronDown size={14} className="text-stone-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Brief Cards */}
      {filteredBriefs.length === 0 ? (
        <div className="bg-white border border-[#EAE4DC] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#E65D2E] flex items-center justify-center mx-auto mb-4">
            <FileText size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#1C1613]">No briefs created yet</h2>
          <p className="text-[#78716C] text-sm mt-2 max-w-md mx-auto">
            Use our AI Brief Builder or manual form to define your objective, deliverables, and commercial usage rights.
          </p>
          <Link
            to="/brand/briefs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E65D2E] text-white text-sm font-medium hover:bg-[#C94B27] transition-colors mt-6"
          >
            <Plus size={16} /> Draft Your First Brief
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          {filteredBriefs.map((brief) => (
            <article
              key={brief.id}
              className="bg-white border border-[#EAE4DC] hover:border-[#E65D2E]/40 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 group"
            >
              {/* Left: details */}
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                {/* Icon thumbnail */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                  <FileText size={28} className="text-stone-400" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-base sm:text-lg font-bold text-[#1C1613] tracking-tight hover:text-[#E65D2E] transition-colors cursor-pointer truncate"
                    >
                      {brief.title}
                    </h3>
                    <span className={cn(
                      'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0',
                      brief.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : brief.status === 'closed'
                        ? 'bg-stone-100 text-stone-600 border-stone-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200/60'
                    )}>
                      {brief.status === 'published' ? 'Active' : brief.status}
                    </span>
                  </div>

                  <p className="text-sm text-[#78716C] line-clamp-2">{brief.objective}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDF1EC] text-[#E65D2E] border border-[#F8D8CB]/70">
                      {brief.contentType.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#78716C]">
                      <DollarSign size={12} />
                      {formatCurrency(brief.budget)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#78716C]">
                      <Calendar size={12} />
                      {formatDate(brief.deadline)}
                    </span>
                    {brief.aspectRatios?.map((ar) => (
                      <span key={ar} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        {ar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0">
                <Link
                  to={`/marketplace?briefId=${brief.id}`}
                  onClick={() => setActiveBriefId(brief.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E65D2E] hover:bg-[#C94B27] text-white text-xs font-semibold transition-all shadow-sm w-full md:w-auto justify-center"
                >
                  <Users size={13} /> Find Matches
                </Link>
                <Link
                  to={`/brand/briefs/new?edit=${brief.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#EAE4DC] hover:border-[#E65D2E]/40 text-[#78716C] hover:text-[#1C1613] text-xs font-semibold transition-all w-full md:w-auto justify-center"
                >
                  Edit Brief
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Demo briefs if user has none — show sample cards */}
      {filteredBriefs.length === 0 && brandBriefs.length === 0 && (
        <div className="mt-4 text-center text-xs text-stone-400">
          <p>No briefs found. Create your first brief above!</p>
        </div>
      )}
    </div>
  );
}
