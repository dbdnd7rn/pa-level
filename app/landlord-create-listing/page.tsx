// app/landlord-create-listing/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { useAuth } from "../_components/AuthProvider";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getClientDb } from "@/lib/firebaseClient";

export default function LandlordCreateListingPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // BASIC INFO
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("Student residence");
  const [monthlyFrom, setMonthlyFrom] = useState("");
  const [totalRooms, setTotalRooms] = useState("");

  // LOCATION
  const [area, setArea] = useState("");
  const [campus, setCampus] = useState("MUST");
  const [city, setCity] = useState("Thyolo");

  const [distanceToCampus, setDistanceToCampus] = useState("< 1km (walking)");
  const [availableFrom, setAvailableFrom] = useState("");
  const [description, setDescription] = useState("");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  const displayName =
    user?.displayName?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");

  const handleLogout = async () => {
    await logout();
  };

  const toggleRoomType = (label: string) => {
    setRoomTypes((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // lazily get Firestore only in the browser
      const db = getClientDb();

      const monthlyNumber = monthlyFrom
        ? parseInt(monthlyFrom.replace(/[^\d]/g, ""), 10)
        : null;
      const totalRoomsNumber = totalRooms ? parseInt(totalRooms, 10) : null;

      await addDoc(collection(db, "listings"), {
        ownerId: user.uid,
        ownerEmail: user.email ?? null,
        landlordName: user.displayName ?? null,

        title: title || "Untitled listing",
        propertyType,
        monthlyFrom: monthlyNumber,
        totalRooms: totalRoomsNumber,

        // location fields
        area: area || null,
        campus: campus || null,
        city: city || null,

        distanceToCampus,
        availableFrom: availableFrom || null,
        description: description || null,
        roomTypes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccessMsg("Listing saved! It will now appear on the Browse rooms page.");

      // reset form
      setTitle("");
      setPropertyType("Student residence");
      setMonthlyFrom("");
      setTotalRooms("");
      setArea("");
      setCampus("MUST");
      setCity("Thyolo");
      setDistanceToCampus("< 1km (walking)");
      setAvailableFrom("");
      setDescription("");
      setRoomTypes([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Could not save listing.");
    } finally {
      setLoading(false);
    }
  };

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
                href="/landlord-dashboard"
                className="hidden text-[#0e2756] md:inline"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ccd1ea] bg-white px-6 py-2 text-sm font-semibold text-[#0e2756]"
              >
                Logout
              </button>
            </nav>
          </header>

          {/* HERO STRIP */}
          <section className="bg-gradient-to-b from-[#d1e4ff] to-[#f6f7fb] pb-10 pt-6">
            <div className="mx-auto max-w-5xl px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0e2756]/70">
                For landlords
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                Create your first listing
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5f6b85]">
                Hi {displayName}, give students a clear picture of your property – where it
                is, what it costs and what room types you offer.
              </p>

              {/* Stepper */}
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2 text-[#9ba3c4]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c9d0ea] text-[11px]">
                    1
                  </div>
                  <span>Landlord details</span>
                </div>
                <div className="h-px flex-1 bg-[#c9d0ea]" />
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff0f64] text-[11px] text-white">
                    2
                  </div>
                  <span>Listing details</span>
                </div>
              </div>
            </div>
          </section>

          {/* FORM CARD */}
          <main className="mx-auto max-w-5xl px-6 pb-16">
            <div className="-mt-10 rounded-3xl bg-white px-6 py-7 shadow-[0_22px_45px_rgba(0,0,0,0.12)] sm:px-8">
              {/* Make the form wrap both the grid and the footer buttons */}
              <form onSubmit={handleSubmit}>
                <div className="grid gap-8 lg:grid-cols-[1.3fr,1fr]">
                  {/* LEFT: FIELDS */}
                  <div className="space-y-6 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                        Step 2 of 2
                      </p>
                      <h2 className="mt-1 text-lg font-extrabold">
                        Basic listing information
                      </h2>
                      <p className="mt-1 text-xs text-[#5f6b85]">
                        You can always edit this later. For now we just need a clear
                        headline, rough pricing, location and room types.
                      </p>
                    </div>

                    {successMsg && (
                      <p className="rounded-2xl bg-[#ecfdf5] px-3 py-2 text-xs text-[#047857]">
                        {successMsg}
                      </p>
                    )}
                    {errorMsg && (
                      <p className="rounded-2xl bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
                        {errorMsg}
                      </p>
                    )}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                        Listing title
                      </label>
                      <input
                        className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                        placeholder="e.g. Bright student house 5 min from MUST gate"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <p className="mt-1 text-[11px] text-[#9ba3c4]">
                        Short, clear and inviting — students will see this first.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                          Property type
                        </label>
                        <select
                          className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-[9px] text-sm outline-none focus:border-[#ff0f64]"
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                        >
                          <option>Student residence</option>
                          <option>House</option>
                          <option>Backyard rooms</option>
                          <option>Lodge-style student housing</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                          Monthly rental from
                        </label>
                        <div className="flex items-center gap-1 rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2">
                          <span className="text-xs text-[#5f6b85]">K</span>
                          <input
                            className="w-full border-none bg-transparent text-sm outline-none"
                            placeholder="80,000"
                            value={monthlyFrom}
                            onChange={(e) => setMonthlyFrom(e.target.value)}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-[#9ba3c4]">
                          Students will still see a full range of room types and prices.
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                          Total rooms in this property
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                          placeholder="e.g. 12"
                          value={totalRooms}
                          onChange={(e) => setTotalRooms(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* LOCATION FIELDS */}
                    <div>
                      <p className="mb-2 text-xs font-semibold text-[#5f6b85]">
                        Location details
                      </p>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-[#5f6b85]">
                            Area / neighbourhood
                          </label>
                          <input
                            className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                            placeholder="e.g. Ndata"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-[#5f6b85]">
                            Campus
                          </label>
                          <select
                            className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-[9px] text-sm outline-none focus:border-[#ff0f64]"
                            value={campus}
                            onChange={(e) => setCampus(e.target.value)}
                          >
                            <option value="MUST">MUST</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-[#5f6b85]">
                            City / town
                          </label>
                          <input
                            className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                            placeholder="e.g. Thyolo"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-[#9ba3c4]">
                        These fields power the location text students see on the Browse
                        rooms and detail pages.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                          Distance to campus
                        </label>
                        <select
                          className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-[9px] text-sm outline-none focus:border-[#ff0f64]"
                          value={distanceToCampus}
                          onChange={(e) => setDistanceToCampus(e.target.value)}
                        >
                          <option>&lt; 1km (walking)</option>
                          <option>1 – 3 km</option>
                          <option>3 – 5 km</option>
                          <option>5 km + (transport needed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                          Available from
                        </label>
                        <input
                          type="month"
                          className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                          value={availableFrom}
                          onChange={(e) => setAvailableFrom(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                        Describe your place
                      </label>
                      <textarea
                        className="h-28 w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                        placeholder="Highlight Wi-Fi, power backup, security, kitchen setup, study areas, noise level and what makes your place stand out."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                        What room types do you offer?
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          "Single rooms",
                          "Sharing / double rooms",
                          "Triple / quad rooms",
                          "Self-contained units",
                        ].map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-4 py-3 text-xs"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={roomTypes.includes(type)}
                              onChange={() => toggleRoomType(type)}
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: PREVIEW / EARNINGS CARD */}
                  <aside className="space-y-5 rounded-3xl bg-[#f9fafc] px-5 py-5 text-xs text-[#5f6b85]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                      Quick estimate
                    </p>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a6bf]">
                        Example earnings
                      </p>
                      <p className="mt-2 text-xs">
                        If you fill{" "}
                        <span className="font-semibold text-[#0e2756]">10 rooms</span>{" "}
                        at K80,000 per month for a 10-month lease, you could earn:
                      </p>
                      <p className="mt-3 text-2xl font-extrabold text-[#0e2756]">K8,000,000</p>
                      <p className="text-[11px] text-[#9ba3c4]">
                        This is just a rough example. Actual earnings depend on your final
                        pricing and occupancy.
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                        Tip
                      </p>
                      <p className="mt-1 text-xs">
                        Listings with clear photos, honest descriptions and realistic
                        pricing get the most enquiries. You’ll add photos in a later
                        iteration of Pa-Level.
                      </p>
                    </div>
                  </aside>
                </div>

                {/* FOOT BUTTONS (inside the form so submit works) */}
                <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-[#e4e7f3] pt-5 text-xs sm:flex-row">
                  <button
                    type="button"
                    className="rounded-full border border-[#d9deef] bg-white px-6 py-2.5 text-xs font-semibold text-[#0e2756]"
                  >
                    Save as draft (coming soon)
                  </button>

                  <div className="flex gap-3">
                    <Link
                      href="/rooms"
                      className="rounded-full bg-[#ff0f64] px-8 py-2.5 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)]"
                    >
                      Preview as a student
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-full border border-[#0e2756] bg-[#0e2756] px-8 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Save listing"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}
