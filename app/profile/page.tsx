"use client";

import Link from "next/link";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { useAuth } from "../_components/AuthProvider";

export default function ProfilePage() {
  const { user, role, logout } = useAuth();

  const displayName =
    user?.displayName?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");

  const handleLogout = async () => {
    await logout();
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#050816] text-white">
        {/* NAVBAR */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">pa</span>
            <span className="text-[#ff0f64]">level</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/tenant-dashboard"
              className="hidden md:inline text-white/80"
            >
              Tenant dashboard
            </Link>
            <Link
              href="/landlord-dashboard"
              className="hidden md:inline text-white/80"
            >
              Landlord dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 bg-transparent px-6 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-16">
          <section className="mt-6 grid gap-8 lg:grid-cols-[1.5fr,1.2fr]">
            {/* LEFT – PROFILE DETAILS */}
            <div className="rounded-3xl bg-[#0b1024] px-6 py-6 text-sm text-[#e4e6ff] shadow-[0_22px_45px_rgba(0,0,0,0.7)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
                Your profile
              </p>
              <h1 className="mt-2 text-3xl font-extrabold">
                Hi {displayName} 👋
              </h1>
              <p className="mt-2 text-sm text-[#c4c8ff]">
                This page is just a simple hub for now. Later it can grow into
                full account settings (notifications, billing, KYC, etc.).
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                    Email
                  </p>
                  <p className="mt-1 text-sm">
                    {user?.email || "Not set (Firebase user)"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                    Role
                  </p>
                  <p className="mt-1 text-sm capitalize">
                    {role ?? "Not assigned yet"}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9ba3c4]">
                    Role controls which dashboards you can access. For now you
                    can switch via the dev seed pages or Firestore.
                  </p>
                </div>
              </div>

              {/* Quick navigation */}
              <div className="mt-6 flex flex-wrap gap-3 text-xs">
                <Link
                  href="/tenant-dashboard"
                  className="rounded-full bg-white px-5 py-2 font-semibold text-[#050816]"
                >
                  Go to tenant dashboard
                </Link>
                <Link
                  href="/landlord-dashboard"
                  className="rounded-full border border-white/20 px-5 py-2 font-semibold text-white/90"
                >
                  Go to landlord dashboard
                </Link>
              </div>

              {/* Forgot-password hint */}
              <div className="mt-6 rounded-2xl bg-white/5 px-4 py-3 text-[11px] text-[#c4c8ff]">
                <p className="font-semibold text-[#ffb4d2]">
                  Forgot your password?
                </p>
                <p className="mt-1">
                  Use the{" "}
                  <Link
                    href="/forgot-password"
                    className="underline underline-offset-4"
                  >
                    reset password
                  </Link>{" "}
                  page to send yourself a reset link via Firebase Auth.
                </p>
              </div>
            </div>

            {/* RIGHT – MY LISTINGS + ADMIN CARD */}
            <div className="space-y-4">
              {/* My listings (landlord only view, but visible as info to others) */}
              <div className="space-y-4 rounded-3xl bg-[#0b1024] px-6 py-6 text-xs text-[#e4e6ff] shadow-[0_22px_45px_rgba(0,0,0,0.7)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                  Landlord tools
                </p>
                <h2 className="text-sm font-extrabold">My listings</h2>
                <p className="text-[11px] text-[#c4c8ff]">
                  This is a lightweight overview for now. The full analytics
                  live on the landlord dashboard.
                </p>

                <RoleGate
                  allowedRole="landlord"
                  fallback={
                    <p className="mt-2 text-[11px] text-[#9ba3c4]">
                      Switch your role to <span className="font-semibold">
                        landlord
                      </span>{" "}
                      (via Firestore/dev tools) to start adding properties and
                      see them here.
                    </p>
                  }
                >
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] text-[#c4c8ff]">
                      Once you&apos;ve created a few listings, this card can
                      show a quick count and last-updated time.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <Link
                        href="/landlord-create-listing"
                        className="rounded-full bg-[#ff0f64] px-4 py-2 font-semibold text-white shadow-[0_16px_35px_rgba(255,15,100,0.6)]"
                      >
                        + Create new listing
                      </Link>
                      <Link
                        href="/landlord-dashboard"
                        className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white/90"
                      >
                        View all listings
                      </Link>
                    </div>
                  </div>
                </RoleGate>
              </div>

              {/* ADMIN STUB */}
              <div className="space-y-4 rounded-3xl bg-[#0b1024] px-6 py-6 text-xs text-[#e4e6ff] shadow-[0_22px_45px_rgba(0,0,0,0.7)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                  Pa-Level staff
                </p>

                <RoleGate
                  allowedRole="admin"
                  fallback={
                    <p className="text-[11px] text-[#9ba3c4]">
                      Admin-only tools will appear here for Pa-Level staff. For
                      now this is just a placeholder.
                    </p>
                  }
                >
                  <p className="font-semibold text-[#ffb4d2]">
                    You&apos;re an admin account.
                  </p>
                  <p className="mt-1 text-[11px] text-[#c4c8ff]">
                    In a future iteration this will link to internal tools:
                    moderation, reporting, manual payouts, etc.
                  </p>
                  <Link
                    href="/admin"
                    className="mt-2 inline-flex rounded-full bg-[#0e2756] px-4 py-2 text-[11px] font-semibold text-white"
                  >
                    Go to admin panel
                  </Link>
                </RoleGate>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireAuth>
  );
}
