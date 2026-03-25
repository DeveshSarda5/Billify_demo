"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, CalendarRange, Search } from "lucide-react";
import { TableSkeleton, ErrorState } from "./StateViews";

export type TransactionRow = {
  key: string;
  type: "bill" | "payment";
  reference: string;
  secondaryReference?: string;
  userName: string;
  userEmail: string;
  amount: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "info";
  paymentMethod: string;
  date: string;
};

export type TransactionTypeFilter = "all" | "bill" | "payment";
export type TransactionStatusFilter = "all" | "paid" | "pending" | "completed" | "failed";
export type TransactionSortKey = "date" | "amount" | "user" | "status";
export type TransactionSortDirection = "asc" | "desc";

const statusToneClassMap = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
} as const;

export default function TransactionTable({
  rows,
  loading,
  error,
  onRetry,
  searchQuery,
  onSearchQueryChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  sortKey,
  sortDirection,
  onSortChange,
  onSelectRow,
}: {
  rows: TransactionRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  typeFilter: TransactionTypeFilter;
  onTypeFilterChange: (value: TransactionTypeFilter) => void;
  statusFilter: TransactionStatusFilter;
  onStatusFilterChange: (value: TransactionStatusFilter) => void;
  dateRange: number;
  onDateRangeChange: (value: number) => void;
  sortKey: TransactionSortKey;
  sortDirection: TransactionSortDirection;
  onSortChange: (key: TransactionSortKey) => void;
  onSelectRow: (row: TransactionRow) => void;
}) {
  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <ErrorState title="Transactions could not be loaded" description={error} onRetry={onRetry} />;
  }

  return (
    <div className="surface-card overflow-hidden rounded-[28px]">
      <div className="grid gap-4 border-b border-slate-200/70 p-6 dark:border-slate-800/80 lg:grid-cols-[1.3fr_repeat(4,minmax(0,0.65fr))]">
        <label className="relative flex items-center">
          <Search size={18} className="pointer-events-none absolute left-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search by user, bill id, order id, or payment id"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          />
        </label>

        <select
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value as TransactionTypeFilter)}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          <option value="all">All types</option>
          <option value="bill">Bills</option>
          <option value="payment">Payments</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as TransactionStatusFilter)}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <label className="relative flex items-center">
          <CalendarRange size={18} className="pointer-events-none absolute left-4 text-slate-400 dark:text-slate-500" />
          <select
            value={dateRange}
            onChange={(event) => onDateRangeChange(Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value={0}>All time</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>

        <select
          value={`${sortKey}:${sortDirection}`}
          onChange={(event) => {
            const [nextKey] = event.target.value.split(":") as [TransactionSortKey, TransactionSortDirection];
            onSortChange(nextKey);
          }}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          <option value="date:desc">Newest first</option>
          <option value="amount:desc">Highest amount</option>
          <option value="user:asc">User A-Z</option>
          <option value="status:asc">Status A-Z</option>
        </select>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/80">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Unified transaction ledger</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{rows.length} matching records across bills and payments.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/80 dark:border-slate-800/80 dark:bg-slate-900/60">
              <HeaderCell title="User" active={sortKey === "user"} direction={sortDirection} onClick={() => onSortChange("user")} />
              <HeaderCell title="Reference" />
              <HeaderCell title="Amount" align="right" active={sortKey === "amount"} direction={sortDirection} onClick={() => onSortChange("amount")} />
              <HeaderCell title="Status" active={sortKey === "status"} direction={sortDirection} onClick={() => onSortChange("status")} />
              <HeaderCell title="Payment method" />
              <HeaderCell title="Date" active={sortKey === "date"} direction={sortDirection} onClick={() => onSortChange("date")} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">No transactions match these filters</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Change the search term, status, or date range to widen the result set.</p>
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr
                key={row.key}
                onClick={() => onSelectRow(row)}
                className="cursor-pointer border-b border-slate-200/70 transition hover:bg-blue-50/60 dark:border-slate-800/70 dark:hover:bg-slate-900/80"
              >
                <td className="px-6 py-4 align-top">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{row.userName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{row.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-blue-700 dark:text-blue-300">{row.reference}</p>
                  {row.secondaryReference ? <p className="text-sm text-slate-500 dark:text-slate-400">{row.secondaryReference}</p> : null}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{row.type}</p>
                </td>
                <td className="px-6 py-4 text-right align-top text-sm font-semibold text-slate-900 dark:text-slate-50">{row.amount}</td>
                <td className="px-6 py-4 align-top">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusToneClassMap[row.statusTone]}`}>
                    {row.statusLabel}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-sm text-slate-600 dark:text-slate-300">{row.paymentMethod}</td>
                <td className="px-6 py-4 align-top text-sm text-slate-500 dark:text-slate-400">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeaderCell({
  title,
  align = "left",
  active,
  direction,
  onClick,
}: {
  title: string;
  align?: "left" | "right";
  active?: boolean;
  direction?: TransactionSortDirection;
  onClick?: () => void;
}) {
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className={`px-6 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}
        >
          {title}
          <Icon size={13} />
        </button>
      ) : (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</span>
      )}
    </th>
  );
}