"use client";

import { Fragment, useState } from "react";
import { Bill } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";

interface SalesTableProps {
  bills: Bill[];
}

export default function SalesTable({ bills }: SalesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (billId: string) => {
    setExpandedId((prevId) => (prevId === billId ? null : billId));
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <span className="sr-only">Expand</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Bill ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Items
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bills.map((bill) => (
              <Fragment key={bill.id}>
                <tr
                  onClick={() => toggleExpand(bill.id)}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
                      {expandedId === bill.id ? "−" : "+"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                    {bill.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bill.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {bill.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {bill.items.length} items
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {formatINR(bill.totalAmount)}
                  </td>
                </tr>

                {expandedId === bill.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 bg-gray-50">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Item Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {bill.items.map((item) => (
                            <div
                              key={`${bill.id}-${item.name}`}
                              className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900 text-sm">
                                  {item.name}
                                </p>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  x{item.quantity}
                                </span>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-gray-600">
                                  <span>Unit Price:</span>
                                  <span>{formatINR(item.price)}</span>
                                </div>
                                <div className="flex justify-between text-gray-900 font-medium border-t border-gray-200 pt-2">
                                  <span>Subtotal:</span>
                                  <span>
                                    {formatINR(item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white p-4 rounded-lg border-2 border-blue-200 flex justify-between items-center">
                          <span className="font-semibold text-gray-900">
                            Bill Total:
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatINR(bill.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
