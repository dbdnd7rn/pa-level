// app/map/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { getClientDb } from "../../lib/firebaseClient";

type MapListing = {
  id: string;
  title: string;
  campus?: string;
  area?: string;
  city?: string;
  monthlyFrom?: number | null;
  coordX?: number | null;
  coordY?: number | null;
};

function formatPrice(amount?: number | null) {
  if (!amount) return "Ask landlord";
  return `K${amount.toLocaleString("en-MW")}`;
}

export default function MapPage() {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const db = getClientDb();
        const colRef = collection(db, "listings");

        // ✅ Correct Firestore usage: build a query, then pass to getDocs
        const q = query(colRef, limit(50));
        const snap = await getDocs(q);

        const rooms: MapListing[] = snap.docs.map((docSnap) => {
          const data: any = docSnap.data();

          let monthlyFrom: number | null = null;
          if (typeof data.monthlyFrom === "number") {
            monthlyFrom = data.monthlyFrom;
          } else if (typeof data.monthlyFrom === "string") {
            const digits = data.monthlyFrom.replace(/[^\d]/g, "");
            monthlyFrom = digits ? parseInt(digits, 10) : null;
          } else if (typeof data.priceFrom === "number") {
            monthlyFrom = data.priceFrom;
          }

          const coordX =
            typeof data.coordX === "number" && !Number.isNaN(data.coordX)
              ? data.coordX
              : null;
          const coordY =
            typeof data.coordY === "number" && !Number.isNaN(data.coordY)
              ? data.coordY
              : null;

          return {
            id: docSnap.id,
            title: data.title ?? "Untitled listing",
            campus: data.campus ?? "",
            area: data.area ?? "",
            city: data.city ?? "",
            monthlyFrom,
            coordX,
            coordY,
          };
        });

        setListings(rooms);
      } catch (err) {
        console.error("Error loading map listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>

        <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">
          <Link href="/rooms" className="text-[#0e2756]">
            Browse rooms
          </Link>
          <Link
            href="/tenant-dashboard"
            className="hidden text-[#0e2756] md:inline"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="mt-4">
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Rooms with location pins
          </h1>
          <p className="mt-2 text-sm text-[#5f6b85]">
            These listings have X/Y coordinates saved by landlords. You can open
            them directly in Google Maps.
          </p>

          {loading && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-3xl bg-[#dde6ff]"
                />
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <p className="mt-6 text-sm text-[#9ba3c4]">
              No listings with coordinates yet. Once landlords start adding X/Y
              values, they’ll appear here.
            </p>
          )}

          {!loading && listings.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {listings.map((room) => {
                const hasCoords =
                  room.coordX != null &&
                  !Number.isNaN(room.coordX) &&
                  room.coordY != null &&
                  !Number.isNaN(room.coordY);

                const mapsHref = hasCoords
                  ? `https://www.google.com/maps?q=${room.coordY},${room.coordX}`
                  : null;

                return (
                  <div
                    key={room.id}
                    className="rounded-3xl bg-white p-4 text-sm shadow-[0_14px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#ff0f64]">
                          {room.campus || "Student residence"}
                        </p>
                        <p className="mt-1 text-sm font-bold">{room.title}</p>
                        <p className="mt-1 text-[11px] text-[#9ba3c4]">
                          {[room.area, room.campus, room.city]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        <p className="mt-1 text-[11px] text-[#5f6b85]">
                          From{" "}
                          <span className="font-semibold">
                            {formatPrice(room.monthlyFrom)}
                          </span>{" "}
                          / month
                        </p>
                      </div>

                      {hasCoords && mapsHref && (
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-shrink-0 items-center rounded-full bg-[#fff3f8] px-3 py-1 text-[11px] font-semibold text-[#ff0f64]"
                        >
                          📍 View on map
                        </a>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-[#5f6b85]">
                      <Link
                        href={`/room?id=${room.id}`}
                        className="font-semibold text-[#0e2756] underline underline-offset-4"
                      >
                        Open room page
                      </Link>
                      {hasCoords ? (
                        <span>Coordinates saved</span>
                      ) : (
                        <span>No coordinates yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
