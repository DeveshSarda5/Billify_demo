"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import { getAdminUsers, type AdminUser } from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";

export default function UsersPage() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    getAdminUsers()
      .then(setUsers)
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : "Failed to load users"));
  }, [ready]);

  const filteredUsers = useMemo(() => {
    const term = query.toLowerCase();
    return users.filter((user) => {
      return (
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone || "").toLowerCase().includes(term)
      );
    });
  }, [users, query]);

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[32px] px-6 py-7 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Users</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">View customer and admin accounts from the shared user collection in a cleaner, theme-consistent workspace.</p>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="table-shell rounded-[30px]">
        <div className="border-b border-[var(--app-border)] p-6">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or phone"
            className="input-app h-12 rounded-2xl px-4 py-3"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--app-border)]">
            <thead className="table-head sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="table-row">
                  <td className="px-6 py-4 text-sm font-medium text-slate-950 dark:text-slate-50">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{user.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}