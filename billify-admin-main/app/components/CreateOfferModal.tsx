"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { type OfferRecord } from "@/lib/adminApi";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  saving?: boolean;
  initialData?: OfferRecord | null;
}

const emptyForm = {
  name: "",
  couponCode: "",
  discountType: "percentage",
  discountValue: "",
  applicableProducts: "All Products",
  startDate: "",
  endDate: "",
  maxUsage: "",
  isActive: true,
};

export default function CreateOfferModal({ isOpen, onClose, onSubmit, saving = false, initialData = null }: CreateOfferModalProps) {
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        couponCode: initialData.couponCode,
        discountType: initialData.discountType,
        discountValue: String(initialData.discountValue),
        applicableProducts: initialData.applicableProducts,
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : "",
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : "",
        maxUsage: String(initialData.maxUsage),
        isActive: initialData.status === "Active",
      });
      return;
    }

    setFormData(emptyForm);
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const isEditing = initialData !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="surface-premium max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px]"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--app-border)] bg-white/80 px-6 py-5 backdrop-blur-xl dark:bg-slate-950/85">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">{isEditing ? "Edit Offer" : "Create New Offer"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Offer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Spring Sale 2026"
              className="input-app h-12 rounded-2xl px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Coupon Code *
            </label>
            <input
              type="text"
              name="couponCode"
              value={formData.couponCode}
              onChange={handleChange}
              placeholder="e.g., SAVE50"
              className="input-app h-12 rounded-2xl px-4 py-2 uppercase"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Customers enter this code at checkout. Uppercase letters and numbers only.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="select-app h-12 rounded-2xl px-4 py-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (INR)</option>
                <option value="bogo">Buy One Get One</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder="Enter value"
                className="input-app h-12 rounded-2xl px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Applicable Products or Categories *
            </label>
            <select
              name="applicableProducts"
              value={formData.applicableProducts}
              onChange={handleChange}
              className="select-app h-12 rounded-2xl px-4 py-2"
            >
              <option value="All Products">All Products</option>
              <option value="Milk">Milk</option>
              <option value="Bread">Bread</option>
              <option value="Coffee">Coffee</option>
              <option value="Groceries">Groceries</option>
              <option value="Beverages">Beverages</option>
              <option value="Dairy Products">Dairy Products</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-app h-12 rounded-2xl px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-app h-12 rounded-2xl px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Maximum Usage Limit *
            </label>
            <input
              type="number"
              name="maxUsage"
              value={formData.maxUsage}
              onChange={handleChange}
              placeholder="e.g., 1000"
              className="input-app h-12 rounded-2xl px-4 py-2"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Activate this offer immediately
            </label>
          </div>

          <div className="flex gap-3 border-t border-[var(--app-border)] pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-app flex-1 rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary-app flex-1 rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Offer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
