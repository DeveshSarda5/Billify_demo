"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { getPageMeta } from "./admin/navigation";
import ThemeToggle from "./admin/ThemeToggle";
import { clearAdminSession, getStoredAdminUser, type AdminUser } from "@/lib/adminApi";

export default function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const pageMeta = getPageMeta(pathname);

  useEffect(() => {
    setUser(getStoredAdminUser());
  }, []);

  const onLogout = () => {
    clearAdminSession();
    router.push("/");
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/65 lg:left-72">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
              {pageMeta.kicker}
            </p>
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-50">{pageMeta.title}</h1>
              <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 sm:inline-flex">
                Live data
              </span>
            </div>
            <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{pageMeta.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:inline-flex">
            <Bell size={18} />
          </button>

          <Link
            href="/admin"
            className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm transition hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900/90 md:flex"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-semibold text-white">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : <User size={16} />}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user?.name || "Admin"}</p>
              <p className="max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || "No active session"}</p>
            </div>
          </Link>

          <button
            onClick={onLogout}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-rose-500/30 dark:hover:text-rose-300"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
