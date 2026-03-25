"use client";

import { useState, useMemo } from "react";
import SalesTable from "../components/SalesTable";
import { mockBills } from "@/lib/mockData";

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredBills = useMemo(() => {
    return mockBills.filter((bill) => {
      const matchesSearch =
        searchQuery === "" ||
        bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.customer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate =
        selectedDate === "" || bill.date.includes(selectedDate);

      return matchesSearch && matchesDate;
    });
  }, [searchQuery, selectedDate]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">Sales</h1>
            <p className="text-gray-600">View all store transactions</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Bill ID or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-500"
              />
              <svg
                className="absolute left-3 top-3 text-gray-500 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-gray-500 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white placeholder-gray-500"
            />
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-150 text-sm">
              ↓ Export
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery || selectedDate ? (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              Showing {filteredBills.length} of {mockBills.length} transactions
            </p>
          </div>
        ) : null}
      </div>

      {/* Sales Transactions Table */}
      {filteredBills.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <SalesTable bills={filteredBills} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No transactions found</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Try adjusting your search or date filter
          </p>
        </div>
      )}
    </div>
  );
}
