"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import { createProduct, deleteProduct, getProducts, updateProduct, type ProductRecord } from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";
import { formatINR } from "@/lib/currency";

type ProductFormState = {
  name: string;
  barcode: string;
  category: string;
  price: string;
  stock: string;
};

const emptyForm: ProductFormState = {
  name: "",
  barcode: "",
  category: "",
  price: "",
  stock: "",
};

export default function ProductsPage() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setError(null);
      setProducts(await getProducts());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load products");
    }
  };

  useEffect(() => {
    if (ready) {
      void loadProducts();
    }
  }, [ready]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = searchQuery.toLowerCase();
      return (
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.barcode.toLowerCase().includes(term) ||
        (product.category || "").toLowerCase().includes(term)
      );
    });
  }, [products, searchQuery]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      barcode: form.barcode,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      resetForm();
      await loadProducts();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (product: ProductRecord) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      barcode: product.barcode,
      category: product.category || "",
      price: String(product.price),
      stock: String(product.stock),
    });
  };

  const onDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete product");
    }
  };

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[32px] px-6 py-7 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Products</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Manage store inventory through the shared Billify backend with a cleaner grid, richer forms, and full dark-mode support.</p>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="table-shell rounded-[30px]">
          <div className="border-b border-[var(--app-border)] p-6">
            <input
              type="text"
              placeholder="Search by name, barcode, or category"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="input-app h-12 rounded-2xl px-4 py-3"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--app-border)]">
              <thead className="table-head sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Barcode</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="table-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-950 dark:text-slate-50">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.barcode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.category || "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.stock}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-950 dark:text-slate-50">{formatINR(product.price)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button onClick={() => onEdit(product)} className="mr-3 font-medium text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => void onDelete(product._id)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface-premium rounded-[30px] p-6">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{editingId ? "Edit product" : "Add product"}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">These changes go straight to the shared product collection used by the mobile app.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Product name" required className="input-app h-12 rounded-2xl px-4 py-3" />
            <input value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} placeholder="Barcode" required className="input-app h-12 rounded-2xl px-4 py-3" />
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="input-app h-12 rounded-2xl px-4 py-3" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Price" required className="input-app h-12 rounded-2xl px-4 py-3" />
              <input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="Stock" required className="input-app h-12 rounded-2xl px-4 py-3" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary-app flex-1 rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}</button>
              <button type="button" onClick={resetForm} className="btn-secondary-app rounded-2xl px-4 py-3 text-sm font-semibold">Reset</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
