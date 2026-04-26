'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { ContactsTable } from '@/components/table/ContactsTable';
import { ContactForm } from '@/components/forms/ContactForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useFilterStore } from '@/stores/filter-store';
import { ContactsTimeline } from '@/components/charts/ContactsTimeline';
import { contactsApi } from '@/lib/api';
import type { Contact } from '@/lib/types';

export default function MembersPage() {
  const { viewMode } = useFilterStore();
  const queryClient = useQueryClient();

  // Form state: undefined = closed, null = new, Contact = edit
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | undefined>();

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeleteTarget(null);
    },
  });

  const openNew = () => {
    setEditContact(undefined);
    setFormOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditContact(contact);
    setFormOpen(true);
  };

  const openDelete = (contact: Contact) => {
    setDeleteTarget(contact);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 bg-[#0a0f1e]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white shrink-0">Members</h1>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <FilterBar entity="contacts" className="flex-1" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Contact
          </button>
          <ViewToggle />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'table' && (
          <ContactsTable onEdit={openEdit} onDelete={openDelete} />
        )}
        {viewMode === 'timeline' && <ContactsTimeline />}
        {viewMode === 'chart' && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Chart view — switch to Overview for charts, or use Table/Timeline here.
          </div>
        )}
      </div>

      <ContactForm
        open={formOpen}
        contact={editContact}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete contact"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.first_name} ${deleteTarget.last_name}? This action cannot be undone.`
            : ''
        }
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
