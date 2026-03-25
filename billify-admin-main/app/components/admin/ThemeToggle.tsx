"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mounted, isDark, toggleTheme } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 ${compact ? "h-10 px-3" : "h-11 px-4"}`}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${mounted && isDark ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`}>
        <span className={`absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${mounted && isDark ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
      {mounted && isDark ? (
        <MoonStar size={16} className="text-slate-100" />
      ) : (
        <SunMedium size={16} className="text-amber-500" />
      )}
      {!compact ? <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-100 sm:inline">{mounted && isDark ? "Dark" : "Light"}</span> : null}
    </button>
  );
}