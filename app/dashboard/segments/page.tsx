'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { segmentsApi } from '@/lib/api';
import { useFilterStore } from '@/stores/filter-store';
import type { Segment } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Bookmark, BookmarkCheck, Trash2, Plus, Share2 } from 'lucide-react';
import { useState } from 'react';

function SegmentCard({
  segment,
  onApply,
  onDelete,
  active,
}: {
  segment: Segment;
  onApply: (s: Segment) => void;
  onDelete: (id: string) => void;
  active: boolean;
}) {
  const filterCount = Object.keys(segment.filters).length;
  return (
    <div className={`relative rounded-xl border p-5 transition-colors ${
      active ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-[#111827] hover:border-white/10'
    }`}>
      {active && (
        <div className="absolute top-3 right-3">
          <BookmarkCheck className="w-4 h-4 text-indigo-400" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Bookmark className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{segment.name}</h3>
            {segment.is_shared && (
              <Share2 className="w-3 h-3 text-gray-500 shrink-0" />
            )}
          </div>
          {segment.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{segment.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-500">{filterCount} filter{filterCount !== 1 ? 's' : ''}</span>
            <span className="text-xs text-gray-600">{formatDate(segment.created_at)}</span>
          </div>

          {/* Filter preview pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(segment.filters).slice(0, 4).map(([key, val]) => (
              <span key={key} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400">
                {key}: {Array.isArray(val) ? val.join(', ') : String(val)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onApply(segment)}
          className="flex-1 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors text-center"
        >
          {active ? 'Active — click to reapply' : 'Apply to dashboard'}
        </button>
        <button
          onClick={() => onDelete(segment.id)}
          className="p-2 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function SegmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { applySegment, activeSegmentId, filters } = useFilterStore();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: segmentsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: segmentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['segments'] }),
  });

  const createMutation = useMutation({
    mutationFn: segmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      setCreating(false);
      setNewName('');
      setNewDesc('');
    },
  });

  const handleApply = (segment: Segment) => {
    applySegment(segment.id, segment.filters);
    router.push('/dashboard/members');
  };

  const handleSaveCurrent = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName.trim(),
      description: newDesc.trim() || null,
      filters,
      is_shared: false,
      created_by: 'me',
    });
  };

  return (
    <div className="p-6 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Smart Segments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Save and reuse complex filter combinations</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Save Current Filters
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Save current filters as a segment</h3>
          <input
            autoFocus
            type="text"
            placeholder="Segment name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#111827] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#111827] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveCurrent}
              disabled={!newName.trim() || createMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Segment'}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-4 py-2 rounded-lg text-gray-400 text-sm hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onApply={handleApply}
              onDelete={(id) => deleteMutation.mutate(id)}
              active={activeSegmentId === segment.id}
            />
          ))}
          {data?.data.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <Bookmark className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No segments yet</p>
              <p className="text-gray-600 text-xs mt-1">Apply filters on the Members page, then save them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
