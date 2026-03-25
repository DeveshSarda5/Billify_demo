"use client";

import { animate, motion } from "framer-motion";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Tone = "blue" | "emerald" | "violet" | "amber" | "rose";

const toneClassMap: Record<Tone, { chip: string; icon: string }> = {
  blue: {
    chip: "from-blue-600 to-cyan-500",
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300",
  },
  emerald: {
    chip: "from-emerald-600 to-teal-500",
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300",
  },
  violet: {
    chip: "from-violet-600 to-fuchsia-500",
    icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
  },
  amber: {
    chip: "from-amber-500 to-orange-500",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
  },
  rose: {
    chip: "from-rose-600 to-pink-500",
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/12 dark:text-rose-300",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  formatter,
  trend,
  trendLabel,
  helper,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  formatter: (value: number) => string;
  trend?: number;
  trendLabel?: string;
  helper?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const controls = animate(previousValueRef.current, value, {
      duration: 0.85,
      onUpdate: (latest) => {
        setDisplayValue(latest);
        previousValueRef.current = latest;
      },
    });

    return () => controls.stop();
  }, [value]);

  const trendPositive = (trend ?? 0) >= 0;
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="surface-card relative overflow-hidden rounded-[28px] p-6"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneClassMap[tone].chip}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{formatter(displayValue)}</p>
          {helper ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p> : null}
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${toneClassMap[tone].icon}`}>
          <Icon size={22} />
        </span>
      </div>

      {typeof trend === "number" ? (
        <div className="mt-5 flex items-center gap-2 text-sm">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${trendPositive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}>
            <TrendIcon size={14} />
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-slate-500 dark:text-slate-400">{trendLabel}</span>
        </div>
      ) : null}
    </motion.article>
  );
}