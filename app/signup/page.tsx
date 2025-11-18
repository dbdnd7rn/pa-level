// app/signup/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getClientAuth } from "../../lib/firebaseClient";
import { useAuth } from "../_components/AuthProvider";

type RoleChoice = "tenant" | "landlord";

export default function SignupPage() {
  const router = useRouter();
  const { setRole } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleChoice, setRoleChoice] = useState<RoleChoice>("tenant");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // 🔸 initialize Auth lazily on the client
      const auth = getClientAuth();

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }

      // 🔐 set role in context + localStorage
      setRole(roleChoice);

      // Redirect based on role
      if (roleChoice === "landlord") {
        router.push("/landlord-dashboard");
      } else {
        router.push("/tenant-dashboard");
      }
    } catch (err: any) {
      console.error(err);
      let message = "Could not create your account.";
      if (err?.code === "auth/email-already-in-use") {
        message = "That email is already in use.";
      } else if (err?.code === "auth/weak-password") {
        message = "Password is too weak.";
      } else if (err?.code === "auth/invalid-email") {
        message = "Invalid email address.";
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/rooms" className="hidden text-[#0e2756] md:inline">
            Browse rooms
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#0e2756]">
            Login
          </Link>
        </nav>
      </header>

      {/* MAIN */}
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-6">
        <div className="w-full max-w-md rounded-3xl bg-white px-6 py-7 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
            Sign up
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">
            Create your Pa-Level account
          </h1>
          <p className="mt-1 text-xs text-[#5f6b85]">
            Whether you&apos;re a student or a landlord, you&apos;ll manage
            everything from your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
            {/* ROLE SWITCH */}
            <div>
              <p className="mb-1 text-xs font-semibold text-[#5f6b85]">
                I&apos;m signing up as
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRoleChoice("tenant")}
                  className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold ${
                    roleChoice === "tenant"
                      ? "border-[#ff0f64] bg-[#fff0f6] text-[#ff0f64]"
                      : "border-[#d9deef] bg-[#f9fafc] text-[#5f6b85]"
                  }`}
                >
                  Student / tenant
                </button>
                <button
                  type="button"
                  onClick={() => setRoleChoice("landlord")}
                  className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold ${
                    roleChoice === "landlord"
                      ? "border-[#ff0f64] bg-[#fff0f6] text-[#ff0f64]"
                      : "border-[#d9deef] bg-[#f9fafc] text-[#5f6b85]"
                  }`}
                >
                  Landlord
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                Full name
              </label>
              <input
                type="text"
                required
                className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                placeholder="Thoko Jere"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-[#b91c1c]">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#ff0f64] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)] disabled:opacity-70"
            >
              {loading ? "Creating your account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-[#5f6b85]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#ff0f64]">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
