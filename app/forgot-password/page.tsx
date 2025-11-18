"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { getClientAuth } from "@/lib/firebaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSending(true);
    try {
      await sendPasswordResetEmail(getClientAuth(), email);
      setMsg("Password reset link sent. Check your inbox.");
      setEmail("");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to send reset email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/login" className="text-[#0e2756]">Login</Link>
          <Link href="/signup" className="text-[#0e2756]">Create account</Link>
        </nav>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-6">
        <div className="w-full max-w-md rounded-3xl bg-white px-6 py-7 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
            Reset password
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Forgot your password?</h1>
          <p className="mt-1 text-xs text-[#5f6b85]">
            Enter your email and we’ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {msg && <p className="text-xs font-semibold text-green-700">{msg}</p>}
            {err && <p className="text-xs font-semibold text-[#b91c1c]">{err}</p>}

            <button
              type="submit"
              disabled={sending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#ff0f64] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)] disabled:opacity-70"
            >
              {sending ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-[#5f6b85]">
            Remembered your password?{" "}
            <Link href="/login" className="font-semibold text-[#ff0f64]">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
