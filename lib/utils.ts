import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HealthStatus, DealStage } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null): string {
  const num = Number(value);
  if (isNaN(num)) return '—';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export const HEALTH_CONFIG: Record<HealthStatus, { label: string; color: string; bg: string; dot: string }> = {
  healthy:  { label: 'Healthy',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  at_risk:  { label: 'At Risk',  color: 'text-amber-400',   bg: 'bg-amber-400/10',   dot: 'bg-amber-400'   },
  critical: { label: 'Critical', color: 'text-rose-400',    bg: 'bg-rose-400/10',    dot: 'bg-rose-400'    },
};

export const STAGE_CONFIG: Record<DealStage, { label: string; color: string; pct: number }> = {
  prospecting: { label: 'Prospecting', color: '#6366f1', pct: 10  },
  qualified:   { label: 'Qualified',   color: '#8b5cf6', pct: 25  },
  proposal:    { label: 'Proposal',    color: '#a855f7', pct: 50  },
  negotiation: { label: 'Negotiation', color: '#f59e0b', pct: 75  },
  closed_won:  { label: 'Closed Won',  color: '#10b981', pct: 100 },
  closed_lost: { label: 'Closed Lost', color: '#6b7280', pct: 0   },
};

export const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest', 'Pacific'];
export const INDUSTRIES = ['SaaS', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education'];
export const DEAL_STAGES: DealStage[] = ['prospecting', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
export const HEALTH_STATUSES: HealthStatus[] = ['healthy', 'at_risk', 'critical'];
