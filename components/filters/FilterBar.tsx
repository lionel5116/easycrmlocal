'use client';
import { useFilterStore } from '@/stores/filter-store';
import { REGIONS, HEALTH_STATUSES, DEAL_STAGES, INDUSTRIES, cn } from '@/lib/utils';
import { type HealthStatus, type DealStage } from '@/lib/types';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useState, useRef } from 'react';

interface FilterBarProps {
  entity: 'contacts' | 'deals' | 'dashboard';
  className?: string;
}

const DATE_OPTIONS = [
  { value: '', label: 'All time' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'this_year', label: 'This year' },
];

function MultiSelect<T extends string>({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (val: T[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (val: T) => {
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
          selected.length > 0
            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
        )}
      >
        {placeholder}
        {selected.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold">
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-44 rounded-xl border border-white/10 bg-[#1f2937] shadow-xl py-1">
          {options.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggle(value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors',
                selected.includes(value)
                  ? 'text-indigo-300 bg-indigo-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              )}
            >
              <span className={cn(
                'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                selected.includes(value) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600'
              )}>
                {selected.includes(value) && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
                    <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ entity, className }: FilterBarProps) {
  const { filters, setFilter, setFilters, resetFilters } = useFilterStore();
  const hasActiveFilters = Object.keys(filters).some(
    (k) => !['page', 'limit', 'sortDir'].includes(k) && filters[k as keyof typeof filters] !== undefined
  );

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search ?? ''}
          onChange={(e) => setFilter('search', e.target.value || undefined)}
          className="pl-8 pr-3 py-1.5 w-48 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => setFilter('search', undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Date Range */}
      <select
        value={filters.dateRange ?? ''}
        onChange={(e) => setFilter('dateRange', e.target.value || undefined)}
        className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
      >
        {DATE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value} className="bg-[#1f2937]">
            {label}
          </option>
        ))}
      </select>

      {/* Region */}
      <MultiSelect
        options={REGIONS.map((r) => ({ value: r, label: r }))}
        selected={filters.region ?? []}
        onChange={(val) => setFilter('region', val.length ? val : undefined)}
        placeholder="Region"
      />

      {/* Health (contacts/dashboard) */}
      {entity !== 'deals' && (
        <MultiSelect
          options={HEALTH_STATUSES.map((h) => ({ value: h, label: h === 'at_risk' ? 'At Risk' : h.charAt(0).toUpperCase() + h.slice(1) }))}
          selected={(filters.health as HealthStatus[]) ?? []}
          onChange={(val) => setFilter('health', val.length ? val : undefined)}
          placeholder="Health"
        />
      )}

      {/* Stage (deals) */}
      {entity === 'deals' && (
        <MultiSelect
          options={DEAL_STAGES.map((s) => ({ value: s, label: s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))}
          selected={(filters.stage as DealStage[]) ?? []}
          onChange={(val) => setFilter('stage', val.length ? val : undefined)}
          placeholder="Stage"
        />
      )}

      {/* Industry */}
      {entity !== 'deals' && (
        <MultiSelect
          options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
          selected={filters.industry ?? []}
          onChange={(val) => setFilter('industry', val.length ? val : undefined)}
          placeholder="Industry"
        />
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      )}
    </div>
  );
}
