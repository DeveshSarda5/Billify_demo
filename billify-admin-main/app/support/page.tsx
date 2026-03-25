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

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[32px] px-6 py-7 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Support</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Handle support tickets created from the mobile app with darker forms, stronger hierarchy, and consistent card treatment.</p>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <SupportCard key={ticket._id} ticket={ticket} saving={savingId === ticket._id} onSave={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function getTicketStatusBadgeClass(status: SupportTicketRecord["status"]) {
  switch (status) {
    case "closed":
      return "bg-red-100 text-red-700";
    case "in-progress":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function SupportCard({
  ticket,
  saving,
  onSave,
}: {
  ticket: SupportTicketRecord;
  saving: boolean;
  onSave: (ticket: SupportTicketRecord, payload: { response?: string; status?: string }) => Promise<void>;
}) {
  const [response, setResponse] = useState(ticket.response || "");
  const [status, setStatus] = useState(ticket.status);

  // Keep local state in sync when the ticket prop updates after a remote save
  useEffect(() => {
    setStatus(ticket.status);
    setResponse(ticket.response || "");
  }, [ticket.status, ticket.response]);

  return (
    <div className="surface-premium interactive-card rounded-[30px] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{ticket.title}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getTicketStatusBadgeClass(ticket.status)}`}>{ticket.status}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{ticket.category}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ticket.description}</p>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {ticket.user?.name || "Unknown user"} • {ticket.user?.email || "-"} • {new Date(ticket.createdAt).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] lg:min-w-[520px]">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as SupportTicketRecord["status"])}
            className="select-app rounded-2xl px-4 py-3 text-sm"
          >
            <option value="open">open</option>
            <option value="in-progress">in-progress</option>
            <option value="closed">closed</option>
          </select>
          <textarea
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            rows={3}
            placeholder="Write a response for the customer"
            className="textarea-app min-h-[96px] rounded-2xl px-4 py-3 text-sm"
          />
          <button
            onClick={() => void onSave(ticket, { response, status })}
            disabled={saving}
            className="btn-primary-app rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}