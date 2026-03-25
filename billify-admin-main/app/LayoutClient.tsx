"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isWidePage = ["/support", "/transactions", "/products"].some((route) => pathname === route || pathname.startsWith(route + "/"));

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Navbar onMenuToggle={() => setSidebarOpen((current) => !current)} />
        <main className="px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <div className={isWidePage ? "mx-auto w-full max-w-[1600px]" : "mx-auto w-full max-w-7xl"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
