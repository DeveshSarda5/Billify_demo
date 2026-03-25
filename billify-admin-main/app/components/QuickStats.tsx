"use client";

import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { mockProducts, mockBills } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";

export default function QuickStats() {
  const totalProducts = mockProducts.length;
  const totalTransactions = mockBills.length;
  const totalRevenue = mockBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const lowStockProducts = mockProducts.filter((p) => p.stock < 10).length;

  const stats = [
    {
      label: "Active Products",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total Transactions",
      value: totalTransactions,
      icon: ShoppingCart,
      color: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Total Revenue",
      value: formatINR(totalRevenue),
      icon: DollarSign,
      color: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Low Stock Items",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-lg p-2`}>
                <Icon size={20} className={stat.textColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
