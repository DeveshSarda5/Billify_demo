"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./admin/ThemeToggle";
import { adminNavItems } from "./admin/navigation";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-slate-200/70 bg-white/75 px-5 pb-6 pt-5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/65 lg:flex">
        <Link href="/" className="px-2 py-3">
          <Logo />
        </Link>

        <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Workspace</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">Billify Control Center</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sales, transactions, offers, and support in one operating console.</p>
        </div>

        <nav className="mt-8 flex-1 space-y-1.5">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                }`}
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/16 text-white" : "bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-300"}`}>
                  <Icon size={18} />
                </span>
                <span className="flex-1">
                  <span className="block">{item.label}</span>
                  <span className={`block text-xs ${active ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/85">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Appearance</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between day and night dashboard themes.</p>
            </div>
            <ThemeToggle compact />
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-[60] flex w-72 flex-col border-r border-slate-200/70 bg-white px-5 pb-6 pt-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:hidden"
            >
              <Link href="/" className="px-2 py-3" onClick={onClose}>
                <Logo />
              </Link>
              <nav className="mt-6 flex-1 space-y-1.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">Dark mode</span>
                  <ThemeToggle compact />
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
