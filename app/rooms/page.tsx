"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type Listing = {
  id: string;
  title: string;
  propertyType: string;
  monthlyFrom: number | null;
  totalRooms?: number | null;
  distanceToCampus?: string;
  availableFrom?: string;
  description?: string;
  roomTypes?: string[];
  area?: string;
  campus?: string;
  city?: string;
  landlordName?: string;
};

const sampleListings: Listing[] = [
  {
    id: "sample-1",
    title: "Pa-Level House 1 | Ndata",
    propertyType: "House",
    monthlyFrom: 80000,
    totalRooms: 32,
    distanceToCampus: "< 1km (walking)",
    availableFrom: "Feb 2026",
    description:
      "Bright, social student house a short walk from the MUST gate. Great value for money with strong community vibes.",
    roomTypes: ["Single rooms", "Sharing / double rooms", "Triple rooms"],
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    landlordName: "Pa-Level Estates",
  },
  {
    id: "sample-2",
    title: "Skylight Student Residence",
    propertyType: "Student residence",
    monthlyFrom: 85000,
    totalRooms: 40,
    distanceToCampus: "1 – 3 km",
    availableFrom: "Jan 2026",
    description:
      "Modern, furnished residence with study areas, Wi-Fi and backup power. Ideal if you want a more residence-style feel.",
    roomTypes: ["Triple rooms", "Double rooms"],
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    landlordName: "Skylight Properties",
  },
  {
    id: "sample-3",
    title: "Campus View Lodge",
    propertyType: "Lodge-style student housing",
    monthlyFrom: 110000,
    totalRooms: 18,
    distanceToCampus: "3 – 5 km",
    availableFrom: "Feb 2026",
    description:
      "Smaller, quieter lodge-style accommodation with ensuite rooms and strong Wi-Fi. Great if you prefer your own space.",
    roomTypes: ["Standard ensuite", "Single rooms"],
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    landlordName: "Campus View",
  },
];

function parseMoney(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return null;
    const num = parseInt(digits, 10);
    return Number.isNaN(num) ? null : num;
  }
  return null;
}

function formatMoney(value: number | null | undefined): string {
  if (!value && value !== 0) return "Price on request";
  return `K${value.toLocaleString("en-MW")}`;
}

function buildLocation(listing: Listing): string {
  const parts = [listing.area, listing.campus, listing.city].filter(Boolean);
  return parts.join(" • ");
}

export default function RoomsPage() {
  const [listings, setListings] = useState<Listing[]>(sampleListings);
  const [usingSamples, setUsingSamples] = useState(true);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [campusFilter, setCampusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "listings"));
        if (cancelled) return;

        if (!snap.empty) {
          const mapped: Listing[] = snap.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              title: data.title ?? "Untitled listing",
              propertyType: data.propertyType ?? "Student residence",
              monthlyFrom: parseMoney(data.monthlyFrom),
              totalRooms:
                typeof data.totalRooms === "number" ? data.totalRooms : null,
              distanceToCampus: data.distanceToCampus ?? "",
              availableFrom: data.availableFrom ?? "",
              description: data.description ?? "",
              roomTypes: Array.isArray(data.roomTypes) ? data.roomTypes : [],
              area: data.area ?? "",
              campus: data.campus ?? "",
              city: data.city ?? "",
              landlordName: data.landlordName ?? "",
            };
          });

          setListings(mapped);
          setUsingSamples(false);
        } else {
          // stay on samples
          setListings(sampleListings);
          setUsingSamples(true);
        }
      } catch (err) {
        console.error("Error loading listings, using samples instead:", err);
        setListings(sampleListings);
        setUsingSamples(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const term = search.trim().toLowerCase();

      if (term) {
        const haystack = (
          listing.title +
          " " +
          listing.propertyType +
          " " +
          (listing.description ?? "") +
          " " +
          buildLocation(listing)
        ).toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (campusFilter !== "all") {
        if ((listing.campus ?? "").toLowerCase() !== campusFilter) return false;
      }

      if (typeFilter !== "all") {
        if ((listing.propertyType ?? "").toLowerCase() !== typeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [listings, search, campusFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/rooms" className="text-[#0e2756]">
            Browse rooms
          </Link>
          <Link
            href="/landlord-dashboard"
            className="hidden text-[#0e2756] md:inline"
          >
            Landlord
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-[#ff0f64] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)] md:inline"
          >
            Signup
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#0e2756]">
            Login
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* HEADER */}
        <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
              Browse available rooms
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              Student accommodation near MUST
            </h1>
            <p className="mt-2 text-sm text-[#5f6b85]">
              Compare different houses and residences – location, price and room
              types – all in one place.
            </p>
            {usingSamples && (
              <p className="mt-1 text-[11px] text-[#9ba3c4]">
                You&apos;re seeing sample listings. Once landlords start
                creating real listings, they&apos;ll appear here automatically.
              </p>
            )}
          </div>

          {/* Search + filters */}
          <div className="flex flex-col gap-2 text-xs md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-semibold text-[#5f6b85]">
                Search by name, area or description
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#d9deef] bg-white px-3 py-2 text-xs outline-none focus:border-[#ff0f64]"
                placeholder="e.g. Ndata house with Wi-Fi"
              />
            </div>
          </div>
        </section>

        {/* SMALL FILTER ROW */}
        <section className="mb-5 flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#5f6b85]">Campus</span>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="rounded-full border border-[#d9deef] bg-white px-3 py-1.5 outline-none"
            >
              <option value="all">All</option>
              <option value="must">MUST</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#5f6b85]">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-full border border-[#d9deef] bg-white px-3 py-1.5 outline-none"
            >
              <option value="all">Any</option>
              <option value="student residence">Student residence</option>
              <option value="house">House</option>
              <option value="lodge-style student housing">
                Lodge-style student housing
              </option>
            </select>
          </div>

          <div className="ml-auto text-[11px] text-[#5f6b85]">
            {loading
              ? "Loading listings..."
              : `${filtered.length} place${
                  filtered.length === 1 ? "" : "s"
                } found`}
          </div>
        </section>

        {/* LISTINGS GRID */}
        <section className="space-y-4">
          {filtered.map((listing) => {
            const location = buildLocation(listing);
            const roomTypeLabel =
              listing.roomTypes && listing.roomTypes.length > 0
                ? `${listing.roomTypes.slice(0, 2).join(" • ")}${
                    listing.roomTypes.length > 2 ? " +" : ""
                  }`
                : "Room types not specified yet";

            return (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-[0_18px_35px_rgba(0,0,0,0.06)] md:flex-row"
              >
                {/* LEFT: Fake image / badge area */}
                <div className="flex w-full items-stretch md:w-2/5">
                  <div className="relative flex h-44 w-full items-end justify-between overflow-hidden rounded-2xl bg-gradient-to-tr from-[#0e2756] via-[#1e3a8a] to-[#ff0f64] px-4 py-3 text-xs text-white md:h-48">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">
                        {listing.propertyType || "Student residence"}
                      </p>
                      <p className="mt-1 text-sm font-extrabold leading-snug">
                        {listing.title}
                      </p>
                      {location && (
                        <p className="mt-1 text-[11px] text-white/80">
                          {location}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                        From
                      </p>
                      <p className="text-lg font-extrabold">
                        {formatMoney(listing.monthlyFrom)}
                      </p>
                      <p className="text-[11px] text-white/70">
                        per month (approx.)
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Details */}
                <div className="flex flex-1 flex-col justify-between text-xs text-[#5f6b85]">
                  <div>
                    {listing.description && (
                      <p className="text-[11px] text-[#5f6b85]">
                        {listing.description}
                      </p>
                    )}

                    <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-[#0e2756]">
                          Rooms:
                        </span>{" "}
                        {listing.totalRooms
                          ? `${listing.totalRooms} in total`
                          : "Not specified yet"}
                      </p>
                      <p>
                        <span className="font-semibold text-[#0e2756]">
                          Distance:
                        </span>{" "}
                        {listing.distanceToCampus || "To be confirmed"}
                      </p>
                      <p>
                        <span className="font-semibold text-[#0e2756]">
                          Room types:
                        </span>{" "}
                        {roomTypeLabel}
                      </p>
                      <p>
                        <span className="font-semibold text-[#0e2756]">
                          Available from:
                        </span>{" "}
                        {listing.availableFrom || "Flexible / on request"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-[#edf0fb] pt-3 text-[11px] md:flex-row md:items-center">
                    <div className="text-[#9ba3c4]">
                      {listing.landlordName && (
                        <p>
                          Listed by{" "}
                          <span className="font-semibold text-[#0e2756]">
                            {listing.landlordName}
                          </span>
                        </p>
                      )}
                      <p>
                        Click &quot;View details&quot; to see more info and
                        start an enquiry flow later.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-[#ccd1ea] bg-white px-4 py-2 text-[11px] font-semibold text-[#0e2756]">
                        ❤️ Save room
                      </button>
                      <Link
                        href={`/room?id=${listing.id}`}
                        className="rounded-full bg-[#ff0f64] px-5 py-2 text-[11px] font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)]"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <p className="mt-6 text-center text-sm text-[#5f6b85]">
              No places match your filters yet. Try clearing your search or
              campus filters.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
