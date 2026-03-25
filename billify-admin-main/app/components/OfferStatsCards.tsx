"use client";

import { Gift, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import { type OfferRecord } from "@/lib/adminApi";

interface OfferStatsCardsProps {
  offers: OfferRecord[];
}

export default function OfferStatsCards({ offers }: OfferStatsCardsProps) {
  const activeOffers = offers.filter((o) => o.status === "Active").length;
  const scheduledOffers = offers.filter((o) => o.status === "Scheduled").length;
  const expiredOffers = offers.filter((o) => o.status === "Expired").length;
  const totalDiscountUsage = offers.reduce((sum, o) => sum + (o.currentUsage || 0), 0);

  const stats = [
    {
      title: "Active Offers",
      value: activeOffers,
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-l-green-600",
    },
    {
      title: "Scheduled Offers",
      value: scheduledOffers,
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-l-blue-600",
    },
    {
      title: "Expired Offers",
      value: expiredOffers,
      icon: Gift,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-600",
      borderColor: "border-l-gray-600",
    },
    {
      title: "Total Discount Usage",
      value: totalDiscountUsage.toLocaleString("en-IN"),
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-l-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`surface-premium interactive-card rounded-[28px] border-l-4 ${stat.borderColor} p-6`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-950 dark:text-slate-50">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} rounded-2xl p-3 flex-shrink-0 dark:bg-white/5`}>
                <IconComponent size={24} className={stat.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
