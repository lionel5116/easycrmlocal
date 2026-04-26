import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: number; // positive = up
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export function KpiCard({ label, value, sub, icon: Icon, trend, onClick, className, loading }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border border-white/5 bg-[#111827] p-5 transition-colors',
        onClick && 'cursor-pointer hover:border-indigo-500/30 hover:bg-[#111827]/80',
        className
      )}
    >
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-16 rounded bg-white/10" />
          <div className="h-7 w-24 rounded bg-white/10" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
          <div className="mt-1 flex items-center gap-2">
            {trend !== undefined && (
              <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
            {sub && <span className="text-xs text-gray-500">{sub}</span>}
          </div>
          {onClick && (
            <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-indigo-500/20 pointer-events-none transition-all" />
          )}
        </>
      )}
    </div>
  );
}
