export function AdminSessionLoading() {
  return (
    <div className="surface-premium rounded-[28px] p-10 text-center">
      <p className="text-base font-medium text-slate-950 dark:text-slate-50">Preparing admin workspace...</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Connecting to the shared Billify backend and restoring your session.</p>
    </div>
  );
}

export function AdminSessionError({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-red-200 bg-red-50/90 p-10 text-center shadow-sm dark:border-red-500/30 dark:bg-red-500/10">
      <p className="text-base font-semibold text-red-700">Admin session failed</p>
      <p className="mt-2 text-sm text-red-600 dark:text-red-300">{message}</p>
    </div>
  );
}