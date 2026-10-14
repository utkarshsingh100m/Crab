import React from 'react';
import { cn, categoryLabel, availabilityLabel, formatCurrency, formatRelativeTime, scoreColor } from '../../lib/utils';
import { ScoreRing } from './ScoreRing';
import { MapPin, Clock, Bookmark, BookmarkCheck, Star, Zap } from 'lucide-react';
import type { CreatorProfile, RankedCreator } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

interface CreatorCardProps {
  creator: CreatorProfile;
  ranked?: RankedCreator;
  showRankingFactors?: boolean;
  className?: string;
}

const AVAILABILITY_STYLES: Record<string, string> = {
  available: 'status-available',
  limited: 'status-limited',
  booked: 'status-booked',
  on_leave: 'status-on_leave',
};

export function CreatorCard({
  creator,
  ranked,
  showRankingFactors = false,
  className,
}: CreatorCardProps) {
  const navigate = useNavigate();
  const { currentUser, isCreatorSaved, saveCreator, unsaveCreator } = useAppStore();

  const isSaved = currentUser
    ? isCreatorSaved(currentUser.id, creator.id)
    : false;

  const score = creator.score?.total ?? 0;
  const featuredItem = creator.portfolioItems.find((p) => p.featured) ?? creator.portfolioItems[0];

  function handleSaveToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!currentUser) return;
    if (isSaved) {
      unsaveCreator(currentUser.id, creator.id);
    } else {
      saveCreator(currentUser.id, creator.id);
    }
  }

  return (
    <div
      className={cn('bg-white rounded-2xl border border-sand-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden', className)}
      onClick={() => navigate(`/creator/${creator.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/creator/${creator.id}`)}
      aria-label={`View ${creator.displayName}'s profile`}
    >
      <div>
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden bg-sand-100">
          {featuredItem ? (
            <img
              src={featuredItem.thumbnailUrl}
              alt={featuredItem.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-sand-100 flex items-center justify-center">
              <span className="text-sand-800/40 text-sm">No portfolio</span>
            </div>
          )}

          {/* Availability badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-sand-900 shadow-xs flex items-center gap-1">
              {creator.availability === 'available' && <Zap size={11} className="text-brand-accent" />}
              {availabilityLabel(creator.availability)}
            </span>
          </div>

          {/* Save button */}
          {currentUser?.role === 'brand' && (
            <button
              onClick={handleSaveToggle}
              className={cn(
                'absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-xs',
                isSaved
                  ? 'bg-brand-accent text-white'
                  : 'bg-white/90 backdrop-blur-sm text-sand-800 hover:text-brand-accent'
              )}
              aria-label={isSaved ? 'Remove from saved' : 'Save creator'}
            >
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          )}

          {/* Score badge */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm flex items-center gap-1.5 border border-sand-200/60">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-sand-900">{score}</span>
              <span className="text-[10px] text-sand-800/50 uppercase font-semibold">pts</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Avatar + Name */}
          <div className="flex items-start gap-3 mb-2.5">
            <img
              src={creator.avatarUrl}
              alt={creator.displayName}
              className="w-10 h-10 rounded-full object-cover border border-sand-200 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-sand-900 truncate group-hover:text-brand-accent transition-colors">
                  {creator.displayName}
                </h3>
                {creator.completedProjects === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-sand text-brand-dark font-medium">New</span>
                )}
              </div>
              <p className="text-xs text-sand-800/70 line-clamp-1 mt-0.5 font-sans">
                {creator.tagline}
              </p>
            </div>
          </div>

          {/* Categories & Tool Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {creator.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[11px] px-2.5 py-0.5 rounded-full bg-sand-100 text-sand-800 font-medium border border-sand-200/80">
                {categoryLabel(cat)}
              </span>
            ))}
            {creator.tools.slice(0, 2).map((tool) => (
              <span key={tool} className="text-[11px] px-2.5 py-0.5 rounded-md bg-brand-sand text-brand-dark font-medium">
                {tool}
              </span>
            ))}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-sand-800/60 mb-2">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {creator.location.split(',')[0]}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {creator.responseTimeHours < 24
                ? `${creator.responseTimeHours}h response`
                : `${Math.round(creator.responseTimeHours / 24)}d response`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Rate & Score */}
      <div className="p-4 pt-3 border-t border-sand-200/60 flex items-center justify-between bg-sand-50/50">
        <span className="text-xs font-semibold text-sand-900">
          {formatCurrency(creator.rateMin)} – {formatCurrency(creator.rateMax)}
        </span>
        <span className="text-xs font-medium text-brand-accent group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
          View Profile →
        </span>
      </div>

      {/* Ranking factors (optional) */}
      {showRankingFactors && ranked && ranked.rankingFactors.length > 0 && (
        <div className="p-3 bg-sand-50 border-t border-sand-200/60 text-xs">
          <p className="text-[10px] text-sand-800/60 font-semibold uppercase tracking-wide mb-1">
            Why this match
          </p>
          <ul className="space-y-0.5">
            {ranked.rankingFactors.slice(0, 2).map((f, i) => (
              <li key={i} className="text-[11px] text-sand-800">• {f}</li>
            ))}
          </ul>
          {!ranked.hardConstraintsPassed && (
            <div className="mt-1.5 p-1.5 bg-red-50 rounded border border-red-100">
              <p className="text-[10px] text-red-600 font-semibold">⚠ Constraint mismatch</p>
              {ranked.failedConstraints.map((c, i) => (
                <p key={i} className="text-[10px] text-red-500">{c}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
