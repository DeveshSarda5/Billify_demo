"use client";

import { useEffect, useState } from "react";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import { getAdminSupportTickets, updateSupportTicket, type SupportTicketRecord } from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";

export default function SupportPage() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<SupportTicketRecord | null>(null);
  const [draftResponse, setDraftResponse] = useState("");
  const [draftStatus, setDraftStatus] = useState<SupportTicketRecord["status"]>("open");

  const loadTickets = async () => {
    try {
      setError(null);
      setTickets(await getAdminSupportTickets());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load support tickets");
    }
  };

  useEffect(() => {
    if (ready) {
      void loadTickets();
    }
  }, [ready]);

  const onUpdate = async (ticket: SupportTicketRecord, payload: { response?: string; status?: string }) => {
    try {
      setSavingId(ticket._id);
      await updateSupportTicket(ticket._id, payload);
      await loadTickets();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update ticket");
    } finally {
      setSavingId(null);
    }
  };

  const openEditor = (ticket: SupportTicketRecord) => {
    setEditingTicket(ticket);
    setDraftResponse(ticket.response || "");
    setDraftStatus(ticket.status);
  };

  const closeEditor = () => {
    if (savingId) {
      return;
    }

    setEditingTicket(null);
  };

  const handleSaveEditor = async () => {
    if (!editingTicket) {
      return;
    }

    await onUpdate(editingTicket, {
      response: draftResponse,
      status: draftStatus,
    });

    setEditingTicket(null);
  };

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  return (
    <>
      <div className="space-y-8">
        <section className="surface-card rounded-[32px] px-6 py-7 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Support</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Review support tickets from the mobile app and handle updates from a full editor instead of a cramped inline field.
          </p>
        </section>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <SupportCard key={ticket._id} ticket={ticket} saving={savingId === ticket._id} onEdit={() => openEditor(ticket)} />
          ))}
        </div>
      </div>

      <SupportEditorModal
        open={Boolean(editingTicket)}
        saving={Boolean(editingTicket) && savingId === editingTicket?._id}
        ticket={editingTicket}
        response={draftResponse}
        status={draftStatus}
        onClose={closeEditor}
        onSave={() => void handleSaveEditor()}
        onResponseChange={setDraftResponse}
        onStatusChange={setDraftStatus}
      />
    </>
  );
}

function getTicketStatusBadgeClass(status: SupportTicketRecord["status"]) {
  switch (status) {
    case "closed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "in-progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
  }
}

function SupportCard({
  ticket,
  saving,
  onEdit,
}: {
  ticket: SupportTicketRecord;
  saving: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="surface-premium interactive-card rounded-[30px] p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{ticket.title}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getTicketStatusBadgeClass(ticket.status)}`}>{ticket.status}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {ticket.category}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{ticket.description}</p>
          </div>

          <div className="grid gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-3">
            <div className="surface-muted rounded-2xl px-4 py-3">
              <div className="font-semibold uppercase tracking-[0.18em]">Requester</div>
              <div className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{ticket.user?.name || "Unknown user"}</div>
              <div className="mt-1">{ticket.user?.email || "-"}</div>
            </div>
            <div className="surface-muted rounded-2xl px-4 py-3">
              <div className="font-semibold uppercase tracking-[0.18em]">Created</div>
              <div className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(ticket.createdAt).toLocaleString("en-IN")}</div>
            </div>
            <div className="surface-muted rounded-2xl px-4 py-3">
              <div className="font-semibold uppercase tracking-[0.18em]">Response</div>
              <div className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                {ticket.response ? "Response added" : "Awaiting response"}
              </div>
              <div className="mt-1">{ticket.respondedAt ? new Date(ticket.respondedAt).toLocaleString("en-IN") : "Not responded yet"}</div>
            </div>
          </div>

          <div className="surface-muted rounded-[24px] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Latest response</div>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
              {ticket.response?.trim() || "No response has been added yet. Use the editor to reply and update the ticket status."}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[220px] xl:items-end">
          <button
            type="button"
            onClick={onEdit}
            disabled={saving}
            className="btn-primary-app rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60 xl:min-w-[180px]"
          >
            {saving ? "Saving..." : "Edit Ticket"}
          </button>
          <p className="text-right text-xs leading-5 text-slate-500 dark:text-slate-400 xl:max-w-[200px]">
            Open the modal editor to update the response in a full-size writing area.
          </p>
        </div>
      </div>
    </div>
  );
}

function SupportEditorModal({
  open,
  saving,
  ticket,
  response,
  status,
  onClose,
  onSave,
  onResponseChange,
  onStatusChange,
}: {
  open: boolean;
  saving: boolean;
  ticket: SupportTicketRecord | null;
  response: string;
  status: SupportTicketRecord["status"];
  onClose: () => void;
  onSave: () => void;
  onResponseChange: (value: string) => void;
  onStatusChange: (value: SupportTicketRecord["status"]) => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose, saving]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Close editor"
        className="absolute inset-0 bg-slate-950/55"
        onClick={onClose}
        disabled={saving}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`surface-panel relative z-10 w-full max-w-3xl rounded-[32px] border border-white/40 p-6 shadow-[0_32px_90px_rgba(15,23,42,0.35)] transition-all duration-200 sm:p-7 ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">Ticket Editor</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Update support ticket</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review the request details, write a complete reply, and save the updated ticket status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary-app rounded-2xl px-4 py-2 text-sm font-medium"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Title</label>
            <input
              readOnly
              value={ticket?.title || ""}
              className="input-app rounded-2xl px-4 py-3 text-sm opacity-80"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Description</label>
            <textarea
              readOnly
              value={ticket?.description || ""}
              className="textarea-app min-h-[120px] resize-none rounded-2xl px-4 py-3 text-sm opacity-80"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Status</label>
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value as SupportTicketRecord["status"])}
                className="select-app rounded-2xl px-4 py-3 text-sm"
              >
                <option value="open">open</option>
                <option value="in-progress">in-progress</option>
                <option value="closed">closed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Response</label>
              <textarea
                value={response}
                onChange={(event) => onResponseChange(event.target.value)}
                placeholder="Write a detailed reply for the customer"
                className="textarea-app min-h-[150px] resize-y rounded-2xl px-4 py-3 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary-app rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn-primary-app rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}