// app/rooms/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { getClientDb } from "../../lib/firebaseClient";

type ListingCard = {
  id: string;
  title: string;
  area?: string;
  campus?: string;
  city?: string;
  monthlyFrom?: number | null;
  imageUrls?: string[];
};

// ✅ same CDN fallback images
const defaultHeroImages = [
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-1.jpg",
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-2.jpg",
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-3.jpg",
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-4.jpg",
];

const sampleCards: ListingCard[] = [
  {
    id: "sample-1",
    title: "Pa-Level House 1 | Ndata",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    monthlyFrom: 80000,
    imageUrls: defaultHeroImages,
  },
  {
    id: "sample-2",
    title: "Skylight Student Residence",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    monthlyFrom: 85000,
    imageUrls: defaultHeroImages,
  },
  {
    id: "sample-3",
    title: "Campus View Lodge",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    monthlyFrom: 110000,
    imageUrls: defaultHeroImages,
  },
];

function fmt(amount?: number | null) {
  if (!amount) return "Ask landlord";
  return `K${amount.toLocaleString("en-MW")}`;
}

export default function RoomsPage() {
  const [cards, setCards] = useState<ListingCard[]>(sampleCards);
  const [usingSample, setUsingSample] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const db = getClientDb();
        const snap = await getDocs(collection(db, "listings"));

        if (snap.empty) {
          setCards(sampleCards);
          setUsingSample(true);
          return;
        }

        const mapped: ListingCard[] = snap.docs.map((d) => {
          const data = d.data() as any;
          let monthlyFrom: number | null = null;

          if (typeof data.monthlyFrom === "number") monthlyFrom = data.monthlyFrom;
          else if (typeof data.monthlyFrom === "string") {
            const digits = data.monthlyFrom.replace(/[^\d]/g, "");
            monthlyFrom = digits ? parseInt(digits, 10) : null;
          } else if (typeof data.priceFrom === "number") monthlyFrom = data.priceFrom;

          const imageUrls =
            Array.isArray(data.imageUrls) && data.imageUrls.length > 0
              ? data.imageUrls
              : defaultHeroImages;

          return {
            id: d.id,
            title: data.title ?? "Untitled listing",
            area: data.area ?? "",
            campus: data.campus ?? "",
            city: data.city ?? "",
            monthlyFrom,
            imageUrls,
          };
        });

        setCards(mapped);
        setUsingSample(false);
      } catch (e) {
        console.error("Rooms load error:", e);
        setCards(sampleCards);
        setUsingSample(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const firstRowNote = useMemo(
    () =>
      loading
        ? "Loading real listings…"
        : usingSample
        ? "Showing sample listings for now."
        : "Powered by live listings from Firestore.",
    [loading, usingSample]
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/login" className="hidden text-[#0e2756] md:inline">
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#ff0f64] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)]"
          >
            Signup
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Header */}
        <section className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
            Browse rooms
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
            Find student accommodation near your campus
          </h1>
          <p className="mt-2 text-sm text-[#5f6b85]">{firstRowNote}</p>
        </section>

        {/* Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => {
            const first = c.imageUrls && c.imageUrls.length > 0 ? c.imageUrls[0] : defaultHeroImages[0];
            return (
              <Link
                key={c.id}
                href={`/room?id=${encodeURIComponent(c.id)}`}
                className="group overflow-hidden rounded-2xl border border-[#edf0fb] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="overflow-hidden">
                  <img
                    src={first}
                    alt={c.title}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-4 py-3 text-xs">
                  <p className="text-sm font-semibold group-hover:text-[#ff0f64]">
                    {c.title}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9ba3c4]">
                    {[c.area, c.campus, c.city].filter(Boolean).join(" • ")}
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6b85]">
                    From <span className="font-semibold">{fmt(c.monthlyFrom)}</span> / month
                  </p>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
