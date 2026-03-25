import React from "react";
import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/20">
        <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-white/90 p-1 dark:bg-slate-950/85">
          <Image src="/logo.jpeg" alt="Billify logo" width={32} height={32} className="h-full w-full rounded-xl object-cover" priority />
        </div>
      </div>
      <div>
        <span className="block text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Billify</span>
        <span className="block text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Admin Cloud</span>
      </div>
    </div>
  );
}
