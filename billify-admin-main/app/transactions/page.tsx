"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, CircleAlert, CreditCard, X } from "lucide-react";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import StatCard from "@/app/components/dashboard/StatCard";
import TransactionTable, {
  type TransactionRow as TableTransactionRow,
  type TransactionSortKey,
  type TransactionStatusFilter,
  type TransactionTypeFilter,
} from "@/app/components/dashboard/TransactionTable";
import { EmptyState } from "@/app/components/dashboard/StateViews";
import { formatINR } from "@/lib/currency";
import { getAdminBills, getAdminPayments, type BillRecord, type PaymentRecord } from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";

type DetailTransactionRow =
  | {
      rowType: "bill";
      key: string;
      createdAt: string;
      amount: number;
      customerName: string;
      customerEmail: string;
      summaryId: string;
      paymentMethod: string;
      statusLabel: string;
      statusTone: "success" | "warning";
      bill: BillRecord;
    }
  | {
      rowType: "payment";
      key: string;
      createdAt: string;
      amount: number;
      customerName: string;
      customerEmail: string;
      summaryId: string;
      paymentMethod: string;
      statusLabel: string;
      statusTone: "success" | "warning" | "danger";
      payment: PaymentRecord;
    };

export default function TransactionsPage() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>("all");
  const [dateRange, setDateRange] = useState(30);
  const [sortKey, setSortKey] = useState<TransactionSortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<DetailTransactionRow | null>(null);

  const loadTransactions = useCallback(async () => {
    setIsFetching(true);
    try {
      const [billsData, paymentsData] = await Promise.all([getAdminBills(), getAdminPayments()]);
      setBills(billsData);
      setPayments(paymentsData);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load transactions");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void loadTransactions();
  }, [ready, loadTransactions]);

  const transactions = useMemo<DetailTransactionRow[]>(() => {
    const billRows: Extract<DetailTransactionRow, { rowType: "bill" }>[] = bills.map((bill) => ({
      rowType: "bill" as const,
      key: `bill-${bill._id}`,
      createdAt: bill.createdAt,
      amount: bill.totalAmount,
      customerName: bill.userId?.name || "Unknown user",
      customerEmail: bill.userId?.email || "-",
      summaryId: `Bill #${bill._id.slice(-8).toUpperCase()}`,
      paymentMethod: bill.paymentStatus === "paid" ? "Settled on bill" : "Awaiting payment",
      statusLabel: bill.paymentStatus === "paid" ? "Paid" : "Pending",
      statusTone: bill.paymentStatus === "paid" ? "success" : "warning",
      bill,
    }));

    const paymentRows: Extract<DetailTransactionRow, { rowType: "payment" }>[] = payments.map((payment) => ({
      rowType: "payment" as const,
      key: `payment-${payment._id}`,
      createdAt: payment.createdAt,
      amount: payment.amount,
      customerName: payment.user?.name || "Unknown user",
      customerEmail: payment.user?.email || "-",
      summaryId: payment.orderId,
      paymentMethod: normalizePaymentMethod(payment.method),
      statusLabel: payment.status === "completed" ? "Completed" : payment.status === "failed" ? "Failed" : "Pending",
      statusTone: payment.status === "completed" ? "success" : payment.status === "failed" ? "danger" : "warning",
      payment,
    }));

    return [...billRows, ...paymentRows];
  }, [bills, payments]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const matchesType = typeFilter === "all" || transaction.rowType === typeFilter;
        const matchesStatus = statusFilter === "all" || transaction.statusLabel.toLowerCase() === statusFilter;
        const matchesDate = dateRange === 0 || isWithinDays(transaction.createdAt, dateRange);
        const matchesQuery =
          !query ||
          transaction.summaryId.toLowerCase().includes(query) ||
          transaction.customerName.toLowerCase().includes(query) ||
          transaction.customerEmail.toLowerCase().includes(query) ||
          (transaction.rowType === "payment" && (transaction.payment.paymentId || "").toLowerCase().includes(query));

        return matchesType && matchesStatus && matchesDate && matchesQuery;
      })
      .sort((left, right) => sortTransactions(left, right, sortKey, sortDirection));
  }, [transactions, searchQuery, typeFilter, statusFilter, dateRange, sortKey, sortDirection]);

  const tableRows = useMemo<TableTransactionRow[]>(() => {
    return filteredTransactions.map((transaction) => ({
      key: transaction.key,
      type: transaction.rowType,
      reference: transaction.summaryId,
      secondaryReference: transaction.rowType === "payment" ? transaction.payment.paymentId || "Awaiting payment id" : `Customer: ${transaction.customerName}`,
      userName: transaction.customerName,
      userEmail: transaction.customerEmail,
      amount: formatINR(transaction.amount),
      statusLabel: transaction.statusLabel,
      statusTone: transaction.statusTone,
      paymentMethod: transaction.paymentMethod,
      date: new Date(transaction.createdAt).toLocaleString("en-IN"),
    }));
  }, [filteredTransactions]);

  const stats = useMemo(() => ({
    totalRecords: transactions.length,
    completedRevenue: payments.filter((payment) => payment.status === "completed").reduce((total, payment) => total + payment.amount, 0),
    pendingAttention:
      bills.filter((bill) => bill.paymentStatus === "pending").length + payments.filter((payment) => payment.status !== "completed").length,
  }), [transactions, bills, payments]);

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              Unified ledger
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Bills and payments, together in one transaction workspace.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Search, filter, sort, and inspect every financial record flowing through the Billify backend without splitting context between separate screens.
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200/70 bg-white/85 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/70">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Visible rows</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{tableRows.length}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard label="Records in ledger" value={stats.totalRecords} formatter={(value) => Math.round(value).toString()} icon={ArrowLeftRight} tone="blue" helper="Bills plus payment rows returned by the admin API" />
        <StatCard label="Completed collections" value={stats.completedRevenue} formatter={formatINR} icon={CreditCard} tone="emerald" helper="Revenue from successful payment confirmations" />
        <StatCard label="Needs attention" value={stats.pendingAttention} formatter={(value) => Math.round(value).toString()} icon={CircleAlert} tone="rose" helper="Pending bills and non-completed payments" />
      </section>

      {transactions.length === 0 && !isFetching && !error ? (
        <EmptyState title="No transactions available" description="As soon as bills or payments are created through the app, the merged transaction ledger will appear here." />
      ) : (
        <TransactionTable
          rows={tableRows}
          loading={isFetching}
          error={error}
          onRetry={() => void loadTransactions()}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={(nextKey) => {
            if (nextKey === sortKey) {
              setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
              return;
            }

            setSortKey(nextKey);
            setSortDirection(nextKey === "user" || nextKey === "status" ? "asc" : "desc");
          }}
          onSelectRow={(row) => {
            const match = filteredTransactions.find((transaction) => transaction.key === row.key);
            if (match) {
              setSelectedTransaction(match);
            }
          }}
        />
      )}

      {selectedTransaction ? <TransactionDetailPanel transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} /> : null}
    </div>
  );
}

function TransactionDetailPanel({ transaction, onClose }: { transaction: DetailTransactionRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="surface-panel relative w-full max-w-4xl overflow-hidden rounded-[32px]">
        <div className="flex items-start justify-between border-b border-slate-200/70 bg-slate-50/80 px-6 py-5 dark:border-slate-800/70 dark:bg-slate-900/70">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Transaction details</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">{transaction.summaryId}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{new Date(transaction.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {transaction.rowType === "bill" ? <BillDetail bill={transaction.bill} /> : <PaymentDetail payment={transaction.payment} />}
      </div>
    </div>
  );
}

function BillDetail({ bill }: { bill: BillRecord }) {
  const sortedItems = [...bill.items].sort((left, right) => right.price * right.quantity - left.price * left.quantity);

  return (
    <div className="max-h-[72vh] space-y-6 overflow-y-auto p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DetailCard label="Customer" value={bill.userId?.name || "Unknown user"} />
        <DetailCard label="Email" value={bill.userId?.email || "-"} />
        <DetailCard label="Phone" value={bill.userId?.phone || "-"} />
      </div>

      <div className="flex flex-wrap gap-3">
        <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${bill.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
          Payment: {bill.paymentStatus === "paid" ? "Paid" : "Pending"}
        </span>
        {bill.status ? <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Workflow: {bill.status}</span> : null}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 dark:border-slate-800/80">
        <table className="min-w-full">
          <thead className="bg-slate-50/80 dark:bg-slate-900/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Item</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Unit price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <tr key={`${item.productId}-${index}`} className="border-t border-slate-200/70 dark:border-slate-800/70">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{item.name}</td>
                <td className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-400">{formatINR(item.price)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">{formatINR(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DetailCard label="Subtotal" value={formatINR(bill.subtotal ?? bill.totalAmount)} />
        <DetailCard label="Tax" value={formatINR(bill.tax || 0)} />
        <DetailCard label="Grand total" value={formatINR(bill.totalAmount)} />
      </div>

      {bill.exitPass ? <DetailCard label="Exit pass" value={bill.exitPass} mono /> : null}
    </div>
  );
}

function PaymentDetail({ payment }: { payment: PaymentRecord }) {
  return (
    <div className="max-h-[72vh] space-y-6 overflow-y-auto p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailCard label="Order ID" value={payment.orderId} mono />
        <DetailCard label="Payment ID" value={payment.paymentId || "Awaiting payment id"} mono />
        <DetailCard label="Status" value={payment.status} />
        <DetailCard label="Customer" value={payment.user?.name || "Unknown user"} />
        <DetailCard label="Email" value={payment.user?.email || "-"} />
        <DetailCard label="Method" value={normalizePaymentMethod(payment.method)} />
        <DetailCard label="Amount" value={formatINR(payment.amount)} />
        <DetailCard label="Created" value={new Date(payment.createdAt).toLocaleString("en-IN")} />
      </div>
    </div>
  );
}

function DetailCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function sortTransactions(
  left: DetailTransactionRow,
  right: DetailTransactionRow,
  sortKey: TransactionSortKey,
  sortDirection: "asc" | "desc",
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  if (sortKey === "amount") {
    return (left.amount - right.amount) * direction;
  }

  if (sortKey === "user") {
    return left.customerName.localeCompare(right.customerName) * direction;
  }

  if (sortKey === "status") {
    return left.statusLabel.localeCompare(right.statusLabel) * direction;
  }

  return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction;
}

function isWithinDays(input: string, days: number) {
  const value = new Date(input).getTime();
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return value >= threshold;
}

function normalizePaymentMethod(method?: string) {
  const value = (method || "").toLowerCase();
  if (value.includes("upi")) return "UPI";
  if (value.includes("card")) return "Card";
  if (value.includes("net")) return "Netbanking";
  if (value.includes("wallet")) return "Wallet";
  if (value.includes("razorpay")) return "Razorpay";
  return "Other";
}