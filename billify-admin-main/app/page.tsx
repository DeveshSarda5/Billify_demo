"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeIndianRupee,
  CreditCard,
  Receipt,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import ChartCard from "@/app/components/dashboard/ChartCard";
import StatCard from "@/app/components/dashboard/StatCard";
import { DashboardSkeleton, EmptyState, ErrorState } from "@/app/components/dashboard/StateViews";
import { formatINR } from "@/lib/currency";
import {
  getAdminBills,
  getAdminPayments,
  getAdminUsers,
  getDashboardSummary,
  type AdminUser,
  type BillRecord,
  type DashboardSummary,
  type PaymentRecord,
} from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";
import { useAdminTheme } from "./components/admin/AdminThemeProvider";

type RevenueRange = "daily" | "weekly" | "monthly";

const revenueRangeOptions: Array<{ key: RevenueRange; label: string }> = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#a855f7", "#ef4444"];

export default function DashboardPage() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const { isDark } = useAdminTheme();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [revenueRange, setRevenueRange] = useState<RevenueRange>("daily");

  const loadDashboard = useCallback(async () => {
    setIsFetching(true);
    try {
      const [summaryData, billsData, paymentsData, usersData] = await Promise.all([
        getDashboardSummary(),
        getAdminBills(),
        getAdminPayments(),
        getAdminUsers(),
      ]);

      setSummary(summaryData);
      setBills(billsData);
      setPayments(paymentsData);
      setUsers(usersData);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void loadDashboard();
  }, [ready, loadDashboard]);

  const analytics = useMemo(() => buildDashboardAnalytics(summary, bills, payments, users, revenueRange), [summary, bills, payments, users, revenueRange]);
  const chartTheme = useMemo(() => getChartTheme(isDark), [isDark]);

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  if (isFetching) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState title="Dashboard data could not be loaded" description={error} onRetry={() => void loadDashboard()} />;
  }

  if (!summary) {
    return <EmptyState title="No dashboard data yet" description="Once bills, payments, and users arrive from the shared backend, your dashboard will populate here." />;
  }

  return (
    <div className="space-y-6">
      <section className="surface-card overflow-hidden rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              Revenue intelligence
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
              A production-grade view of revenue, transactions, and customer movement across Billify stores.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              All cards and charts below are powered by the live admin API. The dashboard now surfaces financial momentum,
              customer growth, payment mix, and operational signals in a single executive workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tracked products</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{summary.productsCount}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Inventory coverage across the shared retail catalog.</p>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Open support tickets</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{summary.openTicketsCount}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Operational queue that still needs attention from the admin team.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Revenue (30 days)"
          value={analytics.revenueNow}
          formatter={formatINR}
          icon={BadgeIndianRupee}
          tone="blue"
          trend={analytics.revenueTrend.change}
          trendLabel={analytics.revenueTrend.label}
          helper="Completed collections from the shared payment flow"
        />
        <StatCard
          label="Bills Created"
          value={analytics.billsNow}
          formatter={(value) => Math.round(value).toString()}
          icon={Receipt}
          tone="emerald"
          trend={analytics.billTrend.change}
          trendLabel={analytics.billTrend.label}
          helper="Shopping sessions converted into bill records"
        />
        <StatCard
          label="Completed Payments"
          value={analytics.completedPaymentsNow}
          formatter={(value) => Math.round(value).toString()}
          icon={CreditCard}
          tone="violet"
          trend={analytics.paymentTrend.change}
          trendLabel={analytics.paymentTrend.label}
          helper="Successful transaction completions in the last 30 days"
        />
        <StatCard
          label="Active Customers"
          value={analytics.uniqueCustomersNow}
          formatter={(value) => Math.round(value).toString()}
          icon={Users}
          tone="amber"
          trend={analytics.customerTrend.change}
          trendLabel={analytics.customerTrend.label}
          helper="Unique paying users active in the last 30 days"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.35fr_0.95fr]">
        <ChartCard
          title="Revenue Trend"
          subtitle="Smooth collection trend with time controls for daily, weekly, and monthly views."
          action={
            <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
              {revenueRangeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRevenueRange(option.key)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    revenueRange === option.key
                      ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
          footer={
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Wallet size={15} />
                Total {formatINR(analytics.revenueSeries.reduce((total, point) => total + point.value, 0))}
              </span>
              <span>{analytics.revenueTrend.label}</span>
            </div>
          }
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueSeries}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.42} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} tickLine={false} width={70} tickFormatter={(value) => formatCompact(value)} />
                <Tooltip
                  formatter={(value) => formatINR(Number(value ?? 0))}
                  contentStyle={chartTheme.tooltip}
                  cursor={{ stroke: chartTheme.cursor, strokeDasharray: "4 4" }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#revenueGradient)" animationDuration={700} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Payment Methods Breakdown"
          subtitle="Share of completed collections by payment rail."
          footer={
            <div className="grid grid-cols-2 gap-3">
              {analytics.paymentMethodSeries.map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{item.name}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{formatINR(item.value)}</p>
                </div>
              ))}
            </div>
          }
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.paymentMethodSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={4}
                  animationDuration={700}
                >
                  {analytics.paymentMethodSeries.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} contentStyle={chartTheme.tooltip} />
                <Legend wrapperStyle={{ color: chartTheme.tick }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Payments vs Bills" subtitle="Daily bill creation against completed payments for the last 10 days.">
          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.billVsPaymentSeries}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Legend wrapperStyle={{ color: chartTheme.tick }} />
                <Bar dataKey="bills" fill="#38bdf8" radius={[12, 12, 0, 0]} barSize={20} animationDuration={700} />
                <Line type="monotone" dataKey="payments" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={700} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Customer Growth" subtitle="Cumulative customer signups across the last 12 weeks.">
          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.customerGrowthSeries}>
                <defs>
                  <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="url(#customerGradient)" strokeWidth={3} animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ChartCard title="Top 5 Customers" subtitle="Highest spenders based on completed payment totals.">
          <div className="space-y-3">
            {analytics.topCustomers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No customer payment history is available yet.
              </div>
            ) : (
              analytics.topCustomers.map((customer, index) => (
                <div key={customer.key} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{customer.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{formatINR(customer.totalSpent)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{customer.orders} completed payments</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>

        <ChartCard title="Recent Transactions" subtitle="The latest financial activity entering the admin backend.">
          <div className="space-y-3">
            {analytics.recentTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No recent transactions are available yet.
              </div>
            ) : (
              analytics.recentTransactions.map((transaction) => (
                <div key={transaction.key} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-slate-100 dark:text-slate-950">
                        {transaction.type}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${transaction.tone === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : transaction.tone === "warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : transaction.tone === "danger" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-slate-900 dark:text-slate-50">{transaction.reference}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.customer} • {transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">{formatINR(transaction.amount)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.method}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MiniInsightCard label="Average order value" value={formatINR(analytics.averageOrderValue)} helper="Completed payments only" icon={Sparkles} />
        <MiniInsightCard label="Revenue per bill" value={formatINR(analytics.revenuePerBill)} helper="Total revenue divided by bills created" icon={Activity} />
        <MiniInsightCard label="Payment success rate" value={`${analytics.paymentSuccessRate.toFixed(1)}%`} helper="Completed payments vs total payment attempts" icon={Wallet} />
      </section>
    </div>
  );
}

function MiniInsightCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Sparkles;
}) {
  return (
    <div className="surface-card rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function buildDashboardAnalytics(
  summary: DashboardSummary | null,
  bills: BillRecord[],
  payments: PaymentRecord[],
  users: AdminUser[],
  revenueRange: RevenueRange,
) {
  const completedPayments = payments.filter((payment) => payment.status === "completed");

  const revenueNow = totalBetweenDays(completedPayments, 0, 30, (payment) => payment.amount);
  const revenuePrevious = totalBetweenDays(completedPayments, 30, 60, (payment) => payment.amount);
  const billsNow = totalBetweenDays(bills, 0, 30, () => 1);
  const billsPrevious = totalBetweenDays(bills, 30, 60, () => 1);
  const completedPaymentsNow = totalBetweenDays(completedPayments, 0, 30, () => 1);
  const completedPaymentsPrevious = totalBetweenDays(completedPayments, 30, 60, () => 1);

  const uniqueCustomersNow = uniqueCountBetweenDays(completedPayments, 0, 30, (payment) => payment.user?._id || payment.user?.email || payment.user?.name || payment._id);
  const uniqueCustomersPrevious = uniqueCountBetweenDays(completedPayments, 30, 60, (payment) => payment.user?._id || payment.user?.email || payment.user?.name || payment._id);

  const revenueSeries = buildRevenueSeries(completedPayments, revenueRange);
  const billVsPaymentSeries = buildDailyBillVsPaymentSeries(bills, completedPayments);
  const customerGrowthSeries = buildCustomerGrowthSeries(users);

  const paymentMethodTotals = completedPayments.reduce<Record<string, number>>((accumulator, payment) => {
    const method = normalizePaymentMethod(payment.method);
    accumulator[method] = (accumulator[method] || 0) + payment.amount;
    return accumulator;
  }, {});

  const paymentMethodSeries = Object.entries(paymentMethodTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);

  const topCustomerMap = completedPayments.reduce<Record<string, { key: string; name: string; email: string; totalSpent: number; orders: number }>>((accumulator, payment) => {
    const key = payment.user?._id || payment.user?.email || payment.user?.name || payment._id;
    if (!accumulator[key]) {
      accumulator[key] = {
        key,
        name: payment.user?.name || "Unknown customer",
        email: payment.user?.email || "No email",
        totalSpent: 0,
        orders: 0,
      };
    }

    accumulator[key].totalSpent += payment.amount;
    accumulator[key].orders += 1;
    return accumulator;
  }, {});

  const topCustomers = Object.values(topCustomerMap)
    .sort((left, right) => right.totalSpent - left.totalSpent)
    .slice(0, 5);

  const recentTransactions = [
    ...bills.map((bill) => ({
      key: `bill-${bill._id}`,
      type: "Bill",
      reference: `Bill #${bill._id.slice(-8).toUpperCase()}`,
      customer: bill.userId?.name || "Unknown customer",
      amount: bill.totalAmount,
      status: bill.paymentStatus === "paid" ? "Paid" : "Pending",
      tone: bill.paymentStatus === "paid" ? "success" : "warning",
      method: bill.paymentStatus === "paid" ? "Settled on bill" : "Awaiting payment",
      date: new Date(bill.createdAt).toLocaleString("en-IN"),
      createdAt: bill.createdAt,
    })),
    ...payments.map((payment) => ({
      key: `payment-${payment._id}`,
      type: "Payment",
      reference: payment.orderId,
      customer: payment.user?.name || "Unknown customer",
      amount: payment.amount,
      status: payment.status === "completed" ? "Completed" : payment.status === "failed" ? "Failed" : "Pending",
      tone: payment.status === "completed" ? "success" : payment.status === "failed" ? "danger" : "warning",
      method: normalizePaymentMethod(payment.method),
      date: new Date(payment.createdAt).toLocaleString("en-IN"),
      createdAt: payment.createdAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 6);

  return {
    summary,
    revenueNow,
    billsNow,
    completedPaymentsNow,
    uniqueCustomersNow,
    revenueTrend: calculateTrend(revenueNow, revenuePrevious, "vs previous 30 days"),
    billTrend: calculateTrend(billsNow, billsPrevious, "vs previous 30 days"),
    paymentTrend: calculateTrend(completedPaymentsNow, completedPaymentsPrevious, "vs previous 30 days"),
    customerTrend: calculateTrend(uniqueCustomersNow, uniqueCustomersPrevious, "vs previous 30 days"),
    revenueSeries,
    billVsPaymentSeries,
    customerGrowthSeries,
    paymentMethodSeries,
    topCustomers,
    recentTransactions,
    averageOrderValue: completedPayments.length
      ? completedPayments.reduce((total, payment) => total + payment.amount, 0) / completedPayments.length
      : 0,
    revenuePerBill: bills.length ? (summary?.revenue || 0) / bills.length : 0,
    paymentSuccessRate: payments.length ? (completedPayments.length / payments.length) * 100 : 0,
  };
}

function buildRevenueSeries(payments: PaymentRecord[], range: RevenueRange) {
  const periods = buildTimePeriods(range);
  return periods.map((period) => ({
    label: period.label,
    value: payments.reduce((total, payment) => {
      const createdAt = new Date(payment.createdAt).getTime();
      return createdAt >= period.start.getTime() && createdAt <= period.end.getTime() ? total + payment.amount : total;
    }, 0),
  }));
}

function buildDailyBillVsPaymentSeries(bills: BillRecord[], payments: PaymentRecord[]) {
  const periods = Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (9 - index));

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return {
      label: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      start: date,
      end,
    };
  });

  return periods.map((period) => ({
    label: period.label,
    bills: bills.filter((bill) => isInRange(bill.createdAt, period.start, period.end)).length,
    payments: payments.filter((payment) => isInRange(payment.createdAt, period.start, period.end)).length,
  }));
}

function buildCustomerGrowthSeries(users: AdminUser[]) {
  const createdUsers = users
    .filter((user) => user.createdAt)
    .sort((left, right) => new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime());

  return Array.from({ length: 12 }, (_, index) => {
    const start = startOfWeek(offsetDays(-(11 - index) * 7));
    const end = endOfWeek(start);
    return {
      label: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      total: createdUsers.filter((user) => user.createdAt && new Date(user.createdAt) <= end).length,
    };
  });
}

function buildTimePeriods(range: RevenueRange) {
  if (range === "daily") {
    return Array.from({ length: 14 }, (_, index) => {
      const start = offsetDays(-(13 - index));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      };
    });
  }

  if (range === "weekly") {
    return Array.from({ length: 8 }, (_, index) => {
      const start = startOfWeek(offsetDays(-(7 * (7 - index))));
      const end = endOfWeek(start);
      return {
        start,
        end,
        label: `W${index + 1}`,
      };
    });
  }

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const start = new Date(date);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      start,
      end,
      label: start.toLocaleDateString("en-IN", { month: "short" }),
    };
  });
}

function totalBetweenDays<T>(items: T[], startDaysAgo: number, endDaysAgo: number, valueGetter: (item: T) => number, dateGetter?: (item: T) => string | undefined) {
  return items.reduce((total, item) => {
    const dateValue = dateGetter ? dateGetter(item) : (item as { createdAt: string }).createdAt;
    if (!dateValue) {
      return total;
    }

    return isWithinLastDays(dateValue, startDaysAgo, endDaysAgo) ? total + valueGetter(item) : total;
  }, 0);
}

function uniqueCountBetweenDays<T>(items: T[], startDaysAgo: number, endDaysAgo: number, keyGetter: (item: T) => string, dateGetter?: (item: T) => string | undefined) {
  const keys = new Set<string>();

  items.forEach((item) => {
    const dateValue = dateGetter ? dateGetter(item) : (item as { createdAt: string }).createdAt;
    if (!dateValue || !isWithinLastDays(dateValue, startDaysAgo, endDaysAgo)) {
      return;
    }

    keys.add(keyGetter(item));
  });

  return keys.size;
}

function calculateTrend(current: number, previous: number, label: string) {
  if (previous === 0) {
    return {
      change: current > 0 ? 100 : 0,
      label: current > 0 ? `New growth window ${label}` : `No change ${label}`,
    };
  }

  return {
    change: ((current - previous) / previous) * 100,
    label,
  };
}

function offsetDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function startOfWeek(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = value.getDate() - day + (day === 0 ? -6 : 1);
  value.setDate(diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfWeek(date: Date) {
  const value = new Date(date);
  value.setDate(value.getDate() + 6);
  value.setHours(23, 59, 59, 999);
  return value;
}

function isWithinLastDays(input: string | Date, startDaysAgo: number, endDaysAgo: number) {
  const value = new Date(input);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - endDaysAgo);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  end.setDate(now.getDate() - startDaysAgo);
  return value >= start && value <= end;
}

function isInRange(input: string | Date, start: Date, end: Date) {
  const value = new Date(input).getTime();
  return value >= start.getTime() && value <= end.getTime();
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
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

function getChartTheme(isDark: boolean) {
  return {
    grid: isDark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.18)",
    tick: isDark ? "#94a3b8" : "#64748b",
    cursor: isDark ? "rgba(96,165,250,0.35)" : "rgba(37,99,235,0.25)",
    tooltip: {
      backgroundColor: isDark ? "rgba(15,23,42,0.94)" : "rgba(255,255,255,0.96)",
      border: isDark ? "1px solid rgba(51,65,85,0.9)" : "1px solid rgba(226,232,240,0.9)",
      borderRadius: "16px",
      boxShadow: isDark ? "0 24px 48px rgba(2,6,23,0.36)" : "0 18px 40px rgba(15,23,42,0.12)",
      color: isDark ? "#e2e8f0" : "#0f172a",
    } as const,
  };
}
