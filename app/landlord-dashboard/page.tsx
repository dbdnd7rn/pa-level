"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { useAuth } from "../_components/AuthProvider";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebaseClient";

type Listing = {
  id: string;
  title: string;
  area: string;
  campus: string;
  city: string;
  totalRooms: number;
  occupied: number;
  monthlyFrom: number;
  monthlyRevenueEstimate: number;
};

// Sample portfolio if landlord has no Firestore listings yet
const sampleListings: Listing[] = [
  {
    id: "sample-1",
    title: "Pa-Level House 1 | Ndata",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    totalRooms: 32,
    occupied: 27,
    monthlyFrom: 80000,
    monthlyRevenueEstimate: 2450000,
  },
  {
    id: "sample-2",
    title: "Skylight Student Residence",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    totalRooms: 40,
    occupied: 34,
    monthlyFrom: 85000,
    monthlyRevenueEstimate: 3100000,
  },
  {
    id: "sample-3",
    title: "Campus View Lodge",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    totalRooms: 18,
    occupied: 15,
    monthlyFrom: 110000,
    monthlyRevenueEstimate: 1650000,
  },
  {
    id: "sample-4",
    title: "Green Gardens House",
    area: "Malindi",
    campus: "MUST",
    city: "Thyolo",
    totalRooms: 10,
    occupied: 8,
    monthlyFrom: 70000,
    monthlyRevenueEstimate: 560000,
  },
];

function formatK(value: number) {
  return `K${value.toLocaleString("en-MW")}`;
}

function mapListingDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>
): Listing {
  const data = docSnap.data();

  const totalRooms =
    typeof data.totalRooms === "number" ? data.totalRooms : 0;
  const monthlyFrom =
    typeof data.monthlyFrom === "number" ? data.monthlyFrom : 0;

  const occupied =
    typeof data.occupied === "number"
      ? data.occupied
      : totalRooms; // assume full for estimate

  const monthlyRevenueEstimate =
    typeof data.monthlyRevenueEstimate === "number"
      ? data.monthlyRevenueEstimate
      : totalRooms * monthlyFrom;

  return {
    id: docSnap.id,
    title: data.title || "Untitled listing",
    area: data.area || "Ndata",
    campus: data.campus || "MUST",
    city: data.city || "Thyolo",
    totalRooms,
    occupied,
    monthlyFrom,
    monthlyRevenueEstimate,
  };
}

export default function LandlordDashboardPage() {
  const { user, logout } = useAuth();

  const [listings, setListings] = useState<Listing[]>(sampleListings);
  const [usingSamples, setUsingSamples] = useState(true);
  const [loading, setLoading] = useState(false);

  const displayName =
    user?.displayName?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "listings"),
          where("landlordId", "==", user.uid)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setListings(sampleListings);
          setUsingSamples(true);
          return;
        }

        const docs = snap.docs.map(mapListingDoc);
        setListings(docs);
        setUsingSamples(false);
      } catch (err) {
        console.error("Error loading landlord listings:", err);
        setListings(sampleListings);
        setUsingSamples(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const totalRooms = listings.reduce((sum, p) => sum + p.totalRooms, 0);
  const occupiedRooms = listings.reduce((sum, p) => sum + p.occupied, 0);
  const freeRooms = totalRooms - occupiedRooms;
  const overallOccupancy =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const totalMonthlyRevenue = listings.reduce(
    (sum, p) => sum + p.monthlyRevenueEstimate,
    0
  );

  return (
    <RequireAuth>
      <RoleGate allowedRole="landlord">
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
              <Link
                href="/landlord-resources"
                className="hidden text-[#0e2756] md:inline"
              >
                Landlord resources
              </Link>
              <Link
                href="/landlord-dashboard"
                className="hidden text-[#0e2756] md:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="hidden text-[#0e2756] md:inline"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ccd1ea] bg-white px-6 py-2 text-sm font-semibold text-[#0e2756]"
              >
                Logout
              </button>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-6 pb-16">
            {/* PAGE HEADER */}
            <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
                  Landlord dashboard
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Good morning, {displayName}
                </h1>
                <p className="mt-2 text-sm text-[#5f6b85]">
                  Quick snapshot of your student accommodation near MUST.
                </p>
                <p className="mt-1 text-[11px] text-[#9ba3c4]">
                  {loading
                    ? "Loading your live listings…"
                    : usingSamples
                    ? "Showing sample properties so you can feel the dashboard. Once you add a listing, your real data will appear here."
                    : "These numbers are based on listings you’ve saved in Pa-Level."}
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <button className="rounded-full bg-white px-4 py-2 font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
                  Academic year 2025 / 2026
                </button>
                <button className="rounded-full border border-[#ccd1ea] px-4 py-2 font-semibold text-[#5f6b85]">
                  Export summary
                </button>
              </div>
            </section>

            {/* STATS CARDS */}
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Active properties
                </p>
                <p className="mt-3 text-2xl font-extrabold">
                  {listings.length}
                </p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Near MUST • linked to your profile
                </p>
              </div>

              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Occupancy
                </p>
                <p className="mt-3 text-2xl font-extrabold">
                  {overallOccupancy}%
                </p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  {occupiedRooms} of {totalRooms} beds filled
                </p>
              </div>

              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Free beds
                </p>
                <p className="mt-3 text-2xl font-extrabold">{freeRooms}</p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Great time to push your listings
                </p>
              </div>

              <div className="rounded-3xl bg-[#ff0f64] px-5 py-4 text-white shadow-[0_18px_35px_rgba(255,15,100,0.55)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Est. monthly income
                </p>
                <p className="mt-3 text-2xl font-extrabold">
                  {formatK(totalMonthlyRevenue)}
                </p>
                <p className="mt-1 text-xs text-white/80">
                  Based on current confirmed tenants
                </p>
              </div>
            </section>

            {/* MAIN GRID: PROPERTIES + SIDE PANEL */}
            <section className="mt-10 grid gap-8 lg:grid-cols-[2fr,1.2fr]">
              {/* PROPERTIES OVERVIEW */}
              <div className="rounded-3xl bg-white px-5 py-5 shadow-[0_18px_35px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Properties overview
                    </h2>
                    <p className="text-xs text-[#5f6b85]">
                      Track occupancy, starting prices and revenue per
                      building.
                    </p>
                  </div>
                  <Link
                    href="/landlord-create-listing"
                    className="hidden rounded-full bg-[#ff0f64] px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.45)] md:inline"
                  >
                    + Add new property
                  </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#edf0fb]">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-[#f6f7fb] text-[11px] uppercase tracking-wide text-[#9ba3c4]">
                      <tr>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3">Rooms</th>
                        <th className="px-4 py-3">Occupancy</th>
                        <th className="px-4 py-3">From</th>
                        <th className="px-4 py-3">Est. monthly</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((p) => {
                        const occupancy =
                          p.totalRooms > 0
                            ? Math.round(
                                (p.occupied / p.totalRooms) * 100
                              )
                            : 0;
                        return (
                          <tr
                            key={p.id}
                            className="border-t border-[#edf0fb] text-[13px]"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold">{p.title}</p>
                              <p className="text-[11px] text-[#9ba3c4]">
                                {p.area} • {p.campus}, {p.city}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              {p.occupied}/{p.totalRooms}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#edf0fb]">
                                  <div
                                    className="h-full rounded-full bg-[#0e2756]"
                                    style={{ width: `${occupancy}%` }}
                                  />
                                </div>
                                <span className="text-[11px] text-[#5f6b85]">
                                  {occupancy}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              {formatK(p.monthlyFrom)}
                            </td>
                            <td className="px-4 py-3 align-top">
                              {formatK(p.monthlyRevenueEstimate)}
                            </td>
                            <td className="px-4 py-3 text-right align-top">
                              <Link
                                href={`/room?id=${p.id}`}
                                className="text-[11px] font-semibold text-[#ff0f64]"
                              >
                                View listing →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile add property button */}
                <div className="mt-4 md:hidden">
                  <Link
                    href="/landlord-create-listing"
                    className="inline-flex w-full justify-center rounded-full bg-[#ff0f64] px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.45)]"
                  >
                    + Add new property
                  </Link>
                </div>
              </div>

              {/* RIGHT SIDEBAR – keep your earlier cards if you like; keeping short here */}
              <div className="space-y-6">
                <div className="rounded-3xl bg-[#0e2756] px-5 py-5 text-xs text-white shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  <h2 className="text-sm font-extrabold">
                    Payments at a glance
                  </h2>
                  <p className="mt-1 text-[11px] text-white/80">
                    Track deposits and rent coming through Pa-Level.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white/5 px-3 py-3">
                      <p className="text-[11px] font-semibold">
                        Live payments coming soon
                      </p>
                      <p className="mt-1 text-[11px] text-white/75">
                        Once Stripe / Paystack is connected, this card will
                        show totals from your linked gateway.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/landlord-transactions"
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-[#ff0f64] px-4 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.6)]"
                  >
                    View all transactions
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}
