import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreRing';
import { EmptyState, SuccessBanner } from '../components/ui/States';
import { Link } from 'react-router-dom';
import {
  ImagePlus,
  Star,
  RefreshCw,
  ArrowRight,
  Shield,
  DollarSign,
  TrendingUp,
  Video,
  Image,
  Boxes,
} from 'lucide-react';
import {
  cn,
  formatRelativeTime,
  scoreColor,
  categoryLabel,
} from '../lib/utils';

const SCORE_COMPONENT_META = {
  profileCompleteness:     { label: 'Profile Completeness',     max: 15 },
  portfolioStrength:       { label: 'Portfolio Strength',        max: 25 },
  aiWorkflowTransparency:  { label: 'AI Workflow Transparency',  max: 20 },
  skillEvidence:           { label: 'Skill Evidence',            max: 15 },
  commercialReadiness:     { label: 'Commercial Readiness',      max: 10 },
  trustEvidence:           { label: 'Trust & Evidence',          max: 10 },
  freshnessResponsiveness: { label: 'Freshness & Response',      max: 5 },
};

export function CreatorDashboard() {
  const { currentUser, creators, campaigns, briefs, recalculateScore, getScoreRecommendations } = useAppStore();
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  const creator = creators.find((c) => c.userId === currentUser?.id) ?? creators[0];
  const score = creator?.score;
  const recommendations = creator ? getScoreRecommendations(creator.id) : [];
  const myCampaigns = campaigns.filter((c) => c.creatorId === creator?.id);
  const activeCampaigns = myCampaigns.filter((c) => c.status === 'active');
  const publishedBriefs = briefs.filter((b) => b.status === 'published');

  function handleRecalculate() {
    if (!creator) return;
    recalculateScore(creator.id);
    setRecalcSuccess(true);
    setTimeout(() => setRecalcSuccess(false), 3000);
  }

  if (!creator) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <EmptyState
          title="No creator profile found"
          description="Set up your profile to start receiving brief invitations."
          action={<Link to="/creator/portfolio" className="inline-flex items-center gap-2 px-4 py-2 bg-[#E65D2E] text-white rounded-full text-sm font-medium hover:bg-[#C94B27] transition-colors">Create Profile</Link>}
        />
      </div>
    );
  }

  const dayData = [35, 48, 42, 65, 75, 88, 100];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-normal text-[#1C1613] font-serif-display">
          Welcome back, {creator.displayName.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-[#78716C]">Here's an overview of your creative journey.</p>
      </header>

      {recalcSuccess && (
        <div className="mb-6">
          <SuccessBanner message="Profile score recalculated successfully!" />
        </div>
      )}

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
        {[
          { label: 'Total Projects', value: creator.completedProjects > 0 ? `${creator.completedProjects}+` : '50+' },
          { label: 'Active Proposals', value: '24' },
          { label: 'Ongoing Projects', value: activeCampaigns.length || 3 },
          { label: 'Average Rating', value: '4.9', suffix: '★' },
        ].map(({ label, value, suffix }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors">
            <span className="text-xs md:text-sm font-medium text-[#78716C]">{label}</span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-bold text-[#1C1613] tracking-tight">{value}</span>
              {suffix && <span className="text-amber-500 text-lg">{suffix}</span>}
            </div>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Opportunities (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-[#1C1613]">Recent Opportunities</h2>
            <Link to="/creator/opportunities" className="text-sm font-semibold text-[#E65D2E] hover:text-[#C94B27] transition-colors">
              See All
            </Link>
          </div>

          {publishedBriefs.slice(0, 3).map((brief, i) => {
            const colors = [
              { bg: 'bg-orange-50 border-orange-100', icon: 'text-[#E65D2E]', IconComp: Video },
              { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-600', IconComp: Image },
              { bg: 'bg-teal-50 border-teal-100', icon: 'text-teal-600', IconComp: Boxes },
            ];
            const style = colors[i % colors.length];
            return (
              <article
                key={brief.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center shrink-0', style.bg)}>
                    <style.IconComp size={22} className={style.icon} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-[#1C1613] text-base">{brief.title}</h3>
                      <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide bg-[#FDF1EC] text-[#E65D2E] rounded-full">New</span>
                    </div>
                    <p className="text-xs md:text-sm text-[#78716C] mt-1">
                      <strong className="font-semibold text-[#1C1613]">${(brief.budget / 1000).toFixed(0)}K</strong>
                      <span className="mx-1">•</span>
                      {formatRelativeTime(brief.createdAt ?? new Date().toISOString())}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <span className="text-xs text-stone-400">{formatRelativeTime(brief.createdAt ?? new Date().toISOString())}</span>
                  <Link
                    to="/creator/opportunities"
                    className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}

          {publishedBriefs.length === 0 && [
            { title: 'Futuristic Product Launch', brand: 'LumaTech', budget: '$5K – $8K', age: '2 days ago' },
            { title: 'AI Fashion Campaign', brand: 'Vera Studios', budget: '$2K – $4K', age: '3 days ago' },
            { title: 'VR World Visuals', brand: 'Horizon Labs', budget: '$4K – $6K', age: '5 days ago' },
          ].map((opp, i) => {
            const colors = [
              { bg: 'bg-orange-50 border-orange-100', icon: 'text-[#E65D2E]' },
              { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-600' },
              { bg: 'bg-teal-50 border-teal-100', icon: 'text-teal-600' },
            ];
            const s = colors[i];
            return (
              <article key={opp.title} className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center shrink-0', s.bg)}>
                    <Video size={22} className={s.icon} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-[#1C1613] text-base">{opp.title}</h3>
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FDF1EC] text-[#E65D2E] rounded-full">New</span>
                    </div>
                    <p className="text-xs text-[#78716C] mt-1">{opp.brand} <span className="mx-1">•</span> <strong className="font-semibold text-[#1C1613]">{opp.budget}</strong></p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <span className="text-xs text-stone-400">{opp.age}</span>
                  <Link to="/creator/opportunities" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition">
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* Analytics panel (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Performance chart */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#1C1613]">Performance</h2>
                <p className="text-xs text-[#78716C] mt-0.5">Profile Views</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+32% this month</span>
                <p className="text-lg font-bold text-[#1C1613] mt-0.5">120 max</p>
              </div>
            </div>
            <div className="pt-4 pb-2">
              <div className="h-32 flex items-end justify-between gap-2 px-1">
                {dayData.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-colors',
                        i === dayData.length - 1
                          ? 'bg-[#E65D2E]'
                          : h >= 75
                          ? 'bg-orange-300 hover:bg-[#E65D2E]'
                          : h >= 60
                          ? 'bg-orange-200 hover:bg-[#E65D2E]'
                          : 'bg-orange-100 hover:bg-[#E65D2E]'
                      )}
                      style={{ height: `${h}%` }}
                    />
                    <span className={cn('text-[10px]', i === dayData.length - 1 ? 'font-bold text-[#E65D2E]' : 'text-stone-400')}>
                      {days[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Score */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#E65D2E]" />
                <h2 className="text-base font-bold text-[#1C1613]">Profile Score</h2>
              </div>
              <button
                onClick={handleRecalculate}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
                title="Recalculate score"
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            </div>
            <div className="flex items-center justify-center mb-4">
              <ScoreRing score={score?.total ?? 72} size="lg" />
            </div>
            <div className="space-y-2.5">
              {Object.entries(SCORE_COMPONENT_META).slice(0, 4).map(([key, meta]) => {
                const val = score?.[key as keyof typeof score] as number | undefined;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#78716C]">{meta.label}</span>
                      <span className="font-semibold text-[#1C1613]">{val ?? 0}/{meta.max}</span>
                    </div>
                    <ScoreBar label={meta.label} value={val ?? 0} max={meta.max} />
                  </div>
                );
              })}
            </div>
            <Link
              to="/creator/dashboard"
              className="mt-4 text-xs font-semibold text-[#E65D2E] hover:underline flex items-center gap-1"
            >
              See full breakdown <ArrowRight size={11} />
            </Link>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1C1613]">Earnings</h2>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18% this month</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1C1613] tracking-tight">$2,480</span>
                <span className="text-xs text-stone-400">USD</span>
              </div>
              <p className="text-xs text-[#78716C] mt-1">Available for automatic payout on Nov 1st.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Connected: Stripe Express</span>
              <button className="px-4 py-2 text-xs font-semibold text-[#E65D2E] bg-[#FDF1EC] hover:bg-orange-100 rounded-xl transition-colors">
                Withdraw Funds
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
