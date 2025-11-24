"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth } from "../../lib/firebaseClient";
import { useAuth } from "../_components/AuthProvider";

type RoleChoice = "tenant" | "landlord";

export default function LoginPage() {
  const router = useRouter();
  const { setRole, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleChoice, setRoleChoice] = useState<RoleChoice>("tenant");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      // ✅ lazily get auth on the client
      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, email, password);

      // 🔐 persist chosen role in context (and provider can mirror to localStorage)
      setRole(roleChoice);

      // Redirect based on role
      if (roleChoice === "landlord") {
        router.push("/landlord-dashboard");
      } else {
        router.push("/tenant-dashboard");
      }
    } catch (err: any) {
      console.error(err);
      let message = "Could not log you in. Please check your details.";
      if (err?.code === "auth/user-not-found") {
        message = "No user found with that email.";
      } else if (err?.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (err?.code === "auth/invalid-credential") {
        message = "Invalid email / password combination.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many attempts. Try again later.";
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email) {
      setInfoMsg("Enter your email above first, then click reset.");
      return;
    }
    try {
      await resetPassword(email);
      setInfoMsg("Password reset email sent (if this address exists).");
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not send reset email right now.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
<header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
  <Link href="/" className="text-2xl font-extrabold tracking-tight">
    <span className="text-[#0e2756]">pa</span>
    <span className="text-[#ff0f64]">level</span>
  </Link>

  <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">
    <Link href="/rooms" className="hidden text-[#0e2756] sm:inline">
      Browse rooms
    </Link>
    <Link
      href="/signup"
      className="rounded-full bg-[#ff0f64] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)] sm:px-5 sm:py-2"
    >
      Signup
    </Link>
  </nav>
</header>


      {/* MAIN */}
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-6">
        <div className="w-full max-w-md rounded-3xl bg-white px-6 py-7 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
            Sign in
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">
            Welcome back to Pa-Level
          </h1>
          <p className="mt-1 text-xs text-[#5f6b85]">
            Log in as a student or landlord to see your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
            {/* ROLE SWITCH */}
            <div>
              <p className="mb-1 text-xs font-semibold text-[#5f6b85]">
                I&apos;m logging in as
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
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-[#b91c1c]">{errorMsg}</p>
            )}
            {infoMsg && <p className="text-xs text-[#047857]">{infoMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#ff0f64] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)] disabled:opacity-70"
            >
              {loading ? "Signing you in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-[11px] text-[#5f6b85]">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-[#0e2756] underline"
            >
              Forgot password?
            </button>
            <Link href="/signup" className="font-semibold text-[#ff0f64]">
              Need an account? Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
