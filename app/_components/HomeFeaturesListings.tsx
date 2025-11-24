// app/_components/HomeFeaturedListings.tsx
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

function normaliseMonthlyFrom(data: any): number | null {
  if (typeof data?.monthlyFrom === "number") return data.monthlyFrom;
  if (typeof data?.monthlyFrom === "string") {
    const digits = data.monthlyFrom.replace(/[^\d]/g, "");
    return digits ? parseInt(digits, 10) : null;
  }
  if (typeof data?.priceFrom === "number") return data.priceFrom;
  return null;
}

function formatPrice(amount?: number | null) {
  if (!amount) return "Ask landlord";
  return `K${amount.toLocaleString("en-MW")}`;
}

export default function HomeFeaturedListings() {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const db = getClientDb();
        const snap = await getDocs(collection(db, "listings"));
        const docs: ListingCard[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const monthlyFrom = normaliseMonthlyFrom(data);
          const imageUrls = Array.isArray(data.imageUrls)
            ? data.imageUrls
            : [];

          return {
            id: docSnap.id,
            title: data.title ?? "Untitled listing",
            area: data.area ?? "",
            campus: data.campus ?? "",
            city: data.city ?? "",
            monthlyFrom,
            imageUrls,
          };
        });

        setListings(docs);
      } catch (err) {
        console.error("Error loading featured listings for home:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const featuredListings = useMemo(
    () => listings.slice(0, 4),
    [listings]
  );

  const showEmptyState = !loading && featuredListings.length === 0;

  return (
    <section className="mt-12 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0e2756] sm:text-lg">
            Available rooms right now
          </h2>
          <p className="mt-1 text-[11px] text-[#5f6b85] sm:text-xs">
            Live listings from landlords using Pa-Level.
          </p>
        </div>

        <Link
          href="/rooms"
          className="rounded-full bg-[#ff0f64] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(255,15,100,0.45)] sm:px-5 sm:py-2 sm:text-sm"
        >
          More rooms →
        </Link>
      </div>

      {loading && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-[#e1e6ff] animate-pulse"
            />
          ))}
        </div>
      )}

      {showEmptyState && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d9deef] bg-white px-4 py-5 text-xs text-[#5f6b85] sm:text-sm">
          <p className="font-semibold text-[#0e2756]">
            No live listings yet.
          </p>
          <p className="mt-1">
            As soon as landlords publish rooms, you’ll see up to four of them
            featured here. For now, you can still browse the full rooms page.
          </p>
        </div>
      )}

      {!loading && featuredListings.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {featuredListings.map((item) => {
            const firstPhoto =
              item.imageUrls && item.imageUrls.length > 0
                ? item.imageUrls[0]
                : "https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg";

            const location = [item.area, item.campus, item.city]
              .filter(Boolean)
              .join(" • ");

            return (
              <Link
                key={item.id}
                href={`/room?id=${encodeURIComponent(item.id)}`}
                className="group overflow-hidden rounded-2xl border border-[#edf0fb] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="overflow-hidden">
                  <img
                    src={firstPhoto}
                    alt={item.title}
                    className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-32"
                  />
                </div>
                <div className="px-4 py-3 text-[11px] sm:text-xs">
                  <p className="line-clamp-2 text-sm font-semibold group-hover:text-[#ff0f64]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9ba3c4]">
                    {location || "Location to be confirmed"}
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6b85]">
                    From{" "}
                    <span className="font-semibold">
                      {formatPrice(item.monthlyFrom)}
                    </span>{" "}
                    / month
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
