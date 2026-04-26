'use client';
import { useRef, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import { contactsApi } from '@/lib/api';
import { useFilterStore } from '@/stores/filter-store';
import type { Contact } from '@/lib/types';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ContactPanel } from '@/components/panels/ContactPanel';
import { ExportMenu } from '@/components/table/ExportMenu';
import { formatRelativeDate, cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';

const BASE_COLUMNS: ColumnDef<Contact>[] = [
  {
    id: 'name',
    accessorFn: (r) => `${r.first_name} ${r.last_name}`,
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-white">
          {row.original.first_name} {row.original.last_name}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[180px]">{row.original.email}</p>
      </div>
    ),
    size: 220,
  },
  {
    accessorKey: 'company_name',
    header: 'Company',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-300">{String(getValue() ?? '—')}</span>
    ),
    size: 160,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-400 truncate">{String(getValue() ?? '—')}</span>
    ),
    size: 160,
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-400">{String(getValue() ?? '—')}</span>
    ),
    size: 110,
  },
  {
    accessorKey: 'health',
    header: 'Health',
    cell: ({ getValue }) => <HealthBadge status={getValue() as Contact['health']} />,
    size: 100,
  },
  {
    accessorKey: 'last_activity_at',
    header: 'Last Activity',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-500">{formatRelativeDate(getValue() as string)}</span>
    ),
    size: 120,
  },
];

const ROW_HEIGHT = 60;

interface ContactsTableProps {
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export function ContactsTable({ onEdit, onDelete }: ContactsTableProps) {
  const { filters, setFilter } = useFilterStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<Contact>[]>(() => {
    if (!onEdit && !onDelete) return BASE_COLUMNS;
    return [
      ...BASE_COLUMNS,
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(row.original); }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(row.original); }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ),
      },
    ];
  }, [onEdit, onDelete]);

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => contactsApi.list(filters),
    placeholderData: (prev) => prev,
  });

  const handleSortChange = useCallback((updater: Updater<SortingState>) => {
    setSorting((prev) => {
      const col = typeof updater === 'function' ? updater(prev) : updater;
      if (col[0]) {
        setFilter('sortBy', col[0].id);
        setFilter('sortDir', col[0].desc ? 'desc' : 'asc');
      }
      return col;
    });
  }, [setFilter]);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: handleSortChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows.at(-1)?.end ?? 0) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
        <span className="text-sm text-gray-400">
          {isFetching && !isLoading ? (
            <span className="text-indigo-400 text-xs animate-pulse">Updating...</span>
          ) : (
            <>{data?.total ?? 0} contacts</>
          )}
        </span>
        <ExportMenu entity="contacts" />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-[#111827]">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/5 whitespace-nowrap cursor-pointer select-none hover:text-gray-300 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' && <ChevronUp className="w-3 h-3 text-indigo-400" />}
                          {sorted === 'desc' && <ChevronDown className="w-3 h-3 text-indigo-400" />}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {paddingTop > 0 && <tr><td style={{ height: paddingTop }} /></tr>}
              {virtualRows.map((vRow) => {
                const row = rows[vRow.index];
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.original.id)}
                    className={cn(
                      'cursor-pointer transition-colors group',
                      selectedId === row.original.id
                        ? 'bg-indigo-500/8'
                        : 'hover:bg-white/3'
                    )}
                    style={{ height: ROW_HEIGHT }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 border-b border-white/3 align-middle"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} /></tr>}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No contacts match the current filters.
            </div>
          )}
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

      {/* Detail panel */}
      <ContactPanel contactId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
