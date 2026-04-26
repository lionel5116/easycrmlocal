'use client';
import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useFilterStore } from '@/stores/filter-store';
import { contactsApi, dealsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  entity: 'contacts' | 'deals';
}

export function ExportMenu({ entity }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const { filters } = useFilterStore();

  const getUrl = (format: 'csv' | 'excel') => {
    return entity === 'contacts'
      ? contactsApi.exportUrl(filters, format)
      : dealsApi.exportUrl(filters, format);
  };

  const download = (format: 'csv' | 'excel') => {
    window.open(getUrl(format), '_blank');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-gray-300 hover:text-white hover:border-white/20 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download Current View
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-white/10 bg-[#1f2937] shadow-xl py-1">
            <button
              onClick={() => download('csv')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileText className="w-4 h-4 text-gray-400" />
              Export as CSV
            </button>
            <button
              onClick={() => download('excel')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export as Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
