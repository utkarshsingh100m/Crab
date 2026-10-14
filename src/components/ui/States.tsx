import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// ─── Loading Spinner ──────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  return (
    <Loader2
      size={sizes[size]}
      className={cn('animate-spin text-electric-600', className)}
      aria-hidden="true"
    />
  );
}

// ─── Page Loading ─────────────────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src="/crab-logo.png"
            alt="CRAB Logo"
            className="w-16 h-16 object-contain rounded-2xl shadow-sm"
          />
          <Spinner size="lg" className="absolute -bottom-2 -right-2 text-electric-600" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Loading CRAB…</p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 max-w-sm mx-auto">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center" role="alert">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Toast-like success banner ────────────────────────────────────────────────

interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
        <span>✓</span>
        {message}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-500 hover:text-green-700 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── Demo Mode Banner ─────────────────────────────────────────────────────────

interface DemoBannerProps {
  label?: string;
}

export function DemoBanner({ label = 'Demo Mode — No AI key configured. Using deterministic mock output.' }: DemoBannerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
      <span className="font-semibold">🔧 Demo:</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────

export function CreatorCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-44 rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-2/3 rounded" />
            <div className="skeleton h-3 w-full rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="border-t border-slate-100 pt-3 flex justify-between">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden',
          maxWidth
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group/tooltip inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}
