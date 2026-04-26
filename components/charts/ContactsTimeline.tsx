'use client';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/lib/api';
import { useFilterStore } from '@/stores/filter-store';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { formatRelativeDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

export function ContactsTimeline() {
  const { filters } = useFilterStore();

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { ...filters, sortBy: 'last_activity_at', limit: 100 }],
    queryFn: () => contactsApi.list({ ...filters, sortBy: 'last_activity_at', sortDir: 'desc', limit: 100 }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <TableSkeleton />;

  // Group by relative time bucket
  const buckets = new Map<string, NonNullable<typeof data>['data']>();
  for (const contact of data?.data ?? []) {
    const diff = contact.last_activity_at
      ? Math.floor((Date.now() - new Date(contact.last_activity_at).getTime()) / 86_400_000)
      : 9999;
    const bucket =
      diff === 0 ? 'Today' :
      diff <= 7 ? 'This week' :
      diff <= 30 ? 'This month' :
      'Older';
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(contact);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl space-y-8">
        {Array.from(buckets.entries()).map(([label, contacts]) => (
          <div key={label}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-gray-600">{contacts.length}</span>
            </div>
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#111827] border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{c.company_name ?? c.title ?? c.email}</p>
                  </div>
                  <HealthBadge status={c.health} />
                  <span className="text-xs text-gray-600 shrink-0">
                    {formatRelativeDate(c.last_activity_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(data?.data.length ?? 0) === 0 && (
          <p className="text-gray-500 text-sm">No contacts match the current filters.</p>
        )}
      </div>
    </div>
  );
}
