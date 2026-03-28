"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  bootstrapLocalAdminSession,
  clearAdminSession,
  getStoredAdminToken,
  getStoredAdminUser,
  shouldUseLocalAdminBootstrap,
  type AdminUser,
} from "./adminApi";

export function useAdminSession() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const token = getStoredAdminToken();
      const storedUser = getStoredAdminUser();

      if (token && storedUser && storedUser.role === "admin") {
        if (!cancelled) {
          setUser(storedUser);
          setReady(true);
          setLoading(false);
        }
        return;
      }

      clearAdminSession();

      if (shouldUseLocalAdminBootstrap()) {
        try {
          const auth = await bootstrapLocalAdminSession();
          if (!cancelled) {
            setUser(auth.user);
            setReady(true);
            setLoading(false);
          }
          return;
        } catch (sessionError) {
          clearAdminSession();
          if (!cancelled) {
            setReady(false);
            setUser(null);
            setLoading(false);
            setError(sessionError instanceof Error ? sessionError.message : "Unable to start admin session.");
          }
          return;
        }
      }

      if (!cancelled) {
        setReady(false);
        setUser(null);
        setError(null);
        router.replace("/login");
      }
    };

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { ready, loading, user, error };
}