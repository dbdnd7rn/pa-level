// app/landlord-dashboard/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { getClientDb } from "../../lib/firebaseClient";

type Listing = {
  id: string;
  title: string;
  propertyType: string;
  monthlyFrom?: number | null;
  totalRooms?: number | null;
  distanceToCampus?: string | null;
  availableFrom?: string | null;
  description?: string | null;
  roomTypes?: string[];
  area?: string | null;
  campus?: string | null;
  city?: string | null;
  landlordName?: string | null;
  createdAt?: any;
  imageUrls?: string[];
};

// Fallback images if a listing doesn't have real photos yet
const defaultHeroImages = [
  "https://images.pexels.com/photos/8136916/pexels-photo-8136916.jpeg",
  "https://images.pexels.com/photos/2611877/pexels-photo-2611877.jpeg",
  "https://images.pexels.com/photos/4392270/pexels-photo-4392270.jpeg",
  "https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg",
];

// Sample data if Firestore is empty
const sampleListings: Listing[] = [
  {
    id: "sample-1",
    title: "Pa-Level House 1 | Ndata",
    propertyType: "Student residence",
    monthlyFrom: 80000,
    totalRooms: 32,
    distanceToCampus: "< 1km (walking)",
    availableFrom: "2026-02",
    description:
      "Bright student house 5 minutes from the MUST gate. Reliable Wi-Fi, backup power and a quiet study area.",
    roomTypes: ["Single rooms", "Sharing rooms"],
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    landlordName: "Pa-Level Estates",
    imageUrls: defaultHeroImages,
  },
  {
    id: "sample-2",
    title: "Skylight Student Residence",
    propertyType: "Student residence",
    monthlyFrom: 85000,
    totalRooms: 40,
    distanceToCampus: "1 – 3 km",
    availableFrom: "2026-02",
    description:
      "Modern residence with shared kitchens, common rooms and 24/7 security.",
    roomTypes: ["Single rooms", "Triple / quad rooms"],
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    landlordName: "Skylight Properties",
    imageUrls: defaultHeroImages,
  },
];

function mapListingDoc(docSnap: QueryDocumentSnapshot<DocumentData>): Listing {
  const data = docSnap.data();

  // Normalise monthlyFrom to a number if stored as string
  let monthlyFrom: number | null = null;
  if (typeof data.monthlyFrom === "number") monthlyFrom = data.monthlyFrom;
  else if (typeof data.monthlyFrom === "string") {
    const digits = data.monthlyFrom.replace(/[^\d]/g, "");
    monthlyFrom = digits ? parseInt(digits, 10) : null;
  } else if (typeof data.priceFrom === "number") {
    monthlyFrom = data.priceFrom;
  }

  return {
    id: docSnap.id,
    title: data.title ?? "Untitled listing",
    propertyType: data.propertyType ?? "Student residence",
    monthlyFrom,
    totalRooms: data.totalRooms ?? null,
    distanceToCampus: data.distanceToCampus ?? null,
    availableFrom: data.availableFrom ?? null,
    description: data.description ?? null,
    roomTypes: Array.isArray(data.roomTypes) ? data.roomTypes : [],
    area: data.area ?? null,
    campus: data.campus ?? null,
    city: data.city ?? null,
    landlordName: data.landlordName ?? null,
    createdAt: data.createdAt ?? null,
    imageUrls:
      Array.isArray(data.imageUrls) && data.imageUrls.length > 0
        ? data.imageUrls
        : defaultHeroImages,
  };
}

function formatPrice(amount?: number | null) {
  if (!amount) return "Ask";
  return `K${amount.toLocaleString("en-MW")}`;
}

export default function LandlordDashboardPage() {
  const { user, logout } = useAuth();

  const [listings, setListings] = useState<Listing[]>(sampleListings);
  const [usingSamples, setUsingSamples] = useState(true);
  const [loading, setLoading] = useState(false);

  const displayName =
    user?.displayName?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const db = getClientDb(); // lazy init on client
        const q = query(collection(db, "listings"), where("ownerId", "==", user.uid));
        const snap = await getDocs(q);

        if (snap.empty) {
          // No real data → keep samples
          setListings(sampleListings);
          setUsingSamples(true);
          return;
        }

        setListings(snap.docs.map(mapListingDoc));
        setUsingSamples(false);
      } catch (err) {
        console.error("Landlord dashboard load error:", err);
        setListings(sampleListings);
        setUsingSamples(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  // Simple stats
  const totalListings = listings.length;
  const totalCapacity = useMemo(
    () =>
      listings.reduce((sum, l) => sum + (typeof l.totalRooms === "number" ? l.totalRooms : 0), 0),
    [listings]
  );
  const avgPrice = useMemo(() => {
    const prices = listings.map((l) => l.monthlyFrom).filter((n): n is number => !!n);
    if (prices.length === 0) return null;
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return `~ ${formatPrice(avg)}/mo`;
  }, [listings]);

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

            <nav className="flex items-center gap-3 text-sm font-semibold">
              <Link href="/rooms" className="hidden text-[#0e2756] md:inline">
                Browse rooms
              </Link>
              <Link
                href="/landlord-create-listing"
                className="rounded-full bg-[#ff0f64] px-5 py-2 text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)]"
              >
                + Create listing
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ccd1ea] bg-white px-6 py-2 text-sm font-semibold text-[#0e2756]"
              >
                Logout
              </button>
            </nav>
          </header>

          {/* HEADER STRIP */}
          <section className="bg-gradient-to-b from-[#d1e4ff] to-[#f6f7fb] pb-10 pt-6">
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0e2756]/70">
                Landlord dashboard
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                Hey {displayName}, manage your properties here 👋
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5f6b85]">
                Track your listings, check interest and keep details up to date.
              </p>
              <p className="mt-1 text-[11px] text-[#647099]">
                {loading
                  ? "Loading your listings from Firestore…"
                  : usingSamples
                  ? "Showing sample listings so you can preview the dashboard. Once you create a listing, it will appear here."
                  : "These stats reflect your real listings stored in Firestore."}
              </p>
            </div>
          </section>

          {/* STATS */}
          <main className="mx-auto max-w-6xl px-6 pb-16">
            <section className="-mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Active listings
                </p>
                <p className="mt-3 text-2xl font-extrabold">{totalListings}</p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Create more to reach more students.
                </p>
              </div>

              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Approx. capacity
                </p>
                <p className="mt-3 text-2xl font-extrabold">{totalCapacity}</p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Sum of rooms across your listings.
                </p>
              </div>

              <div className="rounded-3xl bg-[#0e2756] px-5 py-4 text-white shadow-[0_18px_35px_rgba(0,0,0,0.5)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Avg. price
                </p>
                <p className="mt-3 text-2xl font-extrabold">
                  {avgPrice ?? "—"}
                </p>
                <p className="mt-1 text-xs text-white/80">
                  Based on “Monthly rental from”.
                </p>
              </div>
            </section>

            {/* LISTINGS TABLE/CARDS */}
            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold">Your listings</h2>
                  <p className="text-xs text-[#5f6b85]">
                    Edit details soon (coming), or preview as students see them.
                  </p>
                </div>
                <Link
                  href="/landlord-create-listing"
                  className="rounded-full bg-[#ff0f64] px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)]"
                >
                  + New listing
                </Link>
              </div>

              {listings.length === 0 ? (
                <div className="rounded-3xl border border-[#e4e7f3] bg-white px-6 py-8 text-sm">
                  <p className="font-semibold">No listings yet</p>
                  <p className="mt-1 text-[#5f6b85]">
                    Create your first property to start getting enquiries.
                  </p>
                  <Link
                    href="/landlord-create-listing"
                    className="mt-4 inline-flex rounded-full bg-[#0e2756] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Create listing
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {listings.map((l) => {
                    const photos =
                      l.imageUrls && l.imageUrls.length > 0
                        ? l.imageUrls
                        : defaultHeroImages;
                    const firstPhoto = photos[0];
                    const loc = [l.area, l.campus, l.city]
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <div
                        key={l.id}
                        className="overflow-hidden rounded-3xl border border-[#edf0fb] bg-white shadow-[0_16px_30px_rgba(0,0,0,0.06)]"
                      >
                        <div className="overflow-hidden">
                          <img
                            src={firstPhoto}
                            alt={l.title}
                            className="h-40 w-full object-cover"
                          />
                        </div>
                        <div className="px-5 py-4 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                            {l.propertyType}
                          </p>
                          <h3 className="mt-1 text-base font-extrabold">
                            {l.title}
                          </h3>
                          <p className="mt-1 text-[11px] text-[#9ba3c4]">{loc}</p>

                          <div className="mt-3 flex items-center gap-3 text-[11px]">
                            <span className="rounded-full bg-[#f6f7fb] px-3 py-1">
                              {l.totalRooms ? `${l.totalRooms} rooms` : "Rooms TBC"}
                            </span>
                            <span className="rounded-full bg-[#fff3f8] px-3 py-1 text-[#ff0f64]">
                              {formatPrice(l.monthlyFrom)} / mo
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs">
                            <Link
                              href={`/room?id=${encodeURIComponent(l.id)}`}
                              className="font-semibold text-[#ff0f64]"
                            >
                              Preview public page →
                            </Link>
                            <span className="text-[11px] text-[#647099]">
                              {l.availableFrom
                                ? `Available: ${l.availableFrom}`
                                : "Availability: TBC"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ROADMAP / PLACEHOLDERS */}
            <section className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl bg-white px-5 py-5 text-sm shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <h3 className="text-sm font-extrabold">Next up</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[#5f6b85]">
                  <li>Edit listing details & photos (coming soon)</li>
                  <li>See and respond to student enquiries</li>
                  <li>Payment status & deposit tracking</li>
                </ul>
              </div>
              <div className="rounded-3xl bg-[#0e2756] px-5 py-5 text-sm text-white shadow-[0_18px_35px_rgba(0,0,0,0.5)]">
                <h3 className="text-sm font-extrabold">Tips</h3>
                <p className="mt-2 text-white/80">
                  Clear photos, honest descriptions and realistic pricing get the
                  most enquiries. You can add photos in the next iteration of
                  Pa-Level.
                </p>
              </div>
            </section>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}
