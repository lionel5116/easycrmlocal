'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Bookmark,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',        label: 'Overview',  icon: LayoutDashboard },
  { href: '/dashboard/members', label: 'Members',  icon: Users           },
  { href: '/dashboard/deals',  label: 'Pipeline',  icon: TrendingUp      },
  { href: '/dashboard/segments', label: 'Segments', icon: Bookmark       },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-16 lg:w-56 shrink-0 border-r border-white/5 bg-[#111827]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-white/5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="hidden lg:block text-sm font-semibold tracking-tight text-white">
          EasyCRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-white/5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="hidden lg:block">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
