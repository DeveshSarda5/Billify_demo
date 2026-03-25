"use client";

import { useEffect, useState } from "react";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import { getAdminOffers, createOffer, updateOffer, deleteOffer, type OfferRecord } from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";
import CreateOfferModal from "../components/CreateOfferModal";
import OffersTable from "../components/OffersTable";
import OfferStatsCards from "../components/OfferStatsCards";

export default function DiscountsPage() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadOffers = async () => {
    try {
      setError(null);
      setOffers(await getAdminOffers());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load offers");
    }
  };

  useEffect(() => {
    if (ready) {
      void loadOffers();
    }
  }, [ready]);

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (offer: OfferRecord) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setSaving(true);
    try {
      setError(null);
      const payload = {
        name: formData.name,
        couponCode: (formData.couponCode as string).toUpperCase().trim(),
        discountType: formData.discountType as OfferRecord["discountType"],
        discountValue: Number(formData.discountValue),
        applicableProducts: formData.applicableProducts,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: (formData.isActive ? "Active" : "Scheduled") as OfferRecord["status"],
        maxUsage: Number(formData.maxUsage),
      };

      if (editingOffer) {
        await updateOffer(editingOffer._id, payload);
      } else {
        await createOffer(payload);
      }

      setIsModalOpen(false);
      setEditingOffer(null);
      await loadOffers();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      setError(null);
      await deleteOffer(offerId);
      await loadOffers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete offer");
    }
  };

  const handleToggle = async (offerId: string) => {
    const offer = offers.find((o) => o._id === offerId);
    if (!offer) return;
    try {
      setError(null);
      await updateOffer(offerId, {
        status: offer.status === "Active" ? "Scheduled" : "Active",
      });
      await loadOffers();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update offer status");
    }
  };

  if (loading) return <AdminSessionLoading />;
  if (!ready) return <AdminSessionError message={sessionError || "Admin session is not ready."} />;

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[32px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              Promotion studio
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Discounts and offers</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Create and manage promotional campaigns with consistent dark mode, cleaner data presentation, and faster editing workflows.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-primary-app inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold"
          >
            Create Offer
          </button>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Campaign overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live status, usage, and redemption progress across all offers.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Stats Cards */}
      <OfferStatsCards offers={offers} />

      {/* Offers Table */}
      <OffersTable
        offers={offers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* Create / Edit Offer Modal */}
      <CreateOfferModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOffer(null);
        }}
        onSubmit={handleSubmit}
        saving={saving}
        initialData={editingOffer}
      />
    </div>
  );
}
