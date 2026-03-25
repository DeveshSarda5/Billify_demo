"use client";

import { motion } from "framer-motion";

export default function ChartCard({
  title,
  subtitle,
  action,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={{ y: -3 }}
      className="surface-card relative overflow-hidden rounded-[28px] p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-blue-500/10 via-cyan-400/8 to-transparent dark:from-blue-400/12 dark:via-cyan-400/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="relative mt-5">{children}</div>
      {footer ? <div className="relative mt-5 border-t border-slate-200/70 pt-4 dark:border-slate-800/80">{footer}</div> : null}
    </motion.section>
  );
}