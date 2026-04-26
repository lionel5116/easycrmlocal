'use client';
import { LayoutList, BarChart2, Clock } from 'lucide-react';
import { useFilterStore } from '@/stores/filter-store';
import type { ViewMode } from '@/lib/types';
import { cn } from '@/lib/utils';

const MODES: { value: ViewMode; icon: typeof LayoutList; label: string }[] = [
  { value: 'table',    icon: LayoutList, label: 'Table'    },
  { value: 'chart',   icon: BarChart2,  label: 'Chart'    },
  { value: 'timeline',icon: Clock,      label: 'Timeline' },
];

export function ViewToggle() {
  const { viewMode, setViewMode } = useFilterStore();

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-white/5 p-1">
      {MODES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setViewMode(value)}
          title={label}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            viewMode === value
              ? 'bg-[#1f2937] text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:block">{label}</span>
        </button>
      ))}
    </div>
  );
}
