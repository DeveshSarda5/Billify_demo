"use client";

import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card animate-pulse rounded-[28px] p-6">
            <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-9 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-5 h-3 w-40 rounded-full bg-slate-100 dark:bg-slate-900" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card animate-pulse rounded-[28px] p-6">
            <div className="h-5 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-3 w-52 rounded-full bg-slate-100 dark:bg-slate-900" />
            <div className="mt-8 h-64 rounded-[24px] bg-slate-100 dark:bg-slate-900" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="surface-card overflow-hidden rounded-[28px] p-6">
      <div className="grid gap-4 border-b border-slate-200/70 pb-5 dark:border-slate-800/80 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="surface-card flex flex-col items-center rounded-[28px] px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        <AlertTriangle size={24} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="surface-card flex flex-col items-center rounded-[28px] px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
        <Inbox size={24} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}