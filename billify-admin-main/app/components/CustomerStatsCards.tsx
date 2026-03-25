"use client";

import { Users, UserPlus, UserCheck, TrendingUp } from "lucide-react";
import { mockCustomers } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";

export default function CustomerStatsCards() {
  const totalCustomers = mockCustomers.length;
  const newCustomersThisMonth = mockCustomers.filter((c) => {
    const joinDate = new Date(c.joinDate);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  const repeatCustomers = mockCustomers.filter((c) => c.isReturning).length;
  const avgCustomerSpend = Math.round(
    mockCustomers.reduce((sum, c) => sum + c.totalSpend, 0) / mockCustomers.length
  );

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-l-blue-600",
    },
    {
      title: "New Customers This Month",
      value: newCustomersThisMonth,
      icon: UserPlus,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-l-green-600",
    },
    {
      title: "Repeat Customers",
      value: repeatCustomers,
      icon: UserCheck,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-l-purple-600",
    },
    {
      title: "Average Customer Spend",
      value: formatINR(avgCustomerSpend),
      icon: TrendingUp,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-l-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-xl border border-gray-200 border-l-4 ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200 p-6`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} rounded-lg p-3 flex-shrink-0`}>
                <IconComponent size={24} className={stat.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
