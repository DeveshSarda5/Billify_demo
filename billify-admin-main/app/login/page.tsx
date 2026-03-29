"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DirectionalRiveButton from "../components/DirectionalRiveButton";
import Logo from "../components/Logo";
import {
  bootstrapLocalAdminSession,
  getStoredAdminToken,
  loginAdmin,
  shouldUseLocalAdminBootstrap,
} from "@/lib/adminApi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocalBootstrapEnabled, setIsLocalBootstrapEnabled] = useState(false);

  useEffect(() => {
    const localBootstrapEnabled = shouldUseLocalAdminBootstrap();
    setIsLocalBootstrapEnabled(localBootstrapEnabled);

    if (getStoredAdminToken()) {
      router.replace("/");
      return;
    }

    if (!localBootstrapEnabled) {
      return;
    }

    setLoading(true);
    setError(null);

    bootstrapLocalAdminSession()
      .then(() => router.replace("/"))
      .catch((loginError) => {
        setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginAdmin(email, password);
      router.push("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="surface-premium w-full max-w-md rounded-[28px] p-8 sm:p-10">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in with an admin account on the shared Billify backend.
          </p>
          {isLocalBootstrapEnabled ? (
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
              Local development mode detected. Redirecting directly into admin.
            </p>
          ) : null}
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-app rounded-2xl px-4 py-3"
              placeholder="admin@billify.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-app rounded-2xl px-4 py-3"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <DirectionalRiveButton type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </DirectionalRiveButton>
        </form>
      </div>
    </div>
  );
}