"use client";

import { type OfferRecord } from "@/lib/adminApi";
import { Edit2, Trash2, Power } from "lucide-react";

interface OffersTableProps {
  offers: OfferRecord[];
  onEdit?: (offer: OfferRecord) => void;
  onDelete?: (offerId: string) => void;
  onToggle?: (offerId: string) => void;
}

export default function OffersTable({ offers, onEdit, onDelete, onToggle }: OffersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300";
      case "Expired":
        return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      default:
        return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Percentage (%)";
      case "fixed":
        return "Fixed Amount";
      case "bogo":
        return "Buy One Get One";
      default:
        return type;
    }
  };

  const formatDiscountValue = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    } else if (type === "fixed") {
      return `₹${value}`;
    } else if (type === "bogo") {
      return `₹${value} off`;
    }
    return value;
  };

  return (
    <div className="table-shell rounded-[30px]">
      <div className="border-b border-[var(--app-border)] px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">All offers</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage active, scheduled, and expired campaigns with a unified dark-mode-friendly table.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-head sticky top-0 z-10 border-b border-[var(--app-border)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Offer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Discount Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Discount Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Duration
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Usage
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {offers.map((offer) => (
              <tr key={offer._id} className="table-row">
                <td className="px-6 py-4 text-sm font-medium text-slate-950 dark:text-slate-50">
                  <div>{offer.name}</div>
                  <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">{offer.couponCode}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {getDiscountTypeLabel(offer.discountType)}
                </td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {formatDiscountValue(offer.discountType, offer.discountValue)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{offer.applicableProducts}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex flex-col">
                    <span>{new Date(offer.startDate).toLocaleDateString("en-IN")}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">to</span>
                    <span>{new Date(offer.endDate).toLocaleDateString("en-IN")}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      offer.status
                    )}`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-slate-950 dark:text-slate-50">{offer.currentUsage}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">of {offer.maxUsage}</span>
                    <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${(offer.currentUsage / offer.maxUsage) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit?.(offer)}
                      className="rounded-xl p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                      title="Edit offer"
                    >
                      <Edit2 size={16} />
                    </button>
                    {offer.status === "Active" && (
                      <button
                        onClick={() => onToggle?.(offer._id)}
                        className="rounded-xl p-2 text-yellow-600 transition-colors hover:bg-yellow-50 hover:text-yellow-700 dark:hover:bg-yellow-500/10 dark:hover:text-yellow-300"
                        title="Disable offer"
                      >
                        <Power size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete?.(offer._id)}
                      className="rounded-xl p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      title="Delete offer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
