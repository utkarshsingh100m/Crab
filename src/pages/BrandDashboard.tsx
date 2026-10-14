import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { EmptyState } from '../components/ui/States';
import {
  FileText,
  Briefcase,
  Search,
  ArrowRight,
  Star,
  Plus,
  BookmarkCheck,
  Megaphone,
  Loader,
  BookmarkPlus,
} from 'lucide-react';
import { formatCurrency, formatRelativeTime, cn } from '../lib/utils';

export function BrandDashboard() {
  const { currentUser, creators, briefs, campaigns, savedCreators } = useAppStore();

  const myBriefs = briefs.filter((b) => b.brandId === currentUser?.id);
  const myCampaigns = campaigns.filter((c) => c.brandId === currentUser?.id);
  const mySaved = savedCreators.filter((s) => s.brandId === currentUser?.id);

  const activeCampaigns = myCampaigns.filter((c) => c.status === 'active');
  const publishedBriefs = myBriefs.filter((b) => b.status === 'published');
  const allApplications = 28; // demo count

  const topCreators = [...creators]
    .sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0))
    .slice(0, 4);

  const recentBriefs = myBriefs.slice(0, 3);

  const kpiCards = [
    {
      label: 'Active Briefs',
      value: publishedBriefs.length || 12,
      delta: '+2 this week',
      deltaGood: true,
      icon: '📣',
      iconBg: 'bg-orange-50 text-[#E65D2E]',
    },
    {
      label: 'Applications',
      value: allApplications,
      delta: '8 new unread',
      deltaGood: true,
      icon: '📋',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Shortlisted Creators',
      value: mySaved.length || 5,
      delta: 'Ready to hire',
      deltaGood: null,
      icon: '🔖',
      iconBg: 'bg-rose-50 text-rose-500',
    },
    {
      label: 'Ongoing Projects',
      value: activeCampaigns.length || 3,
      delta: 'In production',
      deltaGood: null,
      icon: '⚙️',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-normal text-[#1C1613] font-serif-display">
            Welcome back, {currentUser?.displayName?.split(' ')[0] ?? 'there'}!
          </h1>
          <p className="text-sm text-[#78716C] mt-1">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems active
          </span>
        </div>
      </section>

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {kpiCards.map(({ label, value, delta, deltaGood, icon, iconBg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-[#EAE4DC]/80 shadow-sm hover:border-[#E65D2E]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#78716C] uppercase tracking-wider">{label}</span>
              <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs', iconBg)}>
                {icon}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-normal text-[#1C1613] font-serif-display">{value}</span>
              {delta && (
                <span className={cn('text-xs font-medium', deltaGood === true ? 'text-emerald-600' : 'text-[#78716C]')}>
                  {delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Briefs (8 cols) */}
        <section className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#EAE4DC]/80 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-bold text-[#1C1613]">Recent Briefs</h2>
              <p className="text-xs text-[#78716C] mt-0.5">Manage and view submissions for current campaigns</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                to="/brand/briefs/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E65D2E] hover:bg-[#C94B27] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Plus size={13} /> Post Brief
              </Link>
              <Link
                to="/brand/briefs"
                className="text-xs font-semibold text-[#E65D2E] hover:text-[#C94B27] transition-colors inline-flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {recentBriefs.length === 0 ? (
            <EmptyState
              icon={<FileText size={24} />}
              title="No briefs yet"
              description="Create your first brief to start finding AI creators."
              action={
                <Link to="/brand/briefs/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[#E65D2E] text-white rounded-full text-sm font-medium hover:bg-[#C94B27] transition-colors">
                  <Plus size={14} /> Create Brief
                </Link>
              }
            />
          ) : (
            <div className="space-y-3.5">
              {recentBriefs.map((brief, i) => {
                const icons = ['🪄', '👕', '🎬'];
                const iconBgs = ['bg-orange-100/70 border-orange-200/50 text-[#E65D2E]', 'bg-rose-100/70 border-rose-200/50 text-rose-600', 'bg-amber-100/70 border-amber-200/50 text-amber-600'];
                return (
                  <div
                    key={brief.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#EAE4DC]/60 hover:border-[#E65D2E]/40 hover:bg-[#FDFBF9] transition-all gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center text-sm shrink-0', iconBgs[i % iconBgs.length])}>
                        {icons[i % icons.length]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#1C1613] group-hover:text-[#E65D2E] transition-colors">
                          {brief.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#78716C]">
                          <span>{formatCurrency(brief.budget)}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(brief.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
                        brief.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-stone-100 text-stone-600 border-stone-200/60'
                      )}>
                        {brief.status === 'published' ? 'Active' : brief.status}
                      </span>
                      <Link
                        to={`/marketplace?briefId=${brief.id}`}
                        className="text-xs font-medium text-[#E65D2E] hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                );
              })}
              {/* Demo briefs if less than 3 */}
              {recentBriefs.length < 3 && [
                { title: 'Futuristic Product Launch', apps: 14, time: '2 weeks left' },
                { title: 'AI Fashion Campaign', apps: 18, time: '3 weeks left' },
              ].slice(0, 3 - recentBriefs.length).map((d, i) => (
                <div key={d.title} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#EAE4DC]/60 hover:border-[#E65D2E]/40 hover:bg-[#FDFBF9] transition-all gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-orange-100/70 border border-orange-200/50 flex items-center justify-center text-sm shrink-0 text-[#E65D2E]">🪄</div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#1C1613] group-hover:text-[#E65D2E] transition-colors">{d.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#78716C]">
                        <span>{d.apps} applications</span><span>•</span><span>{d.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">Active</span>
                    <span className="text-xs font-medium text-[#E65D2E] hover:underline cursor-pointer">View →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA when briefs exist */}
          {recentBriefs.length > 0 && (
            <div className="mt-6 pt-5 border-t border-stone-100">
              <Link
                to="/brand/briefs/new"
                className="w-full py-2.5 px-4 bg-[#E65D2E] hover:bg-[#C94B27] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={14} /> Post a New Brief
              </Link>
            </div>
          )}
        </section>

        {/* Recommended Creators (4 cols) */}
        <section className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE4DC]/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#1C1613]">Recommended Creators</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-[#E65D2E] hover:underline">
              See All
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {topCreators.map((creator) => (
              <div key={creator.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={creator.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${creator.id}`}
                    alt={creator.displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FAF7F2] shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="text-sm font-semibold text-[#1C1613] truncate">{creator.displayName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] mt-0.5">
                      <Star size={10} className="text-amber-500 fill-amber-500" />
                      <span className="font-medium text-[#1C1613]">{((creator.score?.total ?? 80) / 20).toFixed(1)}</span>
                      <span className="text-stone-400">·</span>
                      <span className="truncate capitalize">{creator.categories[0]?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/creator/${creator.id}`}
                  aria-label={`View ${creator.displayName}`}
                  className="w-8 h-8 rounded-full border border-[#EAE4DC] flex items-center justify-center text-[#1C1613] hover:bg-[#E65D2E] hover:text-white hover:border-[#E65D2E] transition-colors shrink-0 shadow-xs"
                >
                  <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>

          {/* Browse CTA */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            <Link
              to="/marketplace"
              className="w-full py-2.5 px-3 bg-[#FAF7F2] hover:bg-stone-100 text-[#1C1613] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-[#EAE4DC]/60 transition-colors"
            >
              <Search size={12} className="text-[#E65D2E]" />
              Browse All Creators
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
