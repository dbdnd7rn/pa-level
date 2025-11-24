// app/room/RoomPageClient.tsx
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { getClientDb } from "../../lib/firebaseClient";
import { useAuth } from "../_components/AuthProvider";

type Listing = {
  id: string;
  title: string;
  propertyType: string;
  monthlyFrom?: number | null;
  totalRooms?: number | null;
  distanceToCampus?: string;
  availableFrom?: string | null;
  description?: string;
  roomTypes?: string[];
  area?: string;
  campus?: string;
  city?: string;
  landlordName?: string;
  imageUrls?: string[];
};

// ✅ Hosted via jsDelivr (your repo)
const defaultHeroImages = [
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-1.jpg",
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-2.jpg",
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-3.jpg",
  "https://cdn.jsdelivr.net/gh/dbdnd7rn/pa-level@main/assets/listings/sample-2/room-4.jpg",
];

// Sample listings used when there is no Firestore doc
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
    distanceToCampus: "1 – 3km",
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
  {
    id: "sample-3",
    title: "Campus View Lodge",
    propertyType: "House",
    monthlyFrom: 110000,
    totalRooms: 20,
    distanceToCampus: "3 – 5km",
    availableFrom: "2026-02",
    description:
      "Lodge-style student rooms with private bathrooms and shared kitchens.",
    roomTypes: ["Single rooms", "Self-contained units"],
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    landlordName: "Campus View",
    imageUrls: defaultHeroImages,
  },
];

function mapFirestoreListing(id: string, data: any): Listing {
  // Try to normalise monthlyFrom into a number
  let monthlyFrom: number | null = null;
  if (typeof data.monthlyFrom === "number") {
    monthlyFrom = data.monthlyFrom;
  } else if (typeof data.monthlyFrom === "string") {
    const digits = data.monthlyFrom.replace(/[^\d]/g, "");
    monthlyFrom = digits ? parseInt(digits, 10) : null;
  } else if (typeof data.priceFrom === "number") {
    monthlyFrom = data.priceFrom;
  }

  const images =
    Array.isArray(data.imageUrls) && data.imageUrls.length > 0
      ? data.imageUrls
      : defaultHeroImages;

  return {
    id,
    title: data.title ?? "Untitled listing",
    propertyType: data.propertyType ?? "Student residence",
    monthlyFrom,
    totalRooms: data.totalRooms ?? null,
    distanceToCampus:
      data.distanceToCampus ?? data.distance ?? "Distance not provided",
    availableFrom: data.availableFrom ?? null,
    description:
      data.description ??
      "Landlord hasn’t added a full description yet. Check back soon.",
    roomTypes:
      Array.isArray(data.roomTypes) && data.roomTypes.length > 0
        ? data.roomTypes
        : [],
    area: data.area ?? "",
    campus: data.campus ?? "",
    city: data.city ?? "",
    landlordName: data.landlordName ?? "Landlord",
    imageUrls: images,
  };
}

function formatPrice(amount?: number | null) {
  if (!amount) return "Ask landlord";
  return `K${amount.toLocaleString("en-MW")}`;
}

export default function RoomPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<string | null>(null);

  // 🔥 related / "More places like this"
  const [relatedListings, setRelatedListings] = useState<Listing[] | null>(
    null
  );
  const [relatedLoading, setRelatedLoading] = useState(false);

  const listingIdFromUrl = searchParams.get("id");

  // Load listing from Firestore, else fall back to samples
  useEffect(() => {
    const load = async () => {
      const id = listingIdFromUrl;

      // No ID → just show first sample
      if (!id) {
        setListing(sampleListings[0]);
        setUsingSample(true);
        setLoading(false);
        return;
      }

      try {
        const db = getClientDb();
        const ref = doc(db, "listings", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setListing(mapFirestoreListing(snap.id, snap.data()));
          setUsingSample(false);
        } else {
          const fallback =
            sampleListings.find((s) => s.id === id) ?? sampleListings[0];
          setListing(fallback);
          setUsingSample(true);
        }
      } catch (err) {
        console.error("Error loading listing:", err);
        const fallback = sampleListings[0];
        setListing(fallback);
        setUsingSample(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [listingIdFromUrl]);

  // Load related listings from Firestore for "More places like this"
  useEffect(() => {
    const loadRelated = async () => {
      if (!listing || usingSample) {
        setRelatedListings(null);
        return;
      }

      try {
        setRelatedLoading(true);
        const db = getClientDb();
        const colRef = collection(db, "listings");

        // 👇 this is the bit that was giving you errors – now simplified
        const qRef = listing.campus
          ? query(
              colRef,
              where("campus", "==", listing.campus),
              limit(10)
            )
          : query(colRef, limit(10));

        const snap = await getDocs(qRef);

        const others: Listing[] = snap.docs
          .filter((docSnap) => docSnap.id !== listing.id)
          .map((docSnap) => mapFirestoreListing(docSnap.id, docSnap.data()))
          .slice(0, 3);

        setRelatedListings(others);
      } catch (err) {
        console.error("Error loading related listings:", err);
        setRelatedListings([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadRelated();
  }, [listing, usingSample]);

  const photos = useMemo(() => {
    const imgs =
      listing?.imageUrls && listing.imageUrls.length > 0
        ? listing.imageUrls
        : defaultHeroImages;
    if (imgs.length >= 4) return imgs.slice(0, 4);
    // Ensure at least 4 slots for the layout
    return [...imgs, ...defaultHeroImages].slice(0, 4);
  }, [listing]);

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 4);

  const moreLikeThis = useMemo(() => {
    if (usingSample) {
      return sampleListings.filter((s) => s.id !== listing?.id).slice(0, 3);
    }
    if (relatedListings && relatedListings.length > 0) {
      return relatedListings;
    }
    return [];
  }, [listing, usingSample, relatedListings]);

  const locationLine = [listing?.area, listing?.campus, listing?.city]
    .filter(Boolean)
    .join(" • ");

  const availableFromLabel = listing?.availableFrom
    ? listing.availableFrom
    : "Flexible / to be confirmed";

  const handleSaveRoom = async () => {
    if (!listing) return;

    if (!user) {
      router.push(`/login?next=/room?id=${encodeURIComponent(listing.id)}`);
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);

      const priceFromDisplay = listing.monthlyFrom
        ? `${formatPrice(listing.monthlyFrom)} / month`
        : "";

      const db = getClientDb();
      const ref = doc(db, "users", user.uid, "savedRooms", listing.id);
      await setDoc(ref, {
        listingId: listing.id,
        title: listing.title,
        area: listing.area ?? "",
        campus: listing.campus ?? "",
        city: listing.city ?? "",
        priceFrom: priceFromDisplay,
        status: "saved",
        createdAt: serverTimestamp(),
      });

      setSaveMessage("Room saved to your dashboard.");
    } catch (err) {
      console.error("Error saving room:", err);
      setSaveMessage("Could not save this room. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEnquirySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    if (!user) {
      router.push(`/login?next=/room?id=${encodeURIComponent(listing.id)}`);
      return;
    }

    if (!enquiryMsg.trim()) {
      setEnquiryStatus("Please write a short message first.");
      return;
    }

    try {
      setEnquirySubmitting(true);
      setEnquiryStatus(null);

      const db = getClientDb();
      const ref = collection(db, "users", user.uid, "enquiries");
      await addDoc(ref, {
        listingId: listing.id,
        listingTitle: listing.title,
        message: enquiryMsg.trim(),
        createdAt: serverTimestamp(),
        status: "new",
      });

      setEnquiryMsg("");
      setEnquiryStatus(
        "Enquiry sent. In a real version this would notify the landlord."
      );
    } catch (err) {
      console.error("Error creating enquiry:", err);
      setEnquiryStatus("Something went wrong. Please try again.");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  if (loading || !listing) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#0e2756]">pa</span>
            <span className="text-[#ff0f64]">level</span>
          </Link>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm text-[#5f6b85]">Loading room details…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0e2756]">
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

      {/* HERO GALLERY */}
      <section className="mx-auto max-w-6xl px-6 pb-6">
        <div className="grid gap-3 md:grid-cols-[2fr,1.2fr]">
          <div className="overflow-hidden rounded-3xl">
            {mainPhoto && (
              <img
                src={mainPhoto}
                alt={listing.title}
                className="h-[260px] w-full object-cover sm:h-[340px] md:h-[380px]"
              />
            )}
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            {sidePhotos.map((src, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-3xl">
                <img
                  src={src}
                  alt={`${listing.title} photo ${idx + 2}`}
                  className="h-[120px] w-full object-cover sm:h-[160px] md:h-[180px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-10 lg:grid-cols-[2fr,1.2fr]">
          {/* LEFT: DETAILS */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
              {listing.propertyType}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {listing.title}
            </h1>

            {locationLine && (
              <p className="mt-2 text-sm text-[#5f6b85]">{locationLine}</p>
            )}

            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                  Rooms & leases
                </p>
                <p>
                  {listing.totalRooms
                    ? `${listing.totalRooms} rooms`
                    : "Room-by-room leases"}
                </p>
                <p className="text-[11px] text-[#5f6b85]">
                  {listing.roomTypes && listing.roomTypes.length > 0
                    ? listing.roomTypes.join(" • ")
                    : "Landlord will confirm exact room types."}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                  Distance to campus
                </p>
                <p>{listing.distanceToCampus}</p>
                <p className="text-[11px] text-[#5f6b85]">
                  Check with the landlord for exact directions.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                  Availability
                </p>
                <p>{availableFromLabel}</p>
                <p className="text-[11px] text-[#5f6b85]">
                  Dates are indicative – landlord can confirm on enquiry.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-[#edf0fb] bg-[#f9fafc] px-5 py-4 text-sm">
              <h2 className="text-sm font-extrabold">About this place</h2>
              <p className="mt-2 text-sm text-[#5f6b85]">
                {listing.description}
              </p>
              {usingSample && (
                <p className="mt-2 text-[11px] text-[#9ba3c4]">
                  This is sample copy. Once landlords add full descriptions,
                  they&apos;ll appear here.
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-extrabold">General information</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#5f6b85]">
                  <li>Deposit and admin fees confirmed by landlord.</li>
                  <li>
                    Wi-Fi, power backup and security depend on the property.
                  </li>
                  <li>
                    Always view in person, or via trusted agents, before paying
                    any money.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Location</h3>
                <p className="mt-2 text-sm text-[#5f6b85]">
                  Exact address is shared by the landlord once you enquire.
                  This listing is near{" "}
                  <span className="font-semibold">
                    {listing.campus || "your campus"}
                  </span>{" "}
                  in {listing.city || "the area"}.
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT: PRICING / ENQUIRY CARD */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white px-5 py-5 shadow-[0_22px_45px_rgba(0,0,0,0.12)] text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ba3c4]">
                Rooms in {listing.propertyType.toLowerCase()} for rent
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xs text-[#5f6b85]">from</span>
                <span className="text-2xl font-extrabold">
                  {formatPrice(listing.monthlyFrom)}
                </span>
                <span className="text-xs text-[#5f6b85]">/ month</span>
              </div>
              <p className="mt-2 text-xs text-[#5f6b85]">
                Available from{" "}
                <span className="font-semibold">{availableFromLabel}</span>
              </p>

              <button
                onClick={() => setShowEnquiry((prev) => !prev)}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-[#ff0f64] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(255,15,100,0.6)]"
              >
                {showEnquiry ? "Close enquiry form" : "Enquire"}
              </button>

              <button
                type="button"
                onClick={handleSaveRoom}
                disabled={saving}
                className="mt-2 flex w-full items-center justify-center rounded-full border border-[#ffd0e2] bg-[#fff3f8] px-4 py-2 text-xs font-semibold text-[#ff0f64]"
              >
                {saving ? "Saving…" : "Save this room"}
              </button>

              {saveMessage && (
                <p className="mt-2 text-[11px] text-[#5f6b85]">{saveMessage}</p>
              )}

              {showEnquiry && (
                <form
                  onSubmit={handleEnquirySubmit}
                  className="mt-4 rounded-2xl bg-[#f6f7fb] px-4 py-3 text-xs"
                >
                  <p className="font-semibold text-[#0e2756]">
                    Message to landlord
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6b85]">
                    This is a simple placeholder. In a future version this will
                    send directly to the landlord&apos;s inbox.
                  </p>
                  <textarea
                    className="mt-2 h-20 w-full rounded-2xl border border-[#d9deef] bg-white px-3 py-2 text-xs outline-none focus:border-[#ff0f64]"
                    placeholder="Hi, I’m interested in this room. Is it still available for [month/year]? Do you offer single / sharing rooms?"
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="mt-2 inline-flex rounded-full bg-[#0e2756] px-4 py-2 text-[11px] font-semibold text-white"
                  >
                    {enquirySubmitting ? "Sending…" : "Send enquiry"}
                  </button>
                  {enquiryStatus && (
                    <p className="mt-2 text-[11px] text-[#5f6b85]">
                      {enquiryStatus}
                    </p>
                  )}
                </form>
              )}

              <div className="mt-4 border-t border-[#edf0fb] pt-3 text-[11px] text-[#9ba3c4]">
                <p>
                  Managed by{" "}
                  <span className="font-semibold text-[#0e2756]">
                    {listing.landlordName}
                  </span>
                  .{" "}
                  {usingSample &&
                    "This is demo data – real landlord badges and response times can live here later."}
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* MORE PLACES LIKE THIS */}
        <section className="mt-12">
          <h2 className="text-lg font-extrabold">More places like this</h2>
          <p className="mt-1 text-xs text-[#5f6b85]">
            Similar student accommodation near {listing.campus || "your campus"}.
          </p>

          {relatedLoading && !usingSample && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-[#e1e6ff]"
                />
              ))}
            </div>
          )}

          {!relatedLoading && moreLikeThis.length > 0 && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {moreLikeThis.map((item) => {
                const firstPhoto =
                  item.imageUrls && item.imageUrls.length > 0
                    ? item.imageUrls[0]
                    : defaultHeroImages[0];

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
                        className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="px-4 py-3 text-xs">
                      <p className="text-sm font-semibold group-hover:text-[#ff0f64]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11px] text-[#9ba3c4]">
                        {[item.area, item.campus, item.city]
                          .filter(Boolean)
                          .join(" • ")}
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

          {!relatedLoading && !usingSample && moreLikeThis.length === 0 && (
            <p className="mt-4 text-[11px] text-[#9ba3c4]">
              No similar live listings yet. As more landlords add rooms, they’ll
              appear here.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
