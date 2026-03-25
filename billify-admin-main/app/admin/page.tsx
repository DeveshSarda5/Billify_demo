"use client";

import { useEffect, useState } from "react";
import { User, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { AdminSessionError, AdminSessionLoading } from "@/app/components/AdminSessionState";
import { fetchAdminProfile, type AdminUser } from "@/lib/adminApi";
import { useAdminSession } from "@/lib/useAdminSession";

export default function AdminProfile() {
  const { ready, loading, error: sessionError } = useAdminSession();
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    fetchAdminProfile()
      .then(setAdminData)
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : "Failed to load profile"));
  }, [ready]);

  if (loading) {
    return <AdminSessionLoading />;
  }

  if (!ready) {
    return <AdminSessionError message={sessionError || "Admin session is not ready."} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Admin Profile</h1>
        <p className="text-gray-500">Account details resolved from the shared backend JWT session.</p>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
            <User size={36} />
          </div>

          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <InfoTile icon={User} label="Name" value={adminData?.name || "-"} />
            <InfoTile icon={Mail} label="Email" value={adminData?.email || "-"} />
            <InfoTile icon={Phone} label="Phone" value={adminData?.phone || "-"} />
            <InfoTile icon={MapPin} label="Location" value={adminData?.location || "-"} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Role</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{adminData?.role || "-"}</p>
              <p className="mt-1 text-sm text-gray-600">Use this account to manage shared products, bills, payments, and support tickets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-2 text-gray-700 shadow-sm">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
