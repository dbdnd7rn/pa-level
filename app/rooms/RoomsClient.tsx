// app/rooms/RoomsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Firebase (client only)
import {
  getClientAuth,
  getClientDb,
} from "@/lib/firebaseClient"; // make sure this file exists as we set up earlier

import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

type Listing = {
  id: string;
  title: string;
  propertyType?: string;
  monthlyFrom?: number | null;
  totalRooms?: number | null;
  distanceToCampus?: string;
  availableFrom?: string;
  description?: string;
  roomTypes?: string[];
  area?: string;
  campus?: string;
  city?: string;
  landlordName?: string;
  imageUrls?: string[];
};

export default function RoomsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // url filters
  const q = (searchParams.get("q") || "").trim();
  const campusFilter = (searchParams.get("campus") || "").trim();
  const cityFilter = (searchParams.get("city") || "").trim();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // fetch listings from Firestore (client side)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const db = getClientDb();

        // basic query; refine later if you add indices/fields
        const base = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc"),
          limit(50)
        );

        const snap = await getDocs(base);
        if (cancelled) return;

        const rows: Listing[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        // If your DB is empty during development, you can show samples:
        const fallback: Listing[] = [
          {
            id: "sample-1",
            title: "Pa-Level Sample House 1 | Ndata",
            propertyType: "House",
            monthlyFrom: 80000,
            totalRooms: 32,
            distanceToCampus: "< 1km (walking)",
            availableFrom: "February 2026",
            description:
              "Bright rooms near campus. Common lounge, study spaces.",
            roomTypes: ["Single", "Double", "Triple"],
            area: "Ndata",
            campus: "MUST",
            city: "Thyolo",
            landlordName: "Pa-Level Estates",
            imageUrls: [],
          },
          {
            id: "sample-2",
            title: "Pa-Level Sample House 2 | Ndata",
            propertyType: "Student Residence",
            monthlyFrom: 80000,
            totalRooms: 48,
            distanceToCampus: "1.2km",
            availableFrom: "February 2026",
            description: "Newly built, Wi-Fi included, common areas cleaned.",
            roomTypes: ["Single", "Double"],
            area: "Ndata",
            campus: "MUST",
            city: "Thyolo",
            landlordName: "Pa-Level Estates",
            imageUrls: [],
          },
          {
            id: "sample-3",
            title: "Pa-Level Sample House 3 | Ndata",
            propertyType: "Student Residence",
            monthlyFrom: 80000,
            totalRooms: 60,
            distanceToCampus: "2.0km",
            availableFrom: "February 2026",
            description: "Spacious rooms, good sunlight, secure.",
            roomTypes: ["Single", "Double", "Triple", "Quad"],
            area: "Ndata",
            campus: "MUST",
            city: "Thyolo",
            landlordName: "Pa-Level Estates",
            imageUrls: [],
          },
        ];

        setListings(rows.length ? rows : fallback);
      } catch {
        // In case Firebase is not reachable yet, show samples so UI works
        setListings((prev) => (prev.length ? prev : []));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // text filter
  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return listings.filter((l) => {
      const matchesQ =
        !needle ||
        [
          l.title,
          l.description,
          l.area,
          l.campus,
          l.city,
          l.landlordName,
          l.propertyType,
        ]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(needle));

      const matchesCampus = !campusFilter
        ? true
        : (l.campus || "").toLowerCase() === campusFilter.toLowerCase();

      const matchesCity = !cityFilter
        ? true
        : (l.city || "").toLowerCase() === cityFilter.toLowerCase();

      return matchesQ && matchesCampus && matchesCity;
    });
  }, [listings, q, campusFilter, cityFilter]);

  // save to users/{uid}/savedRooms/{listingId}
  async function handleSave(listing: Listing) {
    try {
      setSavingIds((m) => ({ ...m, [listing.id]: true }));
      const auth = getClientAuth();
      const db = getClientDb();

      const user = auth.currentUser;
      if (!user) {
        // take them to login with a returnTo param
        router.push(`/login?returnTo=/room?id=${encodeURIComponent(listing.id)}`);
        return;
      }

      await setDoc(
        doc(db, "users", user.uid, "savedRooms", listing.id),
        {
          listingId: listing.id,
          title: listing.title || "",
          savedAt: serverTimestamp(),
          monthlyFrom: listing.monthlyFrom ?? null,
          city: listing.city ?? "",
          campus: listing.campus ?? "",
        },
        { merge: true }
      );

      setSaved((m) => ({ ...m, [listing.id]: true }));
    } catch (e) {
      console.error("save failed", e);
      alert("Could not save this room. Please try again.");
    } finally {
      setSavingIds((m) => ({ ...m, [listing.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-[0_18px_35px_rgba(0,0,0,0.06)]">
        Loading rooms…
      </div>
    );
  }

  return (
    <>
      {/* results header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[#5f6b85]">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
          {q ? (
            <span>
              {" "}
              for <span className="font-semibold text-[#0e2756]">“{q}”</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {filtered.map((l) => {
          const price =
            typeof l.monthlyFrom === "number"
              ? new Intl.NumberFormat("en-US").format(l.monthlyFrom)
              : null;

          return (
            <div
              key={l.id}
              className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
            >
              {/* image */}
              <button
                onClick={() => router.push(`/room?id=${encodeURIComponent(l.id)}`)}
                className="block h-40 w-full bg-[#c8d6ff] focus:outline-none"
                title={l.title}
              >
                {/* when you have real images, render <img src={l.imageUrls?.[0]} .../> */}
              </button>

              {/* body */}
              <div className="space-y-1 px-5 py-4 text-sm">
                <p className="text-xs font-semibold text-[#ff0f64]">
                  {l.propertyType || "Student Residence"} •{" "}
                  {(l.roomTypes?.length || 0) > 0
                    ? `${l.roomTypes?.length} room types available`
                    : "room types available"}
                </p>

                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() =>
                      router.push(`/room?id=${encodeURIComponent(l.id)}`)
                    }
                    className="text-left text-sm font-bold hover:underline"
                    title={l.title}
                  >
                    {l.title}
                  </button>

                  <button
                    onClick={() => handleSave(l)}
                    disabled={!!savingIds[l.id]}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      saved[l.id]
                        ? "bg-[#0e2756] text-white"
                        : "bg-[#f1f3fa] text-[#0e2756]"
                    }`}
                    title="Save this room"
                  >
                    {saved[l.id] ? "Saved" : "Save"}
                  </button>
                </div>

                <p className="text-xs text-[#5f6b85]">
                  {l.city || l.area || ""} {l.campus ? `• ${l.campus}` : ""}
                </p>

                <p className="pt-1 text-xs">
                  From{" "}
                  <span className="text-base font-bold text-[#0e2756]">
                    {price ? `K${price}` : "—"}
                  </span>{" "}
                  / month
                </p>

                <div className="pt-2 flex gap-2">
                  <Link
                    href={`/contact?listingId=${encodeURIComponent(l.id)}`}
                    className="rounded-full bg-[#ff0f64] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(255,15,100,0.35)]"
                  >
                    Enquire
                  </Link>
                  <button
                    onClick={() =>
                      router.push(`/room?id=${encodeURIComponent(l.id)}`)
                    }
                    className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#0e2756] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* “More places like this” strip (simple, uses the same list for now) */}
      <div className="mt-10">
        <h3 className="mb-4 text-sm font-bold">More places like this</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {filtered.slice(0, 12).map((l) => (
            <button
              key={`more-${l.id}`}
              onClick={() => router.push(`/room?id=${encodeURIComponent(l.id)}`)}
              className="min-w-[240px] rounded-2xl bg-white p-3 text-left shadow-[0_12px_22px_rgba(0,0,0,0.06)]"
              title={l.title}
            >
              <div className="h-24 w-full rounded-xl bg-[#c8d6ff]" />
              <div className="mt-2 text-xs font-semibold line-clamp-2">
                {l.title}
              </div>
              <div className="text-[11px] text-[#5f6b85]">
                {l.city || l.campus || ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
