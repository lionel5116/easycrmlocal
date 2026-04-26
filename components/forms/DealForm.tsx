'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { dealsApi, companiesApi, contactsApi } from '@/lib/api';
import { cn, DEAL_STAGES, STAGE_CONFIG, REGIONS } from '@/lib/utils';
import type { Deal, DealInput, DealStage } from '@/lib/types';

const EMPTY: DealInput = {
  title: '',
  stage: 'prospecting',
  value: 0,
  close_date: null,
  probability: 10,
  region: null,
  owner: null,
  company_id: null,
  contact_id: null,
};

const STAGE_DEFAULTS: Record<DealStage, number> = {
  prospecting: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
};

function toInput(d: Deal): DealInput {
  return {
    title: d.title,
    stage: d.stage,
    value: d.value,
    close_date: d.close_date ?? null,
    probability: d.probability,
    region: d.region ?? null,
    owner: d.owner ?? null,
    company_id: d.company_id ?? null,
    contact_id: d.contact_id ?? null,
  };
}

interface DealFormProps {
  open: boolean;
  deal?: Deal;
  onClose: () => void;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a0f1e] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors';

export function DealForm({ open, deal, onClose }: DealFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!deal;
  const [form, setForm] = useState<DealInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(deal ? toInput(deal) : EMPTY);
      setError(null);
    }
  }, [open, deal]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.list,
    staleTime: 60_000,
  });

  const { data: contactsData } = useQuery({
    queryKey: ['contacts-all'],
    queryFn: () => contactsApi.list({ limit: 500 }),
    staleTime: 30_000,
  });

  const set = <K extends keyof DealInput>(field: K, value: DealInput[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleStageChange = (stage: DealStage) => {
    setForm((f) => ({
      ...f,
      stage,
      probability: STAGE_DEFAULTS[stage],
    }));
  };

  const mutation = useMutation({
    mutationFn: (data: DealInput) =>
      isEdit ? dealsApi.update(deal.id, data) : dealsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-summary'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError('Deal title is required.');
      return;
    }
    if (form.value < 0) {
      setError('Value must be 0 or greater.');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-30 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[440px] bg-[#111827] border-l border-white/5 z-40',
          'flex flex-col shadow-2xl transition-transform duration-300 ease-out'
        )}
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-sm font-semibold text-white">
            {isEdit ? 'Edit Deal' : 'New Deal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            <Field label="Deal Title" required>
              <input
                className={inputCls}
                placeholder="Acme Corp Enterprise Renewal"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>

            <Field label="Stage" required>
              <div className="grid grid-cols-3 gap-1.5">
                {DEAL_STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStageChange(s)}
                    className={cn(
                      'px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      form.stage === s
                        ? 'border-transparent text-white'
                        : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    )}
                    style={form.stage === s ? { background: `${STAGE_CONFIG[s].color}25`, borderColor: `${STAGE_CONFIG[s].color}50`, color: STAGE_CONFIG[s].color } : {}}
                  >
                    {STAGE_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Value ($)" required>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className={inputCls}
                  placeholder="50000"
                  value={form.value}
                  onChange={(e) => set('value', Number(e.target.value))}
                />
              </Field>

              <Field label="Probability (%)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputCls}
                  value={form.probability}
                  onChange={(e) => set('probability', Math.min(100, Math.max(0, Number(e.target.value))))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Close Date">
                <input
                  type="date"
                  className={inputCls}
                  value={form.close_date?.split('T')[0] ?? ''}
                  onChange={(e) => set('close_date', e.target.value || null)}
                />
              </Field>

              <Field label="Region">
                <select
                  className={inputCls}
                  value={form.region ?? ''}
                  onChange={(e) => set('region', e.target.value || null)}
                >
                  <option value="">— None —</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Owner">
              <input
                className={inputCls}
                placeholder="Sarah K."
                value={form.owner ?? ''}
                onChange={(e) => set('owner', e.target.value || null)}
              />
            </Field>

            <Field label="Company">
              <select
                className={inputCls}
                value={form.company_id ?? ''}
                onChange={(e) => set('company_id', e.target.value || null)}
              >
                <option value="">— None —</option>
                {companiesData?.data.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Primary Contact">
              <select
                className={inputCls}
                value={form.contact_id ?? ''}
                onChange={(e) => set('contact_id', e.target.value || null)}
              >
                <option value="">— None —</option>
                {contactsData?.data.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </Field>

            {error && (
              <p className="text-xs text-rose-400 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
                {error}
              </p>
            )}
          </div>

          {/* Sticky footer */}
          <div className="shrink-0 px-6 py-4 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
