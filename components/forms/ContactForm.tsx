'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { contactsApi, companiesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Contact, ContactInput, ContactRole, HealthStatus } from '@/lib/types';

const ROLES: { value: ContactRole; label: string }[] = [
  { value: 'executive', label: 'Executive' },
  { value: 'manager', label: 'Manager' },
  { value: 'associate', label: 'Associate' },
  { value: 'stakeholder', label: 'Stakeholder' },
];

const HEALTH: { value: HealthStatus; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'critical', label: 'Critical' },
];

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest', 'Pacific'];

const EMPTY: ContactInput = {
  first_name: '',
  last_name: '',
  email: '',
  phone: null,
  title: null,
  role: 'associate',
  region: null,
  health: 'healthy',
  company_id: null,
};

function toInput(c: Contact): ContactInput {
  return {
    first_name: c.first_name,
    last_name: c.last_name,
    email: c.email,
    phone: c.phone ?? null,
    title: c.title ?? null,
    role: c.role,
    region: c.region ?? null,
    health: c.health,
    company_id: c.company_id ?? null,
  };
}

interface ContactFormProps {
  open: boolean;
  contact?: Contact;
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

export function ContactForm({ open, contact, onClose }: ContactFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!contact;
  const [form, setForm] = useState<ContactInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever the panel opens
  useEffect(() => {
    if (open) {
      setForm(contact ? toInput(contact) : EMPTY);
      setError(null);
    }
  }, [open, contact]);

  // Close on Escape
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

  const set = (field: keyof ContactInput, value: string | null) =>
    setForm((f) => ({ ...f, [field]: value || null }));

  const mutation = useMutation({
    mutationFn: (data: ContactInput) =>
      isEdit ? contactsApi.update(contact.id, data) : contactsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required.');
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
            {isEdit ? 'Edit Contact' : 'New Contact'}
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" required>
                <input
                  className={inputCls}
                  placeholder="Jane"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  className={inputCls}
                  placeholder="Smith"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                />
              </Field>
            </div>

            <Field label="Email" required>
              <input
                type="email"
                className={inputCls}
                placeholder="jane@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                className={inputCls}
                placeholder="+1 555 000 0000"
                value={form.phone ?? ''}
                onChange={(e) => set('phone', e.target.value)}
              />
            </Field>

            <Field label="Job Title">
              <input
                className={inputCls}
                placeholder="VP of Engineering"
                value={form.title ?? ''}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Role" required>
                <select
                  className={inputCls}
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ContactRole }))}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Health" required>
                <select
                  className={inputCls}
                  value={form.health}
                  onChange={(e) => setForm((f) => ({ ...f, health: e.target.value as HealthStatus }))}
                >
                  {HEALTH.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Region">
              <select
                className={inputCls}
                value={form.region ?? ''}
                onChange={(e) => set('region', e.target.value)}
              >
                <option value="">— None —</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field label="Company">
              <select
                className={inputCls}
                value={form.company_id ?? ''}
                onChange={(e) => set('company_id', e.target.value)}
              >
                <option value="">— None —</option>
                {companiesData?.data.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
