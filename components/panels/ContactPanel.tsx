'use client';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/lib/api';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { StageBadge } from '@/components/ui/StageBadge';
import { formatRelativeDate, formatCurrency, cn } from '@/lib/utils';
import type { Activity, Deal } from '@/lib/types';
import {
  X, Phone, Mail, Building2, MapPin, Calendar,
  PhoneCall, AtSign, Users, FileText, CheckSquare,
} from 'lucide-react';
import { useEffect } from 'react';

const ACTIVITY_ICONS = {
  call: PhoneCall,
  email: AtSign,
  meeting: Users,
  note: FileText,
  task: CheckSquare,
};

interface ContactPanelProps {
  contactId: string | null;
  onClose: () => void;
}

export function ContactPanel({ contactId, onClose }: ContactPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => contactsApi.get(contactId!),
    enabled: !!contactId,
  });

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-30 transition-opacity duration-200',
          contactId ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[420px] bg-[#111827] border-l border-white/5 z-40',
          'flex flex-col shadow-2xl transition-transform duration-300 ease-out',
          contactId ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-sm font-semibold text-white">Contact Detail</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !data ? (
          <div className="flex-1 p-6 space-y-4 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="h-4 w-32 rounded bg-white/10" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Identity */}
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
                  {data.first_name[0]}{data.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">
                    {data.first_name} {data.last_name}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{data.title ?? '—'}</p>
                  <div className="mt-2">
                    <HealthBadge status={data.health} />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { icon: Mail, value: data.email },
                  { icon: Phone, value: data.phone },
                  { icon: Building2, value: (data as any).company_name },
                  { icon: MapPin, value: data.region },
                  { icon: Calendar, value: formatRelativeDate(data.last_activity_at) },
                ].map(({ icon: Icon, value }) => value ? (
                  <div key={String(value)} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <Icon className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span className="truncate">{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Open Deals */}
            {(data as any).deals?.length > 0 && (
              <div className="px-6 py-4 border-b border-white/5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Open Deals
                </h4>
                <div className="space-y-2">
                  {((data as any).deals as Deal[]).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/3">
                      <div>
                        <p className="text-sm font-medium text-white">{deal.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(deal.value)}</p>
                      </div>
                      <StageBadge stage={deal.stage} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="px-6 py-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Recent Activity
              </h4>
              <div className="relative space-y-4">
                {((data as any).recent_activities as Activity[]).map((act, i) => {
                  const Icon = ACTIVITY_ICONS[act.type] ?? FileText;
                  return (
                    <div key={act.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        {i < (data as any).recent_activities.length - 1 && (
                          <div className="w-px flex-1 bg-white/5 mt-1.5 mb-0" />
                        )}
                      </div>
                      <div className="pb-4 min-w-0">
                        <p className="text-sm text-white font-medium">{act.subject}</p>
                        {act.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.body}</p>}
                        <p className="text-xs text-gray-600 mt-1">{formatRelativeDate(act.occurred_at)}</p>
                      </div>
                    </div>
                  );
                })}
                {(data as any).recent_activities?.length === 0 && (
                  <p className="text-sm text-gray-500">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
