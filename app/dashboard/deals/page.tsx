'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { dealsApi } from '@/lib/api';
import { useFilterStore } from '@/stores/filter-store';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { StageBadge } from '@/components/ui/StageBadge';
import { ExportMenu } from '@/components/table/ExportMenu';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { DealForm } from '@/components/forms/DealForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate, STAGE_CONFIG } from '@/lib/utils';
import type { Deal } from '@/lib/types';

const BASE_COLUMNS: ColumnDef<Deal>[] = [
  {
    accessorKey: 'title',
    header: 'Deal',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-white">{row.original.title}</p>
        <p className="text-xs text-gray-500">{row.original.company_name ?? '—'}</p>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ getValue }) => <StageBadge stage={getValue() as Deal['stage']} />,
    size: 130,
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-white">{formatCurrency(getValue() as number)}</span>
    ),
    size: 100,
  },
  {
    accessorKey: 'probability',
    header: 'Prob.',
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${v}%` }} />
          </div>
          <span className="text-xs text-gray-400">{v}%</span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'close_date',
    header: 'Close Date',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-400">{formatDate(getValue() as string)}</span>
    ),
    size: 120,
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-400">{String(getValue() ?? '—')}</span>
    ),
    size: 130,
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-400">{String(getValue() ?? '—')}</span>
    ),
    size: 110,
  },
];

export default function DealsPage() {
  const { filters, setFilter, viewMode } = useFilterStore();
  const queryClient = useQueryClient();

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | undefined>();

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['deals', filters],
    queryFn: () => dealsApi.list(filters),
    placeholderData: (prev) => prev,
  });

  const { data: summary } = useQuery({
    queryKey: ['deals-summary', filters],
    queryFn: () => dealsApi.summary(filters),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-summary'] });
      setDeleteTarget(null);
    },
  });

  const openNew = () => {
    setEditDeal(undefined);
    setFormOpen(true);
  };

  const openEdit = (deal: Deal) => {
    setEditDeal(deal);
    setFormOpen(true);
  };

  const columns = useMemo<ColumnDef<Deal>[]>(() => [
    ...BASE_COLUMNS,
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 bg-[#0a0f1e]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white shrink-0">Pipeline</h1>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <FilterBar entity="deals" className="flex-1" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </button>
          <ViewToggle />
        </div>
      </div>

      {viewMode === 'chart' && summary?.data ? (
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-white/5 bg-[#111827] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Pipeline by Stage</h3>
            <PipelineChart data={summary.data} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.data.map((s) => (
              <div key={s.stage} className="rounded-xl border border-white/5 bg-[#111827] p-4">
                <div className="flex items-center justify-between mb-2">
                  <StageBadge stage={s.stage} />
                  <span className="text-xs text-gray-500">{s.count} deals</span>
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(s.total_value)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Weighted: {formatCurrency(s.weighted_value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Sub-header: stage quick-filters */}
          <div className="flex items-center gap-2 px-6 py-2 border-b border-white/5 overflow-x-auto shrink-0">
            {summary?.data.map((s) => (
              <button
                key={s.stage}
                onClick={() => setFilter('stage', [s.stage])}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors"
                style={{
                  background: `${STAGE_CONFIG[s.stage].color}15`,
                  color: STAGE_CONFIG[s.stage].color,
                }}
              >
                {STAGE_CONFIG[s.stage].label}
                <span className="opacity-60">{s.count}</span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
            <span className="text-sm text-gray-400">
              {isFetching && !isLoading ? (
                <span className="text-indigo-400 text-xs animate-pulse">Updating...</span>
              ) : (
                <>{data?.total ?? 0} deals</>
              )}
            </span>
            <ExportMenu entity="deals" />
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-[#111827]">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{ width: header.getSize() }}
                          className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/5 whitespace-nowrap"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-white/3 transition-colors group"
                      style={{ height: 60 }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 border-b border-white/3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center text-gray-500 text-sm">
                        No deals match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 text-xs text-gray-500 shrink-0">
            <span>Page {filters.page ?? 1} of {Math.ceil((data?.total ?? 0) / (filters.limit ?? 50))}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => setFilter('page', (filters.page ?? 1) - 1)}
                className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button
                disabled={(data?.total ?? 0) <= (filters.page ?? 1) * (filters.limit ?? 50)}
                onClick={() => setFilter('page', (filters.page ?? 1) + 1)}
                className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <DealForm
        open={formOpen}
        deal={editDeal}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete deal"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
