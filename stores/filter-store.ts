'use client';
/**
 * Global filter store — single source of truth for all active filters.
 * All dashboard widgets subscribe here so filter changes propagate simultaneously.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { FilterParams, ViewMode, UserRole } from '@/lib/types';

interface FilterStore {
  filters: FilterParams;
  viewMode: ViewMode;
  userRole: UserRole;
  activeSegmentId: string | null;

  setFilter: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
  setFilters: (filters: Partial<FilterParams>) => void;
  applySegment: (segmentId: string, filters: FilterParams) => void;
  resetFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setUserRole: (role: UserRole) => void;
}

const DEFAULT_FILTERS: FilterParams = {
  page: 1,
  limit: 50,
  sortDir: 'desc',
};

export const useFilterStore = create<FilterStore>()(
  subscribeWithSelector((set) => ({
    filters: DEFAULT_FILTERS,
    viewMode: 'table',
    userRole: 'executive',
    activeSegmentId: null,

    setFilter: (key, value) =>
      set((state) => ({
        filters: { ...state.filters, [key]: value, page: 1 },
        activeSegmentId: null,
      })),

    setFilters: (incoming) =>
      set((state) => ({
        filters: { ...state.filters, ...incoming, page: 1 },
        activeSegmentId: null,
      })),

    applySegment: (segmentId, segmentFilters) =>
      set({
        filters: { ...DEFAULT_FILTERS, ...segmentFilters },
        activeSegmentId: segmentId,
      }),

    resetFilters: () =>
      set({ filters: DEFAULT_FILTERS, activeSegmentId: null }),

    setViewMode: (mode) => set({ viewMode: mode }),

    setUserRole: (role) => set({ userRole: role }),
  }))
);

// Derived selector — stable reference for query keys
export const selectFilterQueryKey = (state: FilterStore) =>
  JSON.stringify(state.filters);
