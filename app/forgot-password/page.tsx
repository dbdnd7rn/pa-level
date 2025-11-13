// app/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "../_components/AuthProvider";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await resetPassword(email);
      setMessage(
        "If an account exists with that email, a password reset link has been sent."
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold text-[#0e2756]">
          Back to login
        </Link>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-4">
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        <p className="mt-2 text-sm text-[#5f6b85]">
          Enter the email you use for Pa-Level and we&apos;ll send you a reset
          link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-[#d9deef] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <div className="rounded-2xl bg-[#e6f8f3] px-4 py-3 text-xs text-[#047857]">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-[#ffe6e6] px-4 py-3 text-xs text-[#b91c1c]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#ff0f64] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)] disabled:opacity-60"
          >
            {loading ? "Sending link…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-4 text-xs text-[#9ba3c4]">
          If you remember your password, you can{" "}
          <Link href="/login" className="font-semibold text-[#0e2756]">
            go back to login
          </Link>{" "}
          instead.
        </p>
      </main>
    </div>
  );
}
