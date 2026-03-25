"use client";

import { useState } from "react";
import { Customer } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";
import { Search } from "lucide-react";

interface TopCustomersTableProps {
  customers: Customer[];
}

export default function TopCustomersTable({ customers }: TopCustomersTableProps) {
  const [dateRange, setDateRange] = useState("all");
  const [customerType, setCustomerType] = useState("all");
  const [minSpend, setMinSpend] = useState("");

  // Filter customers based on selected filters
  const filteredCustomers = customers.filter((customer) => {
    // Filter by date range
    if (dateRange !== "all") {
      const joinDate = new Date(customer.joinDate);
      const now = new Date();
      const daysAgo = dateRange === "30" ? 30 : dateRange === "90" ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      if (joinDate < cutoffDate) return false;
    }

    // Filter by customer type
    if (customerType !== "all") {
      if (customerType === "new" && customer.isReturning) return false;
      if (customerType === "returning" && !customer.isReturning) return false;
    }

    // Filter by minimum spend
    if (minSpend && customer.totalSpend < parseInt(minSpend)) return false;

    return true;
  });

  const getLoyaltyColor = (status: string) => {
    switch (status) {
      case "Gold":
        return "bg-yellow-100 text-yellow-800";
      case "Silver":
        return "bg-gray-200 text-gray-800";
      case "Bronze":
        return "bg-orange-100 text-orange-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
        <p className="text-sm text-gray-500 mt-1">Detailed customer purchase history and metrics</p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4">
        {/* Date Range Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-gray-500 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>

        {/* Customer Type Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 mb-1">Customer Type</label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className="text-gray-500 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="returning">Returning</option>
          </select>
        </div>

        {/* Minimum Spend Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 mb-1">Minimum Spend</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={minSpend}
            onChange={(e) => setMinSpend(e.target.value)}
            className="text-gray-500 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reset Filters Button */}
        {(dateRange !== "all" || customerType !== "all" || minSpend) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateRange("all");
                setCustomerType("all");
                setMinSpend("");
              }}
              className="px-3 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Spend
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Purchase
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Loyalty Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 font-medium">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                    {formatINR(customer.totalSpend)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(customer.lastPurchaseDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getLoyaltyColor(
                        customer.loyaltyStatus
                      )}`}
                    >
                      {customer.loyaltyStatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No customers match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results summary */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
}
