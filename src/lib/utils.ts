import clsx from 'clsx';

export { clsx as cn };

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return 'just now';
  if (hours < 1) return `${minutes}m ago`;
  if (days < 1) return `${hours}h ago`;
  if (weeks < 1) return `${days}d ago`;
  if (months < 1) return `${weeks}w ago`;
  return `${months}mo ago`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-electric-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-electric-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-400';
}

export function availabilityLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Available',
    limited: 'Limited',
    booked: 'Booked',
    on_leave: 'On Leave',
  };
  return labels[status] ?? status;
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    ai_film: 'AI Film',
    animation: 'Animation',
    product_visuals: 'Product Visuals',
    social_ads: 'Social Ads',
    motion_graphics: 'Motion Graphics',
    concept_art: 'Concept Art',
    vfx: 'VFX',
    generative_art: 'Generative Art',
  };
  return labels[cat] ?? cat;
}

export function evidenceLabel(status: string): string {
  const labels: Record<string, string> = {
    self_reported: 'Self-Reported',
    evidence_submitted: 'Evidence Submitted',
    reviewed: 'Verified',
    rejected: 'Rejected',
  };
  return labels[status] ?? status;
}

export function milestoneStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    submitted: 'Submitted for Review',
    approved: 'Approved',
    revision_requested: 'Revision Requested',
  };
  return labels[status] ?? status;
}

export function campaignStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    on_hold: 'On Hold',
  };
  return labels[status] ?? status;
}
