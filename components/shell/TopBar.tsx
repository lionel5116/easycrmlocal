'use client';
import { useFilterStore } from '@/stores/filter-store';
import { type UserRole } from '@/lib/types';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'executive', label: 'Executive' },
  { value: 'manager',   label: 'Manager'   },
  { value: 'associate', label: 'Associate' },
];

export function TopBar() {
  const { userRole, setUserRole } = useFilterStore();

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-white/5 bg-[#111827] shrink-0">
      <div className="text-sm text-gray-500">
        {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
      </div>

      <div className="flex items-center gap-3">
        {/* Role switcher — MVP demo toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
          {ROLE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setUserRole(value)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                userRole === value
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-400">
          AJ
        </div>
      </div>
    </header>
  );
}
