"use client";

import Link from "next/link";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { useAuth } from "../_components/AuthProvider";

export default function AdminPage() {
  const { user, logout } = useAuth();

  const displayName =
    user?.displayName?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");

  const handleLogout = async () => {
    await logout();
  };

  return (
    <RequireAuth>
      <RoleGate
        allowedRole="admin"
        fallback={
          <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
            {/* TOP NAVBAR (non-admin view) */}
            <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
              <Link href="/" className="text-2xl font-extrabold tracking-tight">
                <span className="text-[#0e2756]">pa</span>
                <span className="text-[#ff0f64]">level</span>
              </Link>

              <nav className="flex items-center gap-6 text-sm font-semibold">
                <Link href="/rooms" className="hidden text-[#0e2756] md:inline">
                  Browse rooms
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-semibold text-[#0e2756]"
                >
                  Back to profile
                </Link>
              </nav>
            </header>

            <main className="mx-auto max-w-5xl px-6 pb-16">
              <section className="mt-10 rounded-3xl bg-white px-6 py-8 text-sm shadow-[0_22px_45px_rgba(0,0,0,0.08)]">
                <h1 className="text-2xl font-extrabold">
                  Admin area is restricted
                </h1>
                <p className="mt-2 text-sm text-[#5f6b85]">
                  You&apos;re logged in as{" "}
                  <span className="font-semibold">
                    {user?.email ?? "a regular user"}
                  </span>
                  , but this page is only for Pa-Level staff.
                </p>
                <p className="mt-3 text-sm text-[#5f6b85]">
                  If you think this is a mistake, contact the Pa-Level team.
                  You can keep using the platform as a tenant or landlord as
                  normal.
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-xs">
                  <Link
                    href="/profile"
                    className="rounded-full bg-[#0e2756] px-6 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                  >
                    Go back to profile
                  </Link>
                  <Link
                    href="/rooms"
                    className="rounded-full bg-white px-6 py-2 text-xs font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.06)]"
                  >
                    Browse rooms
                  </Link>
                </div>
              </section>
            </main>
          </div>
        }
      >
        {/* REAL ADMIN VIEW (only admins see this) */}
        <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
          {/* TOP NAVBAR */}
          <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              <span className="text-[#0e2756]">pa</span>
              <span className="text-[#ff0f64]">level</span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-semibold">
              <Link href="/rooms" className="hidden text-[#0e2756] md:inline">
                Browse rooms
              </Link>
              <Link
                href="/profile"
                className="hidden text-[#0e2756] md:inline"
              >
                Back to profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ccd1ea] bg-white px-6 py-2 text-sm font-semibold text-[#0e2756]"
              >
                Logout
              </button>
            </nav>
          </header>

          <main className="mx-auto max-w-5xl px-6 pb-16">
            <section className="mt-6 rounded-3xl bg-white px-6 py-8 shadow-[0_22px_45px_rgba(0,0,0,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
                Admin panel
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                Hey {displayName}, welcome to the Pa-Level admin view
              </h1>
              <p className="mt-2 text-sm text-[#5f6b85]">
                This is just a stub for now. Later, this is where you&apos;ll
                manage reported listings, verify landlords, and see platform-
                wide stats.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3 text-xs">
                <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a6bf]">
                    Platform stats
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#0e2756]">
                    Coming soon
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6b85]">
                    Total users, verified landlords, active listings.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a6bf]">
                    Safety & reports
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#0e2756]">
                    Coming soon
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6b85]">
                    Handle reported listings and user issues from here.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#0e2756] px-4 py-3 text-white shadow-[0_16px_30px_rgba(0,0,0,0.5)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                    Internal tools
                  </p>
                  <p className="mt-2 text-sm font-extrabold">
                    We&apos;ll plug in custom tools as Pa-Level grows.
                  </p>
                  <p className="mt-1 text-[11px] text-white/80">
                    Think CSV exports, bulk actions, manual verifications.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}
