'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { dashboardApi, dealsApi } from '@/lib/api';
import { useFilterStore } from '@/stores/filter-store';
import { FilterBar } from '@/components/filters/FilterBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { ActivityTrendChart } from '@/components/charts/ActivityTrendChart';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { HealthRingChart } from '@/components/charts/HealthRingChart';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function OverviewPage() {
  const router = useRouter();
  const { filters, setFilters, userRole } = useFilterStore();

  const { data: dash, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => dashboardApi.get(filters),
    placeholderData: (prev) => prev,
  });

  const { data: pipeline } = useQuery({
    queryKey: ['deals-summary', filters],
    queryFn: () => dealsApi.summary(filters),
    placeholderData: (prev) => prev,
  });

  const drillToContacts = (health?: string) => {
    setFilters({ health: health ? [health as never] : undefined });
    router.push('/dashboard/members');
  };

  const drillToDeals = (stage?: string) => {
    setFilters({ stage: stage ? [stage as never] : undefined });
    router.push('/dashboard/deals');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {userRole === 'executive' && 'Executive Overview'}
            {userRole === 'manager' && 'Operations Dashboard'}
            {userRole === 'associate' && 'My Workspace'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {userRole === 'executive' && 'Trends, risks, and pipeline health at a glance'}
            {userRole === 'manager' && 'Team performance and bottlenecks'}
            {userRole === 'associate' && 'Prioritized next steps and recent activity'}
          </p>
        </div>
      </div>

      {/* Global filters */}
      <div className="sticky top-0 z-20 -mx-6 px-6 py-3 bg-[#0a0f1e]/90 backdrop-blur border-b border-white/5">
        <FilterBar entity="dashboard" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Contacts"
          value={dash?.contacts.total ?? '—'}
          icon={Users}
          loading={dashLoading}
          onClick={() => drillToContacts()}
          sub="Click to explore"
        />
        <KpiCard
          label="At Risk"
          value={dash?.contacts.at_risk ?? '—'}
          icon={Activity}
          loading={dashLoading}
          onClick={() => drillToContacts('at_risk')}
          sub="Click to filter"
          className={dash?.contacts.at_risk ? '[&]:border-amber-500/20' : ''}
        />
        <KpiCard
          label="Pipeline Value"
          value={dash ? formatCurrency(dash.deals.total_pipeline) : '—'}
          icon={DollarSign}
          loading={dashLoading}
          onClick={() => drillToDeals()}
          sub={dash ? `${dash.deals.total_deals} deals` : undefined}
        />
        <KpiCard
          label="Weighted Pipeline"
          value={dash ? formatCurrency(dash.deals.weighted_pipeline) : '—'}
          icon={TrendingUp}
          loading={dashLoading}
          sub="Probability-adjusted"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity trend */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#111827] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Activity (30 days)</h3>
          </div>
          {dashLoading ? (
            <Skeleton className="h-[180px] w-full" />
          ) : dash?.activity_trend.length ? (
            <ActivityTrendChart trend={dash.activity_trend} />
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-500 text-sm">
              No activity data
            </div>
          )}
        </div>

        {/* Health ring */}
        <div className="rounded-xl border border-white/5 bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Contact Health</h3>
          {dashLoading ? (
            <Skeleton className="h-[120px] w-full" />
          ) : dash?.health_breakdown.length ? (
            <HealthRingChart data={dash.health_breakdown} />
          ) : (
            <div className="h-[120px] flex items-center justify-center text-gray-500 text-sm">
              No data
            </div>
          )}
          {/* Drill-down links */}
          {dash && (
            <div className="mt-4 space-y-1 border-t border-white/5 pt-4">
              {dash.health_breakdown.map(({ health, count }) => (
                <button
                  key={health}
                  onClick={() => drillToContacts(health)}
                  className="w-full text-left text-xs text-gray-500 hover:text-white py-1 transition-colors flex items-center justify-between"
                >
                  <span className="capitalize">{health.replace('_', ' ')} ({count})</span>
                  <span className="text-indigo-400">View →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline by stage */}
      <div className="rounded-xl border border-white/5 bg-[#111827] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Pipeline by Stage</h3>
          <button
            onClick={() => drillToDeals()}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all deals →
          </button>
        </div>
        {pipeline?.data.length ? (
          <PipelineChart data={pipeline.data} />
        ) : (
          <Skeleton className="h-[200px] w-full" />
        )}

        {/* Stage summary table */}
        {pipeline?.data && (
          <div className="mt-4 grid grid-cols-3 lg:grid-cols-6 gap-2">
            {pipeline.data.map((s) => (
              <button
                key={s.stage}
                onClick={() => drillToDeals(s.stage)}
                className="text-center p-3 rounded-lg bg-white/3 hover:bg-white/6 transition-colors group"
              >
                <p className="text-xs text-gray-500 capitalize mb-1">
                  {s.stage.replace('_', ' ')}
                </p>
                <p className="text-sm font-semibold text-white">{s.count}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(s.total_value)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Region breakdown */}
      {dash?.region_breakdown.length ? (
        <div className="rounded-xl border border-white/5 bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline by Region</h3>
          <div className="space-y-2">
            {dash.region_breakdown.map((r) => {
              const max = Math.max(...dash.region_breakdown.map((x) => Number(x.total_value)));
              const pct = (Number(r.total_value) / max) * 100;
              return (
                <div key={r.region} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0">{r.region}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                    {formatCurrency(r.total_value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
